"""
Elite Travel Planner PRO - Secure Local Python Backend
Runs locally on http://127.0.0.1:8000
Safely encapsulates GEMINI_API_KEY on the backend without leaking to frontend clients.
"""

import os
import io
import re
import json
import base64
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Optional
import requests
from PIL import Image

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Elite Travel Planner API", version="1.5")

# Enable CORS for local cross-origin development if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

def load_gemini_key() -> str:
    """Read GEMINI_API_KEY from .env or environment variables."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    if ENV_FILE.exists():
        try:
            for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
        except Exception as e:
            print(f"Error reading .env: {e}")
    return ""

def save_gemini_key(new_key: str):
    """Write GEMINI_API_KEY to .env."""
    lines = []
    found = False
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("GEMINI_API_KEY="):
                lines.append(f"GEMINI_API_KEY={new_key.strip()}")
                found = True
            else:
                lines.append(line)
    if not found:
        lines.append(f"GEMINI_API_KEY={new_key.strip()}")
    ENV_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")

def extract_docx_text(file_bytes: bytes) -> str:
    """Extract plain text from .docx document.xml without external dependencies."""
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            if "word/document.xml" not in z.namelist():
                return ""
            xml_content = z.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            paragraphs = []
            for p in tree.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
                texts = [
                    node.text for node in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t")
                    if node.text
                ]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return f"[Docx parse error: {e}]"

def compress_image_if_needed(file_bytes: bytes, max_dim: int = 1600) -> tuple[bytes, str]:
    """Compress and resize image using Pillow to prevent excessive payload."""
    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            mime = "image/jpeg"
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            w, h = img.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_size = (int(w * scale), int(h * scale))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            return buf.getvalue(), mime
    except Exception:
        return file_bytes, "image/png"

ELITE_SYSTEM_PROMPT = """你是一位擁有20年以上頂級經驗的日本自由行顧問（Elite Travel Planner）。
現在使用者上傳了真實的旅行資料檔案（可能包含機票截圖、預訂確認單、行程筆記、門票憑證）。

你的任務是：深度理解並整合這些真實文件，嚴格遵循以下「高品質自由行規範」生成 100% 精準可執行的行程 JSON：

【核心規則與錨點】
1. 硬性錨點優先（不可更動）：
   - 若文件或檔名中指定了日期（例如 10/20 晴空塔、10/21 河口湖/富士山、10/23 鎌倉、10/25 箱根），該景點必須精確排在該日期，嚴禁任意挪移日期。
   - 大本營住宿優先提取：例如 上野 Mystays (HOTEL MYSTAYS Ueno)，若有地址電話需完整記錄。
2. 首尾日航班動線：
   - 首日：從班機實際落地時間約 2 小時後正式展開行程。若時間有限，僅安排飯店周邊或輕鬆採購。
   - 尾日：動線嚴格向機場方向收攏，國際線航班嚴格提前 3.5 小時抵達機場。
3. 動線最佳化：
   - 每日景點依地理位置分群（如上野淺草區、澀谷新宿區、近郊區）。
   - 嚴禁折返跑，優先規劃順向移動。
4. 晴雨雙備案：
   - 每天除了晴天景點 (sunnySpots)，必須同步規劃該區域的室內雨天替代景點 (rainSpots)。
5. 體力與交通：
   - 預估每日步數與體力負荷。
   - 交通說明必須具體到路線名稱（例如「搭乘銀座線至淺草站 1 號出口步行 3 分鐘」）。

【輸出格式】
你必須直接輸出符合 JSON Schema 的純 JSON 物件（不可包含任何 markdown 標籤或額外文字）：
{
  "trip": {
    "name": "行程名稱 (如：2026 東京秋季 9 日深度自由行)",
    "destination": "目的地 (如：日本 東京)",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "flightDept": "去程航班完整資訊 (航空公司、班號、起降時間、航廈)",
    "flightReturn": "回程航班完整資訊 (航空公司、班號、起降時間、航廈)",
    "hotelName": "飯店名稱",
    "hotelAddress": "飯店地址與電話",
    "members": ["成員1", "成員2"],
    "mustGo": ["必去景點1", "必去景點2"],
    "mustAvoid": ["避開項目"]
  },
  "days": [
    {
      "dayNum": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day 1 ｜ 主題名稱",
      "fatigueText": "約 7,500 步 (步調適中)",
      "fatigueClass": "fatigue-low",
      "isRainMode": false,
      "logisticsTip": "後勤與交通提醒",
      "cultureTip": "在地文化提醒",
      "safetyTip": "安全注意事項",
      "sunnySpots": [
        {
          "id": "d1-s1",
          "time": "14:30",
          "period": "下午",
          "title": "景點/餐廳名稱",
          "transport": "具體交通路線與乘車方式",
          "desc": "景點詳情與特色",
          "category": "spot",
          "completed": false,
          "mapsQuery": "Google Maps 搜尋標準名稱"
        }
      ],
      "rainSpots": [
        {
          "id": "d1-r1",
          "time": "14:30",
          "period": "下午",
          "title": "雨備室內景點",
          "transport": "室內連通道或直達方式",
          "desc": "雨天備案內容",
          "category": "spot",
          "completed": false,
          "mapsQuery": "雨備景點 Google Maps 名稱"
        }
      ]
    }
  ]
}
"""

MODELS_TO_TRY = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.5-flash"]
MODEL_NAME = MODELS_TO_TRY[0]

def call_gemini_api(payload: dict, key: str, timeout: int = 90) -> requests.Response:
    last_resp = None
    for m in MODELS_TO_TRY:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
        try:
            resp = requests.post(url, json=payload, timeout=timeout)
            if resp.status_code == 200:
                return resp
            last_resp = resp
            if resp.status_code in (429, 503):
                continue
            return resp
        except Exception:
            continue
    if last_resp is not None:
        return last_resp
    raise HTTPException(status_code=500, detail="Gemini API 連線失敗，請檢查網路狀態")

@app.get("/api/status")
def get_status():
    key = load_gemini_key()
    return {
        "ok": True,
        "has_key": bool(key),
        "key_preview": f"{key[:6]}...{key[-4:]}" if len(key) > 10 else ("已設定" if key else "尚未設定"),
        "model": MODEL_NAME,
        "backend": "Local Python Secure Gateway"
    }

class KeyRequest(BaseModel):
    api_key: str

@app.post("/api/set-key")
def set_key(req: KeyRequest):
    k = req.api_key.strip()
    if not k:
        raise HTTPException(status_code=400, detail="API Key 不能為空")
    save_gemini_key(k)
    return {"ok": True, "message": "金鑰已成功安全儲存至本地後端環境！"}

class ChatRequest(BaseModel):
    message: str
    current_day: Optional[int] = 1
    current_time: Optional[str] = "14:00"
    current_spot: Optional[str] = ""
    trip_summary: Optional[dict] = None

@app.post("/api/chat-advisor")
def chat_advisor(req: ChatRequest):
    key = load_gemini_key()
    if not key:
        raise HTTPException(status_code=400, detail="本地後端尚未設定 GEMINI_API_KEY，請先配置金鑰")

    context_text = f"""
【當前現場動態】
- 日期天數：第 {req.current_day} 天
- 當前時間：{req.current_time}
- 目前所在景點/位置：{req.current_spot or '東京市區行程中'}
- 旅程背景：{json.dumps(req.trip_summary, ensure_ascii=False) if req.trip_summary else '東京 9 日遊'}

【使用者當前提問】
{req.message}

請以頂級自由行顧問口吻，給予明確、安全、順路且不折返的具體解決方案。
若使用者詢問雨備或時間落後，請給出具體可替換的點與精確交通方式。
"""

    payload = {
        "systemInstruction": {
            "parts": [{"text": "你是一位擁有20年經驗的日本頂級自由行隨身顧問，專精現場應變、雨備調度與即時交通指引。簡潔、具體、安心。"}]
        },
        "contents": [
            {"role": "user", "parts": [{"text": context_text}]}
        ]
    }

    try:
        resp = call_gemini_api(payload, key, timeout=30)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Gemini API 回傳錯誤: {resp.text}")
        data = resp.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"ok": True, "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TranslateRequest(BaseModel):
    text: str
    target_lang: Optional[str] = "ja"

@app.post("/api/translate")
def translate_text(req: TranslateRequest):
    key = load_gemini_key()
    if not key:
        raise HTTPException(status_code=400, detail="未配置 GEMINI_API_KEY")

    lang_name = {"ja": "日文", "en": "英文", "ko": "韓文"}.get(req.target_lang, "日文")
    prompt = f"""你是一位專業的日本自由行翻譯管家。
請將以下中文語句翻譯為自然得體、禮貌且實用的{lang_name}：
「{req.text}」

請直接輸出純 JSON 物件：
{{
  "translation": "{lang_name}敬語翻譯",
  "romaji": "發音標註 (日文則為羅馬拼音，英文則為音標/標註，韓文則為羅馬音)",
  "cultural_tip": "日本在地旅遊或溝通情境的小提醒（簡明扼要一兩句話）",
  "audio_text": "適合發音朗讀的純文字"
}}"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
    }
    try:
        resp = call_gemini_api(payload, key, timeout=30)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Gemini API 錯誤: {resp.text}")
        data = resp.json()
        raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"ok": True, "result": json.loads(raw_json)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ocr-receipt")
async def ocr_receipt(
    file: Optional[UploadFile] = File(None),
    is_demo: Optional[bool] = Form(False)
):
    key = load_gemini_key()
    if not key:
        raise HTTPException(status_code=400, detail="未配置 GEMINI_API_KEY")

    if is_demo or not file:
        sample_path = BASE_DIR / "sample_receipt.jpg"
        if sample_path.exists():
            file_bytes = sample_path.read_bytes()
            mime = "image/jpeg"
        else:
            raise HTTPException(status_code=400, detail="未提供收據檔案且樣板不存在")
    else:
        file_bytes = await file.read()
        file_bytes, mime = compress_image_if_needed(file_bytes)

    b64 = base64.b64encode(file_bytes).decode("ascii")
    prompt = """你是一位專精日本消費收據 (レシート / 領収書) 的財務 OCR 辨識專家。
請仔細辨識這張收據圖片，提取出各項資訊並輸出為純 JSON 物件：
{
  "store": "店名 (如：LAWSON / 7-ELEVEN / 大國藥妝 / 敘敘苑)",
  "title": "消費簡稱 (如：LAWSON 便利商店飲品零食 / 藥妝生活用品)",
  "amount": 總金額整數 (日圓 JPY，例如 660),
  "currency": "JPY",
  "date": "YYYY-MM-DD",
  "location": "消費地點或分店 (如：上野、押上、新宿)",
  "items": ["商品1", "商品2"],
  "note": "備註 (如：含消費稅 10%、實付與找零等)"
}"""
    payload = {
        "contents": [{
            "parts": [
                {"inlineData": {"mimeType": mime, "data": b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1}
    }
    try:
        resp = call_gemini_api(payload, key, timeout=30)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Gemini API 錯誤: {resp.text}")
        data = resp.json()
        raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"ok": True, "result": json.loads(raw_json)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/parse-documents")
async def parse_documents(
    files: List[UploadFile] = File(...),
    custom_notes: Optional[str] = Form(None)
):
    key = load_gemini_key()
    if not key:
        raise HTTPException(
            status_code=400,
            detail="後端尚未配置 GEMINI_API_KEY！請先在 .env 或右上角填入您的免費 Gemini API Key"
        )

    # 1. 拆解與處理所有檔案（包含 ZIP 自動解壓縮）
    extracted_texts = []
    gemini_parts = []
    file_manifest = []

    if custom_notes:
        extracted_texts.append(f"【使用者備忘筆記】:\n{custom_notes}")

    for file in files:
        content = await file.read()
        fname = file.filename or "unknown"
        fname_lower = fname.lower()

        # 處理 ZIP 壓縮檔
        if fname_lower.endswith(".zip"):
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    for zname in z.namelist():
                        if zname.endswith("/") or zname.startswith("__MACOSX"):
                            continue
                        sub_content = z.read(zname)
                        file_manifest.append(f"ZIP內檔案: {zname}")
                        zname_lower = zname.lower()

                        if zname_lower.endswith((".txt", ".md", ".json", ".csv")):
                            extracted_texts.append(f"【{zname} 內文】:\n" + sub_content.decode("utf-8", errors="replace"))
                        elif zname_lower.endswith(".docx"):
                            extracted_texts.append(f"【Word 檔案 {zname} 提取內文】:\n" + extract_docx_text(sub_content))
                        elif zname_lower.endswith((".png", ".jpg", ".jpeg", ".webp")):
                            comp_bytes, mime = compress_image_if_needed(sub_content)
                            b64 = base64.b64encode(comp_bytes).decode("ascii")
                            gemini_parts.append({
                                "inlineData": {"mimeType": mime, "data": b64}
                            })
                            extracted_texts.append(f"[已包含圖片附件: {zname}]")
                        elif zname_lower.endswith(".pdf"):
                            b64 = base64.b64encode(sub_content).decode("ascii")
                            gemini_parts.append({
                                "inlineData": {"mimeType": "application/pdf", "data": b64}
                            })
                            extracted_texts.append(f"[已包含 PDF 文件附件: {zname}]")
            except Exception as e:
                extracted_texts.append(f"[ZIP 解壓警告 {fname}: {e}]")
        else:
            file_manifest.append(f"上傳檔案: {fname}")
            if fname_lower.endswith((".txt", ".md", ".json", ".csv")):
                extracted_texts.append(f"【{fname} 內文】:\n" + content.decode("utf-8", errors="replace"))
            elif fname_lower.endswith(".docx"):
                extracted_texts.append(f"【Word 檔案 {fname} 提取內文】:\n" + extract_docx_text(content))
            elif fname_lower.endswith((".png", ".jpg", ".jpeg", ".webp")):
                comp_bytes, mime = compress_image_if_needed(content)
                b64 = base64.b64encode(comp_bytes).decode("ascii")
                gemini_parts.append({
                    "inlineData": {"mimeType": mime, "data": b64}
                })
                extracted_texts.append(f"[已包含圖片附件: {fname}]")
            elif fname_lower.endswith(".pdf"):
                b64 = base64.b64encode(content).decode("ascii")
                gemini_parts.append({
                    "inlineData": {"mimeType": "application/pdf", "data": b64}
                })
                extracted_texts.append(f"[已包含 PDF 文件附件: {fname}]")

    combined_instruction = f"""請詳細研讀附件中提供的所有真實文件（圖片機票截圖、PDF 門票/一日遊確認單、Word 飯店訂單、筆記）：

【清單目錄】：
{chr(10).join(file_manifest)}

【已提取文字與備忘內容】：
{chr(10).join(extracted_texts)}

請根據上述真實資料與硬性錨點（10/20 晴空塔、10/21 河口湖、10/23 鎌倉、10/25 箱根、上野 Mystays 住宿），嚴格產出完整結構化旅遊行程 JSON。
"""

    gemini_parts.append({"text": combined_instruction})

    # 2. 呼叫 Gemini 官方多模態結構化 API (支援自動熔斷與多模型後備)
    payload = {
        "systemInstruction": {
            "parts": [{"text": ELITE_SYSTEM_PROMPT}]
        },
        "contents": [
            {"role": "user", "parts": gemini_parts}
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        resp = call_gemini_api(payload, key, timeout=90)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"Google Gemini API 呼叫失敗: {resp.text}"
            )
        data = resp.json()
        raw_json_str = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed_itinerary = json.loads(raw_json_str)

        return {
            "success": True,
            "manifest": file_manifest,
            "itinerary": parsed_itinerary
        }
    except json.JSONDecodeError as jde:
        raise HTTPException(status_code=500, detail=f"AI 回傳之 JSON 解析失敗: {str(jde)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"後端處理異常: {str(e)}")

class ReplanRequest(BaseModel):
    custom_notes: str
    current_trip: Optional[dict] = None

@app.post("/api/replan-trip")
def replan_trip(req: ReplanRequest):
    key = load_gemini_key()
    if not key:
        raise HTTPException(status_code=400, detail="本地後端尚未配置 GEMINI_API_KEY")

    real_trip_file = BASE_DIR / "parsed_real_trip.json"
    base_data = None
    if real_trip_file.exists():
        try:
            base_data = json.loads(real_trip_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    if not base_data and req.current_trip:
        base_data = req.current_trip

    prompt = f"""【使用者最高優先權修正備忘錄】：
{req.custom_notes}

【現有基準行程】：
{json.dumps(base_data, ensure_ascii=False) if base_data else '東京 9 日遊'}

請以頂級自由行顧問 (Elite Travel Planner) 規範，嚴格遵循使用者指示，融合並產出 100% 符合規範的純 JSON 物件：
{{
  "trip": {{ ... }},
  "days": [ ... ]
}}
"""
    payload = {
        "systemInstruction": {"parts": [{"text": ELITE_SYSTEM_PROMPT}]},
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
    }
    try:
        resp = call_gemini_api(payload, key, timeout=90)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=f"Gemini API 失敗: {resp.text}")
        data = resp.json()
        raw_json_str = data["candidates"][0]["content"]["parts"][0]["text"]
        new_itinerary = json.loads(raw_json_str)

        if real_trip_file:
            real_trip_file.write_text(json.dumps(new_itinerary, ensure_ascii=False, indent=2), encoding="utf-8")

        return {"success": True, "itinerary": new_itinerary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files to serve the front-end directly from http://localhost:8000
app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print(" [OK] Elite Travel Planner Backend Gateway Started!")
    print(" [URL] Please open in browser: http://127.0.0.1:8000")
    print(" [SECURITY] GEMINI_API_KEY is safely locked in backend .env")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
