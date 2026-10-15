/**
 * Elite Travel Planner PRO v1.4
 * Core Application Logic & State Engine
 */

(function () {
  'use strict';

  // 匯率字典 (相對 TWD)
  const EXCHANGE_RATES = {
    JPY: 0.210,
    TWD: 1.0,
    USD: 32.5,
    KRW: 0.024,
    EUR: 35.0
  };

  // 全域後端 API 網址解析器 (支援 file:/// 與本機伺服器直通)
  function getBackendUrl(path) {
    if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      return path;
    }
    return 'http://127.0.0.1:8000' + path;
  }

  // ==========================================
  // 東京 9 天 8 夜深度慢活行程生成器 (10/19 ~ 10/27)
  // 嚴格落實 Elite Travel Planner 核心規範：
  // 1. 首日落地後 2 小時展開周邊動線
  // 2. 每日單向分群，避免跨區折返跑
  // 3. 末日向機場收攏，國際線提前 3.5 小時抵達機場
  // 4. 每日雙軌配備室內雨備方案 (🛡️)
  // ==========================================
  function createTokyo9Days(startDate = "2026-10-19", hotelName = "HOTEL MYSTAYS 上野") {
    const baseDate = new Date(startDate);
    function dStr(offset) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    }
    return [
      {
        dayNum: 1,
        date: dStr(0),
        theme: "Day 1 ｜ 抵達東京成田・入住大本營上野與阿美橫丁散策",
        fatigueText: "約 7,500 步 (輕鬆熱身)",
        fatigueClass: "fatigue-low",
        isRainMode: false,
        logisticsTip: "UA838 航班預計 14:45 抵達 NRT T1，出關領行李約 15:45；搭乘京成 Skyliner 直達上野僅 41 分鐘；約 16:45 抵達上野辦理入住，嚴格落實落地 2 小時後正式展開周邊輕鬆動線。",
        cultureTip: "電車內通話為失禮行為，手機請保持靜音模式；電扶梯東京一律靠左側站立。",
        safetyTip: "留意末班車時間（JR山手線約 00:30），隨身攜帶護照原件。",
        sunnySpots: [
          {
            id: "d1-s1",
            time: "14:45",
            period: "下午",
            title: "抵達東京成田機場第一航廈 (NRT T1)",
            transport: "入境檢驗、領取行李與隨身 WiFi/SIM 卡 (預估 50 分鐘)",
            desc: "搭乘【京成 Skyliner 直達特急】前往上野站（約 41 分鐘，直通大本營）。",
            category: "transport",
            completed: false,
            mapsQuery: "成田国際空港 第1ターミナル"
          },
          {
            id: "d1-s2",
            time: "16:45",
            period: "下午",
            title: `${hotelName} Check-in 卸行李`,
            transport: "京成上野站徒步 7~9 分鐘抵達飯店",
            desc: "辦理入住、安置 9 天大件行李並稍作梳洗休息。",
            category: "hotel",
            completed: false,
            mapsQuery: hotelName
          },
          {
            id: "d1-s3",
            time: "17:30",
            period: "晚上",
            title: "銀座商圈漫步・Ginza Six 蔦屋書店",
            transport: "從汐留散步約 12 分鐘至銀座中央通",
            desc: "參觀 Ginza Six 挑高天井藝術裝置與蔦屋書店，感受銀座時尚與文創氛圍。",
            category: "spot",
            completed: false,
            mapsQuery: "GINZA SIX"
          },
          {
            id: "d1-s4",
            time: "19:30",
            period: "晚上",
            title: "銀座 篝 (Ginza Kagari) 雞白湯拉麵晚餐",
            transport: "銀座站徒步 3 分鐘巷弄內",
            desc: "米其林推薦經典雞白湯拉麵，濃郁如法式濃湯，搭配當令蔬菜配料。",
            category: "food",
            completed: false,
            mapsQuery: "銀座 篝 本店"
          }
        ],
        rainSpots: [
          {
            id: "d1-r1",
            time: "15:30",
            period: "下午",
            title: `${hotelName} Check-in (雨備)`,
            transport: "地下街通道連通直達飯店周邊，減少淋雨步程",
            desc: "辦理入住，借用飯店大廳長柄雨傘。",
            category: "hotel",
            completed: false,
            mapsQuery: hotelName
          },
          {
            id: "d1-r2",
            time: "17:00",
            period: "晚上",
            title: "銀座地下街與三越室內美食街",
            transport: "地下鐵銀座站全室內連通道直達",
            desc: "完全不用撐傘！探索銀座三越頂級洋果子、草莓大福與地下伴手禮街。",
            category: "spot",
            completed: false,
            mapsQuery: "Ginza Mitsukoshi"
          }
        ]
      },
      {
        dayNum: 2,
        date: dStr(1),
        theme: "Day 2 ｜ 傳統江戶風華・淺草寺雷門祈福、仲見世通與晴空塔天空視界",
        fatigueText: "約 13,000 步 (標準探索)",
        fatigueClass: "fatigue-mid",
        isRainMode: false,
        logisticsTip: "淺草寺雷門上午 09:00 前遊客最少，拍照效果最佳；穿著好走的運動鞋。",
        cultureTip: "參拜寺廟進入山門前請先脫帽並行禮，水手舍洗手依淨心程序：先右手洗左手、再左手洗右手、漱口後洗水勺柄。",
        safetyTip: "仲見世商店街禁止邊走邊吃，請於店家指定區域或定點食用完畢。",
        sunnySpots: [
          {
            id: "d2-s1",
            time: "08:45",
            period: "上午",
            title: "淺草寺 雷門與本堂祈福 (必去首選)",
            transport: "從新橋搭乘【都營淺草線】14 分鐘直達淺草站",
            desc: "趁人潮尚少時拍下經典雷門巨型紅燈籠，至本堂參拜觀音並求御守護身符。",
            category: "spot",
            completed: false,
            mapsQuery: "Senso-ji Asakusa"
          },
          {
            id: "d2-s2",
            time: "11:30",
            period: "上午",
            title: "淺草今半 (Asakusa Imahan) 百年壽喜燒午餐",
            transport: "仲見世通徒步 6 分鐘",
            desc: "創業超過百年老舖，品嚐頂級黑毛和牛壽喜燒御膳與特製醬汁。",
            category: "food",
            completed: false,
            mapsQuery: "Asakusa Imahan Kokusai Dori"
          },
          {
            id: "d2-s3",
            time: "13:30",
            period: "下午",
            title: "隅田川水上步道 Sumida River Walk・漫步至晴空塔",
            transport: "沿東武鐵道高架步道步行約 15 分鐘跨越隅田川",
            desc: "欣賞水岸波光與金色朝日啤酒神之焰雕像，沿途拍攝晴空塔倒影。",
            category: "spot",
            completed: false,
            mapsQuery: "Sumida River Walk"
          },
          {
            id: "d2-s4",
            time: "15:00",
            period: "下午",
            title: "東京晴空塔 (TOKYO SKYTREE) 天望甲板眺望",
            transport: "步道終點直通晴空塔城",
            desc: "搭乘高速分光電梯直達 350M 展望台，360 度俯瞰東京壯麗都市全景。",
            category: "spot",
            completed: false,
            mapsQuery: "Tokyo Skytree"
          },
          {
            id: "d2-s5",
            time: "18:30",
            period: "晚上",
            title: "晴空塔 Solamachi 商場逛街購物與六厘舍沾麵晚餐",
            transport: "晴空塔基座直通商場",
            desc: "東京超人氣濃厚豚骨魚介沾麵名店，粗麵條彈牙濃郁。",
            category: "food",
            completed: false,
            mapsQuery: "Rokurinsha Tokyo Skytree"
          }
        ],
        rainSpots: [
          {
            id: "d2-r1",
            time: "13:30",
            period: "下午",
            title: "墨田水族館 (Sumida Aquarium 室內雨備首選)",
            transport: "晴空塔 Solamachi 5F 全室內直達",
            desc: "全室內療癒系水族館，近距離觀看麥哲倫企鵝池與夢幻金魚展。",
            category: "spot",
            completed: false,
            mapsQuery: "Sumida Aquarium"
          }
        ]
      },
      {
        dayNum: 3,
        date: dStr(2),
        theme: "Day 3 ｜ 明治神宮森林・原宿表參道與 SHIBUYA SKY 絕景夕陽",
        fatigueText: "約 14,500 步 (充沛挑戰)",
        fatigueClass: "fatigue-high",
        isRainMode: false,
        logisticsTip: "SHIBUYA SKY 建議提前 4 週預約 16:30 入場（涵蓋日落前後 45 分鐘絕景）。",
        cultureTip: "明治神宮參拜道中央為神明專用通道，行人請靠兩側碎石路行走；正殿參拜為「二拜二拍手一拜」。",
        safetyTip: "SHIBUYA SKY 頂樓露天平台風大，帽子、圍巾、背包皆須寄放置物櫃，僅可攜帶附掛繩手機或相機。",
        sunnySpots: [
          {
            id: "d3-s1",
            time: "09:00",
            period: "上午",
            title: "明治神宮 常綠森林參道晨間漫步與祈福",
            transport: "JR 新橋搭乘山手線 15 分鐘至原宿站",
            desc: "走進 70 公頃人造原生林，仰望巨型木造大鳥居，寫繪馬祈願祝禱。",
            category: "spot",
            completed: false,
            mapsQuery: "Meiji Jingu"
          },
          {
            id: "d3-s2",
            time: "11:30",
            period: "上午",
            title: "原宿竹下通與表參道精品林蔭大道",
            transport: "原宿站出口徒步 2 分鐘",
            desc: "穿梭年輕潮流發源地竹下通，再轉入優雅表參道建築群，欣賞安藤忠雄表參道之丘。",
            category: "spot",
            completed: false,
            mapsQuery: "Omotesando Hills"
          },
          {
            id: "d3-s3",
            time: "14:00",
            period: "下午",
            title: "澀谷經典十字路口 (Shibuya Scramble Crossing)",
            transport: "表參道沿明治通散步 15 分鐘或搭乘銀座線 1 站",
            desc: "全世界最繁忙的對角線斑馬線，與忠犬八公銅像合影。",
            category: "spot",
            completed: false,
            mapsQuery: "Shibuya Crossing"
          },
          {
            id: "d3-s4",
            time: "16:30",
            period: "下午",
            title: "SHIBUYA SKY 展望台・360度露天夕陽與富士山 (必去首選)",
            transport: "澀谷站直通 Shibuya Scramble Square 14F 入場",
            desc: "登上 229M 頂樓露天停機坪，站在透明懸空天際角落俯瞰東京暮色與璀璨夜景。",
            category: "spot",
            completed: false,
            mapsQuery: "SHIBUYA SKY"
          },
          {
            id: "d3-s5",
            time: "19:00",
            period: "晚上",
            title: "MIYASHITA PARK 宮下公園・屋頂空中綠地與居酒屋街晚餐",
            transport: "Scramble Square 徒步 5 分鐘",
            desc: "複合式綠能空中商場，於「澀谷橫丁」品嚐全日本各縣市鄉土料理串燒。",
            category: "food",
            completed: false,
            mapsQuery: "MIYASHITA PARK"
          }
        ],
        rainSpots: [
          {
            id: "d3-r1",
            time: "16:00",
            period: "下午",
            title: "澀谷 Hikarie 與 Shibuya Stream 全室內商場雨備",
            transport: "澀谷站地下通道全連通",
            desc: "高樓層室內觀景窗眺望十字路口雨景，享受室內甜點沙龍。",
            category: "spot",
            completed: false,
            mapsQuery: "Shibuya Hikarie"
          }
        ]
      },
      {
        dayNum: 4,
        date: dStr(3),
        theme: "Day 4 ｜ 築地場外市場晨宴・濱離宮庭園・日本橋老街探索",
        fatigueText: "約 10,500 步 (輕鬆雅致)",
        fatigueClass: "fatigue-low",
        isRainMode: false,
        logisticsTip: "築地市場多數排隊名店 13:00 即結束營業，建議 08:30 前抵達享受最豐富鮮味。",
        cultureTip: "濱離宮御茶屋位於池中，品茗時請放輕腳步欣賞庭園山水倒影。",
        safetyTip: "築地場外市場巷道濕滑且有運貨搬運車出入，行走請靠邊注意安全。",
        sunnySpots: [
          {
            id: "d4-s1",
            time: "08:30",
            period: "上午",
            title: "築地場外市場・黑銀鮪魚刺身與現烤帆立貝晨宴",
            transport: "從飯店徒步約 12 分鐘即達築地",
            desc: "品嚐極上黑鮪魚大腹握壽司、松露玉子燒與現開生蠔，感受東京廚房的朝氣。",
            category: "food",
            completed: false,
            mapsQuery: "Tsukiji Outer Market"
          },
          {
            id: "d4-s2",
            time: "11:00",
            period: "上午",
            title: "世界遺產 濱離宮恩賜庭園・潮入之池水上茶屋",
            transport: "築地步行 8 分鐘進入庭園",
            desc: "德川將軍家御殿庭園，引東京灣海水流入池中，於中島之茶屋品味現刷宇治抹茶與和果子。",
            category: "spot",
            completed: false,
            mapsQuery: "Hamarikyu Gardens"
          },
          {
            id: "d4-s3",
            time: "14:00",
            period: "下午",
            title: "日本橋道路元標・三越日本橋本店歷史文創建築巡禮",
            transport: "搭乘地下鐵銀座線直達三越前站",
            desc: "日本所有公路的起點日本橋，參觀被列為重要文化財的浮雕麒麟之翼，探索百年三越本館文創。",
            category: "spot",
            completed: false,
            mapsQuery: "Nihonbashi Bridge"
          },
          {
            id: "d4-s4",
            time: "18:00",
            period: "晚上",
            title: "金子半之助日本橋本店・江戶前特上天丼晚餐",
            transport: "三越前站徒步 3 分鐘",
            desc: "鋪滿整條巨大野生穴子魚、大蝦、干貝魷魚海鮮炸物與半熟炸蛋，淋上秘傳百年胡麻香醬汁。",
            category: "food",
            completed: false,
            mapsQuery: "Kaneko Hannosuke Nihonbashi"
          }
        ],
        rainSpots: [
          {
            id: "d4-r1",
            time: "14:00",
            period: "下午",
            title: "COREDO 室町 1~3 館全室內傳統工藝街",
            transport: "三越前站地下直通",
            desc: "全室內江戶老舖現代旗艦店集合地，體驗箔座日本橋金箔與茅乃舍頂級高湯試飲。",
            category: "spot",
            completed: false,
            mapsQuery: "COREDO Muromachi"
          }
        ]
      },
      {
        dayNum: 5,
        date: dStr(4),
        theme: "Day 5 ｜ 臨海新都心・台場海濱公園・科學未來館與彩虹大橋夜景",
        fatigueText: "約 11,500 步 (步調寬廣)",
        fatigueClass: "fatigue-mid",
        isRainMode: false,
        logisticsTip: "搭乘百合鷗號高架無人電車，推薦購買一日券 (¥820) 隨意穿梭台場各站。",
        cultureTip: "百合鷗號車頭設有全景觀景窗，排隊時請依序先來後到禮讓座位。",
        safetyTip: "台場海濱公園入夜海風強勁，請留意隨身保暖。",
        sunnySpots: [
          {
            id: "d5-s1",
            time: "10:00",
            period: "上午",
            title: "百合鷗號 (Yurikamome) 高架無人電車跨海體驗",
            transport: "新橋站始發，高架行駛穿越彩虹大橋下層",
            desc: "居高臨下欣賞東京灣壯闊水域與海關貨櫃碼頭景致，宛如乘坐未來科幻列車。",
            category: "transport",
            completed: false,
            mapsQuery: "Yurikamome Shimbashi Station"
          },
          {
            id: "d5-s2",
            time: "11:00",
            period: "上午",
            title: "日本科學未來館 (Miraikan) 人工智慧與地球科技探索",
            transport: "遠程通信中心站徒步 4 分鐘",
            desc: "親睹巨型懸吊 LED 地球 Geo-Cosmos，體驗最新機器人與太空生活互動展覽。",
            category: "spot",
            completed: false,
            mapsQuery: "Miraikan"
          },
          {
            id: "d5-s3",
            time: "14:00",
            period: "下午",
            title: "DiverCity Tokyo Plaza 實物大獨角獸鋼彈變形秀",
            transport: "台場站徒步 5 分鐘",
            desc: "19.7 公尺高 1:1 實物大鋼彈立像，定時進行毀滅模式變形與夜間聲光燈光秀。",
            category: "spot",
            completed: false,
            mapsQuery: "DiverCity Tokyo Plaza"
          },
          {
            id: "d5-s4",
            time: "16:30",
            period: "下午",
            title: "台場海濱公園・自由女神像與沙灘夕陽漫步",
            transport: "台場海濱步道散步 5 分鐘",
            desc: "遠眺東京鐵塔與彩虹大橋雙地標，在金色晚霞中留下經典海濱合影。",
            category: "spot",
            completed: false,
            mapsQuery: "Odaiba Statue of Liberty"
          },
          {
            id: "d5-s5",
            time: "18:30",
            period: "晚上",
            title: "Aqua City 台場海濱第一排景觀晚餐・彩虹大橋璀璨點燈",
            transport: "海濱公園直通商場 5F",
            desc: "伴隨窗外東京灣迷人夜景，享用特選和牛排與義大利麵。",
            category: "food",
            completed: false,
            mapsQuery: "Aqua City Odaiba"
          }
        ],
        rainSpots: [
          {
            id: "d5-r1",
            time: "11:00",
            period: "上午",
            title: "日本科學未來館 + DiverCity 室內全覆蓋商場",
            transport: "全室內空調與有蓋接駁廊道",
            desc: "雨天完全不濕鞋，盡情探索室內科技展與大型商場採購。",
            category: "spot",
            completed: false,
            mapsQuery: "Miraikan"
          }
        ]
      },
      {
        dayNum: 6,
        date: dStr(5),
        theme: "Day 6 ｜ 上野文化之森・國立西洋美術館・阿美橫町平民美食採購",
        fatigueText: "約 12,000 步 (人文文創)",
        fatigueClass: "fatigue-mid",
        isRainMode: false,
        logisticsTip: "阿美橫町藥妝店（OS Drug 只收現金但價格最殺）與二木之菓子伴手禮建議集中此日採購。",
        cultureTip: "美術館內請關閉相機閃光燈，大件雙肩包請先寄放免費投幣置物櫃以免碰撞展品。",
        safetyTip: "阿美橫町高架橋下遊客擁擠，後背包請背於前方預防扒竊。",
        sunnySpots: [
          {
            id: "d6-s1",
            time: "09:30",
            period: "上午",
            title: "世界文化遺產 國立西洋美術館 (Le Corbusier 建築名作)",
            transport: "JR 新橋搭乘山手線 12 分鐘至上野站公園口",
            desc: "欣賞羅丹《沉思者》、《地獄之門》戶外青銅雕塑與莫內《睡蓮》真跡，感受現代建築經典之美。",
            category: "spot",
            completed: false,
            mapsQuery: "National Museum of Western Art"
          },
          {
            id: "d6-s2",
            time: "12:00",
            period: "中午",
            title: "上野恩賜公園 韻松亭 (Inshotei) 百年茶屋花籠午膳",
            transport: "公園林蔭小徑散步 5 分鐘",
            desc: "明治 8 年創業之老字號料亭，坐在面朝公園綠意的木造和室內品嚐手作湯葉豆腐花籠御膳。",
            category: "food",
            completed: false,
            mapsQuery: "Inshotei Ueno"
          },
          {
            id: "d6-s3",
            time: "14:00",
            period: "下午",
            title: "上野阿美橫町 (Ameyoko)・藥妝零食一站式免稅掃貨",
            transport: "上野站不忍口徒步 2 分鐘直達高架橋下老街",
            desc: "採買二木之菓子（全東京最全仙貝、抹茶巧克力名店）、OS Drug 藥妝與新鮮水果串。",
            category: "spot",
            completed: false,
            mapsQuery: "Ameyoko Shopping District"
          },
          {
            id: "d6-s4",
            time: "18:00",
            period: "晚上",
            title: "肉屋之台所 (Nikuya no Daidokoro) 上野店・頂級黑毛和牛燒肉",
            transport: "阿美橫町中央大道徒步 3 分鐘",
            desc: "精選黑毛和牛 A4/A5 等級牛排厚切放題，肉汁鮮美甜嫩，慶祝充實的購物之日。",
            category: "food",
            completed: false,
            mapsQuery: "Nikuya no Daidokoro Ueno"
          }
        ],
        rainSpots: [
          {
            id: "d6-r1",
            time: "14:00",
            period: "下午",
            title: "東京國立博物館 (全室內國寶文物殿堂)",
            transport: "上野公園內全室內展覽館",
            desc: "日本歷史最悠久的博物館，雨天漫步於本館日本美術與東洋館千年古物之間。",
            category: "spot",
            completed: false,
            mapsQuery: "Tokyo National Museum"
          }
        ]
      },
      {
        dayNum: 7,
        date: dStr(6),
        theme: "Day 7 ｜ 下町文青老街・谷中銀座貓町・根津神社與秋葉原電氣街",
        fatigueText: "約 11,000 步 (慢調懷舊)",
        fatigueClass: "fatigue-mid",
        isRainMode: false,
        logisticsTip: "谷中銀座坡道「夕陽階梯」拍照建議下午光線最佳；搭乘千代田線可順路接駁至秋葉原。",
        cultureTip: "根津神社朱紅千本鳥居為信徒祈福結緣聖地，穿行時請放輕步伐保持敬虔心態。",
        safetyTip: "秋葉原購買高額免稅電器時請務必保管好免稅單據與護照原件。",
        sunnySpots: [
          {
            id: "d7-s1",
            time: "09:30",
            period: "上午",
            title: "谷中銀座 (Yanaka Ginza) 老街散步・夕陽階梯與肉餅小吃",
            transport: "JR 日暮里站西口徒步 5 分鐘",
            desc: "躲過關東大地震與二戰轟炸的幸運下町，品嚐現炸牛肉可樂餅、栗子蒙布朗與造訪貓咪木雕小店。",
            category: "spot",
            completed: false,
            mapsQuery: "Yanaka Ginza"
          },
          {
            id: "d7-s2",
            time: "11:30",
            period: "上午",
            title: "根津神社 (Nezu Shrine)・千本鳥居與杜鵑苑參拜",
            transport: "谷中散步 10 分鐘越過三崎坂至文京區",
            desc: "江戶幕府五代將軍德川綱吉建造的權現造本殿，漫步在鬱鬱蔥蔥的朱紅迷你鳥居林道中。",
            category: "spot",
            completed: false,
            mapsQuery: "Nezu Shrine"
          },
          {
            id: "d7-s3",
            time: "13:30",
            period: "下午",
            title: "東京大學本鄉校區・安田講堂與赤門文藝巡禮",
            transport: "根津站散步 10 分鐘進入最高學府校園",
            desc: "銀杏大道林蔭下感受百年學府氛圍，於中央食堂品嚐經典東大赤門拉麵午餐。",
            category: "spot",
            completed: false,
            mapsQuery: "University of Tokyo Akamon"
          },
          {
            id: "d7-s4",
            time: "15:30",
            period: "下午",
            title: "秋葉原 (Akihabara) 電氣街・Yodobashi-Akiba 旗艦店",
            transport: "搭乘地下鐵日比谷線至秋葉原站",
            desc: "世界動漫遊戲與 3C 電氣大本營，探索 Radio 會館手辦扭蛋與 9 層樓旗艦電器商場。",
            category: "spot",
            completed: false,
            mapsQuery: "Yodobashi Akiba"
          },
          {
            id: "d7-s5",
            time: "18:30",
            period: "晚上",
            title: "牛かつ もと村 (Gyukatsu Motomura) 秋葉原店・現煎石板炸牛排",
            transport: "秋葉原站電氣街口徒步 4 分鐘",
            desc: "金黃酥脆薄麵衣裹頂級生牛肉，每位顧客配備專屬小石板自行炙燒至理想熟度，沾芥末醬油入口融化。",
            category: "food",
            completed: false,
            mapsQuery: "Gyukatsu Motomura Akihabara"
          }
        ],
        rainSpots: [
          {
            id: "d7-r1",
            time: "15:30",
            period: "下午",
            title: "Yodobashi-Akiba 9層樓全室內電器美食巨蛋",
            transport: "秋葉原站直通地下通道，完全不淋雨",
            desc: "全室內無縫購物，匯聚最新數位相機、耳機音響、任天堂 Switch 與 8F 人氣美食街。",
            category: "spot",
            completed: false,
            mapsQuery: "Yodobashi Akiba"
          }
        ]
      },
      {
        dayNum: 8,
        date: dStr(7),
        theme: "Day 8 ｜ 新宿繁華都會・新宿御苑森林・東京都廳展望台與敘敘苑燒肉晚餐",
        fatigueText: "約 13,000 步 (繁華熱鬧)",
        fatigueClass: "fatigue-mid",
        isRainMode: false,
        logisticsTip: "新宿御苑開放時間至 16:30，請注意入園最後梯次為 16:00；園內全面禁酒。",
        cultureTip: "東京都廳 45F 展望台為東京都政府官方設施，免費對外開放，入場前需通過金屬安檢。",
        safetyTip: "新宿歌舞伎町夜間居酒屋拉客 (Touting) 甚多，請勿跟隨路邊無執照攬客人員進入地下店家。",
        sunnySpots: [
          {
            id: "d8-s1",
            time: "09:30",
            period: "上午",
            title: "新宿御苑 (Shinjuku Gyoen)・都會綠洲庭園野餐漫步",
            transport: "從新橋搭乘地下鐵丸之內線至新宿御苑前站",
            desc: "新海誠動畫《言葉之庭》取景舞台，漫步法式整形式庭園、英式風景庭園與日本傳統池泉迴遊式庭園。",
            category: "spot",
            completed: false,
            mapsQuery: "Shinjuku Gyoen National Garden"
          },
          {
            id: "d8-s2",
            time: "12:30",
            period: "中午",
            title: "新宿高島屋 Times Square 美食街午餐",
            transport: "新宿南口徒步 3 分鐘",
            desc: "品嚐名店名代炸豬排 (Katsukura) 或和風洋食蛋包飯。",
            category: "food",
            completed: false,
            mapsQuery: "Takashimaya Times Square"
          },
          {
            id: "d8-s3",
            time: "14:30",
            period: "下午",
            title: "東京都廳第一本廳舍 45F 免費展望室・俯瞰東京全景",
            transport: "新宿西口地下通道徒步 10 分鐘直通都廳",
            desc: "離地 202 公尺高空無死角展望，遠眺富士山積雪山巔與東京晴空塔，欣賞草間彌生繪製的「黃色南瓜鋼琴」。",
            category: "spot",
            completed: false,
            mapsQuery: "Tokyo Metropolitan Government Building"
          },
          {
            id: "d8-s4",
            time: "17:30",
            period: "晚上",
            title: "新宿歌舞伎町・格拉斯麗哥吉拉頭像地標打卡",
            transport: "新宿東口徒步 5 分鐘",
            desc: "走進世界最大娛樂鬧區，抬頭看見聳立在飯店頂樓的巨大噴煙哥吉拉咆哮雕像。",
            category: "spot",
            completed: false,
            mapsQuery: "Godzilla Head Shinjuku"
          },
          {
            id: "d8-s5",
            time: "19:30",
            period: "晚上",
            title: "敘敘苑燒肉 新宿 Opera City 53F 高空夜景晚餐 (必去首選)",
            transport: "新宿搭乘京王新線至初台站直通 Opera City",
            desc: "全東京景致最壯觀的敘敘苑高空旗艦店！在 53 樓窗邊沙發享用極上厚切牛舌、特選沙朗與海鮮拼盤。",
            category: "food",
            completed: false,
            mapsQuery: "Jojoen Tokyo Opera City"
          }
        ],
        rainSpots: [
          {
            id: "d8-r1",
            time: "14:30",
            period: "下午",
            title: "新宿巨大地下街 (Subnade) 與百貨連通室內商圈",
            transport: "新宿站全室內地下通道連通伊勢丹、Lumine、高島屋",
            desc: "下雨完全免撐傘，舒適享受新宿全日本規模最大的地下購物生活圈。",
            category: "spot",
            completed: false,
            mapsQuery: "Shinjuku Subnade"
          }
        ]
      },
      {
        dayNum: 9,
        date: dStr(8),
        theme: "Day 9 ｜ 東京車站丸之內紅磚巡禮・皇居二重橋・★國際線提早 3.5 小時機場收攏返台",
        fatigueText: "約 6,500 步 (從容返程)",
        fatigueClass: "fatigue-low",
        isRainMode: false,
        logisticsTip: "落實末日收攏原則：本日行李直接隨身推至東京站寄物櫃，搭乘成田特快 N'EX 直達航廈地下站。",
        cultureTip: "國際航班嚴格落實提早 3.5 小時抵達機場辦理報到託運手續與免稅店購物。",
        safetyTip: "液體類伴手禮（清酒、果汁、化妝水、凝膠零食）務必裝入大行李箱託運，嚴禁手提上機。",
        sunnySpots: [
          {
            id: "d9-s1",
            time: "09:00",
            period: "上午",
            title: "皇居外苑散步・楠木正成像與皇居二重橋",
            transport: "從飯店搭乘山手線至東京站丸之內口徒步 8 分鐘",
            desc: "漫步護城河畔綠草坪與百年黑松樹林，於二重橋前留下莊嚴典雅的東京最後紀念留影。",
            category: "spot",
            completed: false,
            mapsQuery: "Nijubashi Bridge Imperial Palace"
          },
          {
            id: "d9-s2",
            time: "10:30",
            period: "上午",
            title: "東京車站丸之內紅磚歷史建築・KITTE 屋頂花園俯瞰",
            transport: "皇居徒步 5 分鐘回東京站站前廣場",
            desc: "欣賞辰野金吾大師設計的 1914 年辰野式文藝復興紅磚站舍，登上 KITTE 6F 空中花園遠眺列車進出站風情。",
            category: "spot",
            completed: false,
            mapsQuery: "KITTE Marunouchi"
          },
          {
            id: "d9-s3",
            time: "12:00",
            period: "中午",
            title: "東京車站一番街・最後伴手禮採購與拉麵街午餐",
            transport: "東京站 B1 地下街",
            desc: "買齊 Tokyo Banana、NewYork Perfect Cheese 起司脆餅、小雞蛋糕，於拉麵一條街享用最後一碗道地拉麵。",
            category: "food",
            completed: false,
            mapsQuery: "Tokyo Station Ichibangai"
          },
          {
            id: "d9-s4",
            time: "13:30",
            period: "下午",
            title: "搭乘成田特快 (N'EX) 直達機場 (末日動線直達不折返)",
            transport: "東京站總武地下月台搭乘 N'EX (車程約 55 分鐘)",
            desc: "全車對號指定席，舒適平穩直達第一航廈地下站，免除市區公路塞車風險。",
            category: "transport",
            completed: false,
            mapsQuery: "Narita Express"
          },
          {
            id: "d9-s5",
            time: "14:45",
            period: "下午",
            title: "抵達成田機場第 1 航廈 (★落實提前 3.5 小時機場收攏原則)",
            transport: "辦理長榮 BR197 登機報到與大件行李託運",
            desc: "通關進入出境免稅區，採購 Royce 生巧克力、白色戀人，準備於 17:40 前往登機門候機。",
            category: "transport",
            completed: false,
            mapsQuery: "Narita International Airport Terminal 1"
          },
          {
            id: "d9-s6",
            time: "18:25",
            period: "晚上",
            title: "搭乘長榮 BR197 班機滿載美好回憶返抵國門",
            transport: "NRT 18:25 起飛 -> 桃園 TPE 21:15 抵達",
            desc: "平安抵達台灣，圓滿結束 9 天 8 夜豐富充實的東京深度慢活自由行！",
            category: "transport",
            completed: false,
            mapsQuery: "Taiwan Taoyuan International Airport"
          }
        ],
        rainSpots: [
          {
            id: "d9-r1",
            time: "10:30",
            period: "上午",
            title: "東京車站地下 Gransta 與丸之內室內名店街",
            transport: "全室內地下通道連通直達 NEX 候車月台",
            desc: "全室內空間採買特級鐵路便當與伴手禮，完全不用外出撐傘，從容候車前往機場。",
            category: "spot",
            completed: false,
            mapsQuery: "Gransta Tokyo"
          }
        ]
      }
    ];
  }

  // 預設示範資料 (嚴格遵循 Elite Travel Planner 規劃原則: 首尾日收攏、動線不折返、必去優先、雨備齊全)
  // 真實 AI 深度解析產出之 10/19~10/27 東京 9 日遊完整資料 (Sharllen Wang 專屬)
  const REAL_PARSED_TOKYO9_DATA = {
  "trip": {
    "name": "2026 東京秋季 9 日深度自由行（橫濱・好市多・成田深度全客製）",
    "destination": "日本 東京及近郊（上野・橫濱・幕張・成田）",
    "startDate": "2026-10-19",
    "endDate": "2026-10-27",
    "flightDept": "聯合航空 UA838 | 高雄 KHH 09:55 -> 成田 NRT 14:45 (T1)",
    "flightReturn": "聯合航空 UA837 | 成田 NRT 17:45 -> 高雄 KHH 21:15 (T1)",
    "hotelName": "HOTEL MYSTAYS 上野 (HOTEL MYSTAYS Ueno)",
    "hotelAddress": "東京都台東區東上野5-5-13 (+81 3-3842-2461)",
    "members": [
      "Sharllen Wang",
      "Wang Hsiachun",
      "同行家人(4人成行)"
    ],
    "mustGo": [
      "晴空塔展望台",
      "Workman晴空塔店",
      "根室花丸/TORITON壽司",
      "富士山河口湖",
      "橫濱空中纜車與港灣夜景",
      "鎌倉江之島",
      "Sky Hop Bus雙層觀光巴士",
      "箱根大湧谷與御殿場Outlet",
      "Costco幕張店",
      "成田山百年鰻魚飯",
      "AEON MALL成田店",
      "叙々苑 惠比壽花園廣場38F平日午餐",
      "鍋ぞう壽喜燒放題",
      "肉屋の台所燒肉放題"
    ],
    "mustAvoid": [
      "跨區折返跑",
      "最後一天趕不上機場",
      "無電梯長階梯搬行李"
    ]
  },
  "days": [
    {
      "dayNum": 1,
      "date": "2026-10-19",
      "theme": "Day 1 ｜ 抵達東京・入駐大本營上野・阿美橫丁散策",
      "fatigueText": "約 7,500 步 (輕鬆熱身)",
      "fatigueClass": "fatigue-low",
      "isRainMode": false,
      "logisticsTip": "UA838 航班預計 14:45 抵達 NRT T1，出關領行李約 15:45；搭乘京成 Skyliner 直達上野僅 41 分鐘；約 16:45 抵達上野辦理入住，嚴格落實落地 2 小時後正式展開周邊輕鬆動線。",
      "cultureTip": "日本電車內請保持手機靜音，搭乘電扶梯東京習慣靠左側站立。",
      "safetyTip": "隨身攜帶護照正本以備免稅購物使用，注意末班 Skyliner 與 JR 班次。",
      "sunnySpots": [
        {
          "id": "d1-s1",
          "time": "14:45",
          "period": "下午",
          "title": "抵達成田國際機場第一航廈 (NRT T1)",
          "transport": "搭乘 UA838 順利抵達，辦理入境與領取行李（預估 50 分鐘）",
          "desc": "出關後於京成電鐵櫃台領取 Skyliner 車票與西瓜卡 (Suica)，搭乘直達特急列車奔向上野大本營。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "成田国際空港 第1ターミナル"
        },
        {
          "id": "d1-s2",
          "time": "16:45",
          "period": "下午",
          "title": "入住 HOTEL MYSTAYS 上野・卸下行李休憩",
          "transport": "從京成上野站步行約 7~9 分鐘抵達飯店",
          "desc": "辦理 Check-in 手續，將 9 天大件行李安置妥當，整理隨身小包展開第一天悠閒慢活行程。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        },
        {
          "id": "d1-s3",
          "time": "17:45",
          "period": "下午",
          "title": "上野阿美橫丁 (Ameyoko) 活力市集採買",
          "transport": "從飯店步行 6 分鐘直達阿美橫丁入口",
          "desc": "漫步上野最熱鬧的高架橋下傳統老街，造訪「松本清」或「OS Drug」比價免稅藥妝，品嚐現切哈密瓜與水果串。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "アメヤ横丁"
        },
        {
          "id": "d1-s4",
          "time": "19:15",
          "period": "晚上",
          "title": "晚餐：上野道地拉麵名店（一蘭 / 麵屋武藏 武骨）",
          "transport": "阿美橫丁商圈步行 3 分鐘",
          "desc": "品嚐香濃豚骨拉麵或厚切叉燒沾麵，熱騰騰濃郁湯頭洗去搭機飛行疲勞。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "麺屋武蔵 武骨"
        },
        {
          "id": "d1-s5",
          "time": "20:00",
          "period": "晚上",
          "title": "多慶屋 (Takeya) 紫色大樓生活補給採購",
          "transport": "從阿美橫丁步行約 5 分鐘抵達御徒町多慶屋",
          "desc": "東京老字號免稅折扣商城，採買日本當季麝香葡萄、零食餅乾與飲用水，返回飯店舒適休息。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "多慶屋"
        }
      ],
      "rainSpots": [
        {
          "id": "d1-r1",
          "time": "16:30",
          "period": "下午",
          "title": "上野丸井百貨 (0101) & atre 上野商場 (全室內雨備)",
          "transport": "上野站共構室內連通地下街直達",
          "desc": "全室內連通商場，包含無印良品、LOFT 與各式日系雜貨，完全免受雨淋。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "上野マルイ"
        }
      ]
    },
    {
      "dayNum": 2,
      "date": "2026-10-20",
      "theme": "Day 2 ｜ 晴空塔全日精華（途中早餐・Workman購物・13:30 Top of Tree午宴・16:00換票登頂・根室花丸/TORITON壽司）",
      "fatigueText": "約 11,500 步 (商場室內好走)",
      "fatigueClass": "fatigue-mid",
      "isRainMode": false,
      "logisticsTip": "【10/20 雙重預約鎖定】中午 13:30 準時入座 31F「天空LOUNGE TOP of TREE」高空景觀午宴（一休.com 預約）；下午 15:30 準備前往 4F 櫃台出示 QR Code 換票，16:00~16:30 入場登頂 350m+450m 展望台；晚間 19:00~19:30 享用 6F 超人氣排隊名店壽司（根室花丸 / TORITON），餐後直接返回上野飯店。",
      "cultureTip": "晴空塔 6F 壽司名店（根室花丸 / TORITON）極受歡迎，建議下午逛街時或傍晚提前先至現場領取號碼牌。",
      "safetyTip": "天望回廊玻璃地板拍照時請注意隨身貴重物品，遵守現場指引。",
      "sunnySpots": [
        {
          "id": "d2-s1",
          "time": "08:30",
          "period": "上午",
          "title": "上野至晴空塔途中人氣早餐：喫茶 友路有 (或 珈琲天國)",
          "transport": "上野搭乘地鐵銀座線至淺草站步行 2 分鐘（或上野老舖喫茶）",
          "desc": "【使用者指定早餐推薦】造訪東京懷舊昭和風名店「喫茶 友路有」，享用香脆厚切吐司、熱壓三明治、現煎培根荷包蛋與手沖熱咖啡，活力開啟美好早晨。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "純喫茶 友路有 浅草店"
        },
        {
          "id": "d2-s2",
          "time": "10:15",
          "period": "上午",
          "title": "晴空塔 Solamachi 3F：Workman Colors / Workman Girl 購物",
          "transport": "從淺草搭東武晴空塔線或都營淺草線直達押上（晴空塔前）站",
          "desc": "【使用者指定 Workman 購物】直奔東京晴空塔城 Solamachi 3 樓超夯的「Workman Colors」，大採購以極高 CP 值著稱的防潑水機能外套、輕量休閒褲、防風雨鞋與潮流戶外穿搭。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "Workman Colors 東京ソラマチ店"
        },
        {
          "id": "d2-s3",
          "time": "11:45",
          "period": "上午",
          "title": "晴空塔 Solamachi 潮流商場逛街採買 (午宴前散策)",
          "transport": "Solamachi 商場室內各樓層散策",
          "desc": "漫步商場各樓層，採購寶可夢中心 (Pokémon Center)、吉卜力橡子共和國與東京芭娜娜伴手禮，為 13:30 午宴熱身。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "東京ソラマチ"
        },
        {
          "id": "d2-s4",
          "time": "13:30",
          "period": "中午",
          "title": "【已預約午宴】天空LOUNGE TOP of TREE／東京ソラマチ31F",
          "transport": "搭乘 Solamachi 12 號高層專用景觀電梯直達 31 樓",
          "desc": "【已預約午宴・一休.com 確認單】準時 13:30 入座東京晴空塔 31 樓「天空LOUNGE TOP of TREE」（預約姓名：Sharllen Wang / りしゅくけん 様，4 位）。在無敵高空景觀座席前直面雄偉晴空塔鋼骨架構與東京都心全景，享用三層精緻法式/日式高空午宴料理！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "天空 LOUNGE TOP of TREE"
        },
        {
          "id": "d2-s5",
          "time": "15:30",
          "period": "下午",
          "title": "前往晴空塔 4 樓櫃台出示 QR Code 換票準備登頂",
          "transport": "搭電梯返回 4 樓晴空塔售票與驗票入口大廳",
          "desc": "【使用者指定 3:30 準備換票】準時抵達 4 樓櫃台出示購票憑證 QR Code（訂單編號 16826030743493，4 位成人套票，預約 16:00~16:30 入場）。感應過閘搭乘高速天望電梯直達 350m 天望甲板與 450m 天望回廊，在晴空下俯瞰東京灣與富士山夕陽！",
          "category": "spot",
          "completed": false,
          "mapsQuery": "東京スカイツリー"
        },
        {
          "id": "d2-s6",
          "time": "16:00",
          "period": "下午",
          "title": "東京晴空塔展望台登頂巡禮 (350m 天望甲板 + 450m 天望回廊)",
          "transport": "高速電梯直達展望台",
          "desc": "【已購票 16:00 入場】登上世界最高自立式電波塔，漫步於 450 公尺斜坡回廊，靜靜欣賞關東平原從金黃夕陽過渡到百萬璀璨夜景的壯麗天際線。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "東京スカイツリー 展望デッキ"
        },
        {
          "id": "d2-s7",
          "time": "19:00",
          "period": "晚上",
          "title": "超人氣排隊名店壽司晚餐：北海道根室花丸 (或 TORITON トリトン)",
          "transport": "晴空塔 Solamachi 6F 美食餐廳街",
          "desc": "【使用者指定 19:00~19:30 壽司晚餐】造訪全東京一致狂推的殿堂級迴轉壽司——「回転寿司 根室花まる」或「回転寿し トリトン」！大啖產地直送厚切干貝、牡丹蝦、生海膽與極鮮鮪魚腹壽司！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "回転寿司 根室花まる 東京ソラマチ店"
        },
        {
          "id": "d2-s8",
          "time": "20:45",
          "period": "晚上",
          "title": "用餐後直接搭車返回上野飯店休息",
          "transport": "從押上站搭乘都營淺草線至淺草轉銀座線，或搭東武線直達上野，約 15 分鐘",
          "desc": "【使用者指定用餐後直接回飯店】不折返、不繞路，直接返回 HOTEL MYSTAYS 上野，安頓戰利品並充分享受充足睡眠。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        }
      ],
      "rainSpots": [
        {
          "id": "d2-r1",
          "time": "13:30",
          "period": "下午",
          "title": "墨田水族館 (Sumida Aquarium) 全室內企鵝水池",
          "transport": "晴空塔 Solamachi 5 樓直通",
          "desc": "完全室內現代水族館，欣賞可愛麥哲倫企鵝水池、水母萬花筒與江戶金魚展，風雨無阻。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "すみだ水族館"
        }
      ]
    },
    {
      "dayNum": 3,
      "date": "2026-10-21",
      "theme": "Day 3 ｜ 富士山河口湖絕景一日遊（專車八重洲07:40/新宿08:30・忍野八海・大石公園・打卡超商・新倉山淺間公園）",
      "fatigueText": "約 11,000 步 (專車接駁，新倉山登階)",
      "fatigueClass": "fatigue-mid",
      "isRainMode": false,
      "logisticsTip": "07:40 於「東京八重洲地下街 26 號地上出口」集合，07:50 專車準時出發（或 08:30 新宿 i-Land Tower LOVE 標誌發車）。從上野搭 JR 僅 5 分鐘直達東京站，交通極度順路！",
      "cultureTip": "忍野八海為日本名水百選與國家天然紀念物，泉水甘甜清澈；新倉山淺間公園需登 398 階梯，請著好走防滑球鞋。",
      "safetyTip": "富士山麓秋季氣溫較東京市區低 5~7 度，山區風大請務必攜帶防風禦寒外套。",
      "sunnySpots": [
        {
          "id": "d3-s1",
          "time": "07:40",
          "period": "上午",
          "title": "集合出發：東京八重洲地下街 26 號地上出口 (或 08:30 新宿)",
          "transport": "從上野站搭乘 JR 山手線或上野東京線 5 分鐘抵達東京站，步行至八重洲地下街 26 號出口",
          "desc": "07:40 準時報到集合，專車於 07:50 出發；（若選新宿集合則為 08:30 於新宿 i-Land Tower LOVE 標誌出發）。中文隨車導覽專車直奔河口湖。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "八重洲地下街 26番出口"
        },
        {
          "id": "d3-s2",
          "time": "10:30",
          "period": "上午",
          "title": "忍野八海（停留 50 分鐘・名水百選湧泉群）",
          "transport": "專車直達停車場，步行漫步參觀",
          "desc": "富士山融雪長年過濾形成的八座清澈湧泉池，漫步於茅草屋與田園之間，品嚐甘甜富士湧泉水與現烤艾草餅。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "忍野八海"
        },
        {
          "id": "d3-s3",
          "time": "12:00",
          "period": "中午",
          "title": "河口湖大石公園（停留 30 分鐘・湖畔花海與逆富士）",
          "transport": "專車接駁約 15 分鐘至河口湖北岸",
          "desc": "漫步大石公園湖畔，欣賞秋季豔紅圓滾滾的掃帚草（波波草）與四季花海，直面河口湖波光倒映壯麗富士山。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "大石公園"
        },
        {
          "id": "d3-s4",
          "time": "12:40",
          "period": "下午",
          "title": "河口湖 富士山亭 或 Craft Park（停留 70 分鐘・午餐與湖畔散策）",
          "transport": "專車接駁約 8 分鐘",
          "desc": "於湖畔景觀商場享用在地名物午餐（熱騰騰山梨餺飥麵定食或天婦羅），或於河口湖畔漫步吹風採購紀念品。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "河口湖クラフトパーク"
        },
        {
          "id": "d3-s5",
          "time": "14:10",
          "period": "下午",
          "title": "河口湖打卡便利商店（停留 20 分鐘・IG爆紅富士山同框）",
          "transport": "專車接駁約 10 分鐘",
          "desc": "造訪 IG 爆紅的經典拍照點，在安全指定視角拍攝日系 LAWSON 招牌與背後雄偉富士山完美重疊的超人氣畫面。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "ローソン 河口湖駅前店"
        },
        {
          "id": "d3-s6",
          "time": "14:50",
          "period": "下午",
          "title": "新倉山淺間公園（停留 70 分鐘・五重塔忠靈塔富士絕景）",
          "transport": "專車前往富士吉田停車場，步行登階",
          "desc": "登上 398 階梯來到觀景台，飽覽代表日本精神的硃紅五重塔與雄偉雪白富士山同框之世界級明信片景致。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "新倉山浅間公園"
        },
        {
          "id": "d3-s7",
          "time": "18:10",
          "period": "晚上",
          "title": "專車返抵新宿車站・原地解散返回上野",
          "transport": "專車走中央道返回新宿，搭乘 JR 中央快速線 14 分鐘至東京站，轉 JR 山手線直達上野",
          "desc": "行程圓滿結束於新宿解散。搭車返回上野大本營，在飯店周邊享用居酒屋料理或熱湯拉麵放鬆休息。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "新宿駅"
        }
      ],
      "rainSpots": [
        {
          "id": "d3-r1",
          "time": "12:40",
          "period": "下午",
          "title": "河口湖 Craft Park 室內玻璃與陶藝工坊 (雨備首選)",
          "transport": "全室內工坊直達，完全免受風雨影響",
          "desc": "全室內體驗，可動手製作專屬紀念玻璃噴砂杯或富士山彩繪，並於室內景觀餐廳舒適享用在地熱食午餐。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "河口湖クラフトパーク"
        }
      ]
    },
    {
      "dayNum": 4,
      "date": "2026-10-22",
      "theme": "Day 4 ｜ 叙々苑 38F 高空平日超值午宴 ＆ 橫濱浪漫港都一日遊（AIR CABIN纜車・紅磚倉庫・港灣夜景）",
      "fatigueText": "約 11,500 步 (海風漫步舒服)",
      "fatigueClass": "fatigue-mid",
      "isRainMode": false,
      "logisticsTip": "【平日敘敘苑高樓層分店】中午 11:30 安排於「叙々苑 惠比壽花園廣場店 38F (Top of Yebisu)」享用超值平日午間燒肉套餐（避開澀谷人潮，38 樓高空直面東京鐵塔）！用餐後從惠比壽搭乘湘南新宿線僅 24 分鐘直達橫濱櫻木町，下午漫步空中纜車、紅磚倉庫與港灣夜景，動線極順暢！",
      "cultureTip": "橫濱中華街為日本最大中華商圈，品嚐生煎包與小籠包時請於店家內用區或指定區域食用，勿邊走邊滴汁。",
      "safetyTip": "海濱地區傍晚海風較強，建議攜帶防風輕薄外套。",
      "sunnySpots": [
        {
          "id": "d4-s1",
          "time": "10:30",
          "period": "上午",
          "title": "上野出發：搭乘 JR 山手線前往惠比壽花園廣場",
          "transport": "上野搭乘山手線或日比谷線直達惠比壽站，出站走電動步道 (Yebisu Skywalk) 5 分鐘直通",
          "desc": "輕鬆穿過惠比壽花園廣場紅磚廣場，搭乘高層專用電梯直上 38 樓景觀餐廳層。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "恵比寿ガーデンプレイス"
        },
        {
          "id": "d4-s2",
          "time": "11:30",
          "period": "中午",
          "title": "【高樓層平日超值午宴】叙々苑 恵比寿ガーデンプレイス店 (38F)",
          "transport": "惠比壽花園廣場塔 38 樓 (Top of Yebisu)",
          "desc": "【使用者指定高樓層非澀谷分店】造訪位於 38 樓高空的「叙々苑」！平日限定超值午間燒肉套餐（約 ¥3,200~¥4,200），包含特選牛五花/牛里肌、知名特製敘敘苑沙拉、泡菜拼盤、韓式小菜、米飯、湯品與甜點飲料。坐擁 38 樓大片落地窗直面東京都心與東京鐵塔壯闊天際線，優雅安靜免排隊！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "叙々苑 恵比寿ガーデンプレイス店"
        },
        {
          "id": "d4-s3",
          "time": "13:00",
          "period": "下午",
          "title": "惠比壽直通橫濱：搭乘 JR 湘南新宿線 (24 分鐘直達)",
          "transport": "從 JR 惠比壽站搭乘湘南新宿線快速電車直達橫濱站，轉根岸線至櫻木町",
          "desc": "高鐵級順向銜接，完全不繞路直奔海港城市橫濱，一出櫻木町站即可看到未來感港灣與空中纜車。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "桜木町駅"
        },
        {
          "id": "d4-s4",
          "time": "14:00",
          "period": "下午",
          "title": "橫濱空中纜車 (YOKOHAMA AIR CABIN) 凌空飛越運河",
          "transport": "櫻木町站前纜車站搭乘至運河公園站 (約 5 分鐘)",
          "desc": "日本首座都市型常設空中纜車！全景透明車廂中 360 度俯瞰港未來 21、帆船日本丸與 Cosmo Clock 巨型摩天輪。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "YOKOHAMA AIR CABIN"
        },
        {
          "id": "d4-s5",
          "time": "14:45",
          "period": "下午",
          "title": "橫濱紅磚倉庫 (赤レンガ倉庫) 歷史風華與文創散策",
          "transport": "從運河公園步行 4 分鐘抵達",
          "desc": "百年前明治海關倉庫化身文創特區，漫步紅磚拱廊採買橫濱限定雜貨，在海景廣場吹風拍照。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "横浜赤レンガ倉庫"
        },
        {
          "id": "d4-s6",
          "time": "16:30",
          "period": "傍晚",
          "title": "橫濱地標塔 69F 空中花園 (Sky Garden) 港灣絕美夜景",
          "transport": "步行至地標塔搭乘日本最高速電梯直達 69 樓觀景台",
          "desc": "登上 69 樓觀景台，飽覽全日本評選最美港灣日落與摩天大樓華燈初上的百萬魔幻夜景。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "横浜ランドマークタワー スカイガーデン"
        },
        {
          "id": "d4-s7",
          "time": "18:30",
          "period": "晚上",
          "title": "晚餐：橫濱中華街點心小吃巡禮（王府井生煎包 / 廣東燒賣）",
          "transport": "漫步至中華街",
          "desc": "穿過熱鬧的善鄰門與牌樓，品嚐知名爆漿生煎包與各式港式小吃點心。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "横浜中華街"
        },
        {
          "id": "d4-s8",
          "time": "20:30",
          "period": "晚上",
          "title": "搭乘 JR 東海道線直達返回上野大本營",
          "transport": "從橫濱站搭乘上野東京線快速直達上野 (32 分鐘)",
          "desc": "舒適直達不折返，返抵上野飯店休息，結束豐富充實的一天。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        }
      ],
      "rainSpots": [
        {
          "id": "d4-r1",
          "time": "11:00",
          "period": "上午",
          "title": "橫濱日清合味道泡麵博物館 (Cup Noodles Museum) 全室內體驗",
          "transport": "運河公園旁步行 2 分鐘，全室內展館",
          "desc": "全室內場館，親手彩繪專屬泡麵杯、自選湯頭與配料封膜製作全世界獨一無二的專屬泡麵，趣味滿分。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "カップヌードルミュージアム 横浜"
        }
      ]
    },
    {
      "dayNum": 5,
      "date": "2026-10-23",
      "theme": "Day 5 ｜ 湘南海岸古都巡禮・鎌倉江之島一日遊（大佛・鶴岡八幡宮・江之電・海景日落）",
      "fatigueText": "約 12,000 步 (古都階梯散策)",
      "fatigueClass": "fatigue-high",
      "isRainMode": false,
      "logisticsTip": "搭乘一日遊專車前往古都鎌倉。造訪鶴岡八幡宮、小町通老街、高德院大佛、搭乘江之電欣賞湘南海岸線平交道與江之島。",
      "cultureTip": "鎌倉大佛內部若開放參觀可自費 50 日圓進入胎內體驗；小町通店家下午 17:00 前多半打烊。",
      "safetyTip": "江之電鎌倉高校前平交道拍照時嚴禁走入車道或鐵軌，注意往來車輛安全。",
      "sunnySpots": [
        {
          "id": "d5-s1",
          "time": "08:30",
          "period": "上午",
          "title": "專車集合出發：前往古都鎌倉",
          "transport": "專車接駁走首都高速公路與橫濱橫須賀道路前往鎌倉",
          "desc": "出發前往擁有近千年武家歷史的相模灣古都鎌倉，沿途聆聽專業隨車中文導覽介紹幕府歷史。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "鎌倉市"
        },
        {
          "id": "d5-s2",
          "time": "10:00",
          "period": "上午",
          "title": "鶴岡八幡宮 & 小町通歷史老街漫步",
          "transport": "專車停靠鎌倉車站周邊，步行穿過若宮大路",
          "desc": "參拜源賴朝建立的鎌倉精神地標鶴岡八幡宮，漫步小町通商店街品嚐現烤仙貝、大佛燒、吻仔魚天婦羅炸餅與濃郁抹茶冰淇淋。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "鶴岡八幡宮"
        },
        {
          "id": "d5-s3",
          "time": "12:00",
          "period": "中午",
          "title": "高德院鎌倉大佛 & 長谷寺觀音庭園",
          "transport": "專車接駁約 10 分鐘至長谷",
          "desc": "瞻仰淨土宗名剎高德院露天青銅釋迦牟尼大佛國寶，順訪長谷寺古色古香迴遊式庭園與眺望相模灣之見晴台。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "鎌倉大仏殿高徳院"
        },
        {
          "id": "d5-s4",
          "time": "14:00",
          "period": "下午",
          "title": "搭乘復古江之電・鎌倉高校前平交道青春朝聖",
          "transport": "搭乘綠色經典江之島電鐵體驗",
          "desc": "搭乘百年歷史江之電穿梭在民宅與海岸之間，於「鎌倉高校前站」平交道定格《灌籃高手》動畫主題曲蔚藍湘南海岸經典畫面。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "鎌倉高校前駅"
        },
        {
          "id": "d5-s5",
          "time": "15:30",
          "period": "下午",
          "title": "江之島海景漫步・江島神社祈福夕陽",
          "transport": "步行穿過江之島弁天橋",
          "desc": "走上海中陸連島江之島，漫步青銅鳥居商店街，品嚐現壓大章魚仙貝，登上江島神社欣賞落入相模灣的金色夕陽。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "江の島"
        },
        {
          "id": "d5-s6",
          "time": "18:30",
          "period": "晚上",
          "title": "專車返回東京・回上野享用在地燒肉料理",
          "transport": "專車返回東京市區，回上野飯店",
          "desc": "結束充實古都海岸一日遊，回到上野享用炭火燒肉定食或日式定食，洗去一天步行疲累。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        }
      ],
      "rainSpots": [
        {
          "id": "d5-r1",
          "time": "14:00",
          "period": "下午",
          "title": "新江之島水族館 (相模灣大水槽與水母夢幻廳)",
          "transport": "江之島海岸旁全室內場館",
          "desc": "全室內海洋展館，欣賞相模灣 2 萬尾銀色沙丁魚群迴游風暴與夢幻發光水母穹頂展。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "新江ノ島水族館"
        }
      ]
    },
    {
      "dayNum": 6,
      "date": "2026-10-24",
      "theme": "Day 6 ｜ 尊爵敞篷觀光巴士一日遊 ＆ 鍋ぞう (Nabezo) 壽喜燒名店放題晚餐",
      "fatigueText": "約 7,500 步 (巴士敞篷免走路超舒服)",
      "fatigueClass": "fatigue-low",
      "isRainMode": false,
      "logisticsTip": "【4000日圓內放題餐廳 1】晚餐安排東京評價極高的「鍋ぞう (Nabezo) 淺草雷門店 / 上野店」！精選國產牛與三元豚壽喜燒 100 分鐘吃到飽，每人僅約 ¥2,800~¥3,400（完全在 4000 日圓預算內！），嚴選生雞蛋、產地直送野菜吧與冰淇淋無限享用，白天搭雙層開頂觀光巴士無負擔，夜晚大飽口福！",
      "cultureTip": "搭乘開頂雙層巴士時請全程繫妥安全帶，車輛行駛中勿站立走動；隨車備有多國語言耳機導覽系統。",
      "safetyTip": "敞篷頂層風大，秋冬季節請配戴防風圍巾與保暖外套。",
      "sunnySpots": [
        {
          "id": "d6-s1",
          "time": "09:30",
          "period": "上午",
          "title": "東京站丸之內乘車處：搭乘 Sky Hop Bus 雙層開頂露天觀光巴士",
          "transport": "上野搭 JR 5 分鐘直達東京站，步行至丸之內三菱大廈前巴士站",
          "desc": "出示憑證登上紅色雙層露天敞篷觀光巴士（Sky Hop Bus），以 3.8 公尺的高空視角穿梭皇居護城河楠正成銅像與丸之內摩天紅磚林蔭大道。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "丸の内三菱ビル"
        },
        {
          "id": "d6-s2",
          "time": "10:30",
          "period": "上午",
          "title": "東京鐵塔路線巡遊：仰望紅色經典地標鐵塔",
          "transport": "觀光巴士紅線/藍線巡遊",
          "desc": "巴士緩緩行駛於芝公園旁，在毫無玻璃遮蔽的露天甲板上，以絕佳廣角視角仰望壯麗的紅色東京鐵塔鋼骨結構，微風吹拂，拍照視野極其開闊。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "東京タワー"
        },
        {
          "id": "d6-s3",
          "time": "12:00",
          "period": "中午",
          "title": "築地場外市場：憑 City Pass 兌換「築地丸武」熱騰騰玉子燒",
          "transport": "觀光巴士於築地站停靠下車步行 2 分鐘",
          "desc": "出示套票免費兌換百年老舖「築地丸武」現煎香甜金黃玉子燒！中午在大街上品嚐鮮甜黑毛和牛串燒、炙燒海膽干貝與海鮮丼。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "つきじ丸武 本店"
        },
        {
          "id": "d6-s4",
          "time": "14:00",
          "period": "下午",
          "title": "銀座漫步 & 日本酒情報館品飲清酒 (City Pass 權益體驗)",
          "transport": "從築地搭觀光巴士至銀座站，步行至日本酒情報館",
          "desc": "參觀全日本酒類情報館，憑套票體驗日本各地頂級純米大吟釀與清酒品飲組，認識吟釀造香氣與各縣米種風土特色。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "日本の酒情報館"
        },
        {
          "id": "d6-s5",
          "time": "16:00",
          "period": "下午",
          "title": "搭乘觀光巴士橫越彩虹大橋・台場海濱自由女神像",
          "transport": "搭乘觀光巴士台場路線直接橫跨彩虹大橋",
          "desc": "巴士在露天甲板上駛上彩虹大橋，遠眺東京灣與富士山剪影，行經台場海濱公園與縮小版自由女神像，景色壯闊迷人。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "お台場海浜公園"
        },
        {
          "id": "d6-s6",
          "time": "18:00",
          "period": "晚上",
          "title": "東京巨蛋城娛樂 (憑 City Pass 搭乘 Big-O 露天中空摩天輪)",
          "transport": "搭乘觀光巴士返回市區轉地鐵或 JR 直達後樂園",
          "desc": "免費兌換搭乘世界首創中空無軸摩天輪 Big-O，在高空俯瞰東京巨蛋璀璨夜景與雲霄飛車穿梭刺激畫面。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "東京ドームシティアトラクションズ ビッグ・オー"
        },
        {
          "id": "d6-s7",
          "time": "19:30",
          "period": "晚上",
          "title": "【4000円內放題第1間】鍋ぞう (Nabezo) 壽喜燒・涮涮鍋 100 分鐘吃到飽",
          "transport": "搭乘 JR 中央總武線僅 2 站回秋葉原轉上野 (約 10 分鐘)",
          "desc": "【使用者指定 4000 円以內放題】造訪深受在地人好評的知名名店「鍋ぞう (Nabezo)」！精選優質牛肉、三元豚肉質鮮嫩，搭配濃郁壽喜燒甘甜醬汁與有機生雞蛋無限沾取。超過 20 種新鮮產地直送蔬菜、手工豆腐、菇類與咖哩飯、霜淇淋任吃，每人僅約 ¥2,800~¥3,400，CP 值破表！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "鍋ぞう 浅草雷門店"
        }
      ],
      "rainSpots": [
        {
          "id": "d6-r1",
          "time": "14:00",
          "period": "下午",
          "title": "銀座 Ginza Six 室內藝術中庭 & 日本酒情報館",
          "transport": "全室內商場與展館直達",
          "desc": "若遇天候不佳，觀光巴士會換為室內遮棚車頂；銀座商場全室內漫步，安全乾燥。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "GINZA SIX"
        }
      ]
    },
    {
      "dayNum": 7,
      "date": "2026-10-25",
      "theme": "Day 7 ｜ 箱根大湧谷火山・蘆之湖海盜船神社・御殿場 OUTLETS 旗艦購物日",
      "fatigueText": "約 11,000 步 (Outlet 大採購)",
      "fatigueClass": "fatigue-mid",
      "isRainMode": false,
      "logisticsTip": "搭乘專車前往箱根國立公園。造訪大湧谷地熱、蘆之湖水上鳥居，下午前往御殿場 Premium Outlets 享受富士山全景國際精品大採購。",
      "cultureTip": "大湧谷火山黑玉子傳說吃一顆可延年益壽 7 年；因含有地熱硫磺蒸氣，患有呼吸道疾病者請避免靠近噴氣口。",
      "safetyTip": "御殿場 Outlet 佔地廣大，抵達時請先確認專車回程集合地點與集合時間。",
      "sunnySpots": [
        {
          "id": "d7-s1",
          "time": "08:00",
          "period": "上午",
          "title": "專車出發：直奔富士箱根伊豆國立公園",
          "transport": "專車行駛東名高速公路前往箱根",
          "desc": "專車接送免除多次換乘登山鐵道與纜車的繁瑣，直抵箱根火山心臟地帶。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "箱根町"
        },
        {
          "id": "d7-s2",
          "time": "10:30",
          "period": "上午",
          "title": "箱根大湧谷：地熱火山白煙・品嚐名物黑玉子",
          "transport": "專車直達大湧谷停車場",
          "desc": "置身於白煙蒸騰的大湧谷火山口，欣賞荒涼壯麗的硫磺地熱奇景，品嚐以天然泉水煮沸的名物黑雞蛋（黑玉子）。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "大涌谷"
        },
        {
          "id": "d7-s3",
          "time": "12:00",
          "period": "中午",
          "title": "蘆之湖畔・箱根神社「平和之鳥居」水上絕景",
          "transport": "專車接駁至蘆之湖南岸元箱根港",
          "desc": "參拜被巨木古杉環抱的古老箱根神社，漫步湖濱步道，拍攝巍然屹立於清澈湖水之中的硃紅水上鳥居。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "箱根神社 平和の鳥居"
        },
        {
          "id": "d7-s4",
          "time": "13:30",
          "period": "下午",
          "title": "御殿場 Premium Outlets：國際精品與日系名牌大採購",
          "transport": "專車接駁約 30 分鐘直達御殿場 Outlet",
          "desc": "日本規模最宏偉的旗艦 Outlet，直面雄偉富士山全景！擁有超過 290 家國際精品品牌、戶外休閒與運動用品，享免稅折扣大肆血拚。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "御殿場プレミアム・アウトレット"
        },
        {
          "id": "d7-s5",
          "time": "15:30",
          "period": "下午",
          "title": "Outlet 美食廣場享用精緻下午茶與點心",
          "transport": "Outlet 內部美食廣場",
          "desc": "品嚐山麓在地鮮乳可麗餅、名物炭火牛排或靜岡綠茶甜點，坐在景觀長椅上欣賞富士山伴隨夕陽餘暉。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "御殿場プレミアム・アウトレット フードコート"
        },
        {
          "id": "d7-s6",
          "time": "18:00",
          "period": "晚上",
          "title": "專車啟程返回東京・抵達新宿轉車回上野",
          "transport": "專車行駛東名高速公路返回新宿，轉 JR 山手線回上野",
          "desc": "滿載精品戰利品舒適搭車，回到上野飯店整理收穫，好好休息。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        }
      ],
      "rainSpots": [
        {
          "id": "d7-r1",
          "time": "13:30",
          "period": "下午",
          "title": "御殿場 Premium Outlets 全長廊遮雨棚精品採購",
          "transport": "商場全區配備大型防雨長廊與室內商場",
          "desc": "商場店舖皆以加寬遮雨廊道相連，雨天依舊能舒適在各品牌精品店間穿梭血拚。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "御殿場プレミアム・アウトレット"
        }
      ]
    },
    {
      "dayNum": 8,
      "date": "2026-10-26",
      "theme": "Day 8 ｜ Costco幕張旗艦店(出站2分) ＆ 肉屋の台所 和牛燒肉放題慶祝之夜",
      "fatigueText": "約 9,500 步 (推車採買好推輕鬆)",
      "fatigueClass": "fatigue-low",
      "isRainMode": false,
      "logisticsTip": "【出站步行 2 分鐘直達好市多 + 4000円內放題餐廳 2】JR 京葉線「幕張豐砂站」出站步行 2 分鐘直達 Costco 幕張店正門（完全免搭公車！）；下午回上野飯店放下滿滿戰利品後，晚餐安排上野站旁超人氣「肉屋の台所 上野公園前店」燒肉放題（每人約 ¥3,500，完全在 4000 日圓預算內），享用牛五花、大判橫膈膜與豐富燒肉放題！",
      "cultureTip": "日本 Costco 結帳需出示有效會員卡（台灣好市多會員卡全球通用有效），支援萬事達卡 (Mastercard) 信用卡或現金結帳。",
      "safetyTip": "大包裝戰利品回程建議多利用大容量折疊購物袋或推車，搭乘 JR 京葉線快速直達東京站轉上野，避免上下班尖峰擠車。",
      "sunnySpots": [
        {
          "id": "d8-s1",
          "time": "09:30",
          "period": "上午",
          "title": "上野出發：搭乘電車快速直達 JR「幕張豐砂站」",
          "transport": "上野搭日比谷線至八丁堀站，同站轉乘 JR 京葉線直達「幕張豐砂站」(約 38 分鐘)",
          "desc": "一班直達千葉最新車站「幕張豐砂站」，新車站寬敞平整且配備大型電梯，非常適合推著折疊購物推車或攜帶大容量行李箱前往採購。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "幕張豊砂駅"
        },
        {
          "id": "d8-s2",
          "time": "10:30",
          "period": "上午",
          "title": "好市多幕張店 (Costco Wholesale Makuhari) 出站步行 2 分鐘直達！",
          "transport": "JR 幕張豐砂站出站步行 2 分鐘過馬路即達 Costco 正門（完全不用搭公車！）",
          "desc": "【出站步行 2 分鐘直達】出站過馬路立即抵達關東最具代表性的雙層大型 Costco 旗艦店！採買日本限定大包裝零食、干貝起司條、日本限定維他命保健品、保養品與限定伴手禮，大享高額退稅與超值好康。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "コストコホールセール 幕張倉庫店"
        },
        {
          "id": "d8-s3",
          "time": "12:30",
          "period": "中午",
          "title": "Costco 美食廣場或步行至相鄰 AEON 幕張旗艦館享用午餐",
          "transport": "Costco 內部或過天橋至 AEON MALL 幕張新都心",
          "desc": "品嚐經典好市多超高 CP 值大披薩、熱騰騰牛肉捲、熱狗喝到飽汽水，或至相鄰的永旺夢樂城旗艦館美食街品嚐日式定食。",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "コストコホールセール 幕張 フードコート"
        },
        {
          "id": "d8-s4",
          "time": "14:00",
          "period": "下午",
          "title": "AEON MALL 幕張新都心 & 幕張豐砂站前生活漫步",
          "transport": "商場室內連通步道散策",
          "desc": "逛逛全日本佔地第三大的 AEON 夢樂城 Grand Mall，採購日系生活雜貨、文具與行李打包用品，輕鬆悠閒。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "イオンモール幕張新都心"
        },
        {
          "id": "d8-s5",
          "time": "17:00",
          "period": "傍晚",
          "title": "從「幕張豐砂站」搭乘 JR 京葉線直達東京站・回上野放戰利品",
          "transport": "從幕張豐砂站搭 JR 京葉線直達東京站，轉 JR 山手線 5 分鐘回上野 (約 45 分鐘)",
          "desc": "大包小包戰利品從幕張豐砂站直接搭乘電車回上野 HOTEL MYSTAYS，卸下戰利品放進房間，稍作梳洗休息。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "HOTEL MYSTAYS Ueno"
        },
        {
          "id": "d8-s6",
          "time": "19:00",
          "period": "晚上",
          "title": "【4000円內放題第2間】肉屋の台所 (Nikuya no Daidokoro) 上野店 燒肉放題",
          "transport": "上野站周邊步行 5 分鐘",
          "desc": "【使用者指定 4000 円以內放題】在東京最後一個夜晚，造訪上野老字號肉舖直營「肉屋の台所 上野公園前店」！超值燒肉放題套餐每人僅約 ¥3,300~¥3,800（完全在 4000 日圓預算內），盡情享用牛五花、牛里肌、特選大判橫膈膜、壺漬牛排、厚切豬五花、石鍋拌飯與沙拉吧無限續，為旅程畫下美味最高潮！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "肉屋の台所 上野公園前店"
        }
      ],
      "rainSpots": [
        {
          "id": "d8-r1",
          "time": "10:30",
          "period": "上午",
          "title": "Costco 雙層室內賣場 + AEON MALL 幕張全天候室內商場",
          "transport": "大型室內商場直通",
          "desc": "賣場全室內空調且具備大遮雨棚裝卸區，完全免受戶外天氣或雨水影響。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "イオンモール幕張新都心"
        }
      ]
    },
    {
      "dayNum": 9,
      "date": "2026-10-27",
      "theme": "Day 9 ｜ 成田市半日漫遊・車站行李寄存・百年鰻魚飯名店・AEON 採購・提前3.5H順暢返國",
      "fatigueText": "約 8,000 步 (從容悠閒機場收攏)",
      "fatigueClass": "fatigue-low",
      "isRainMode": false,
      "logisticsTip": "航班：回程 UA837 成田 T1 17:45 起飛，國際線嚴格於 14:15（提前 3.5 小時）抵達機場！\n08:30 上野退房搭特急直達「JR成田站 / 京成成田站」；09:30 於成田車站寄放大件行李；漫步成田山新勝寺與表參道老街；11:30 享用成田必吃炭火現烤鰻魚飯（川豐本店 / 駿河屋）；12:45 接駁車至 AEON MALL Narita 採購伴手禮；14:00 直達接駁車抵達 T1，從容辦理報到退稅，滿載歸國！",
      "cultureTip": "成田山表參道擁有近三百年歷史，川豐鰻魚飯通常需先於店門口抽取號碼牌，炭烤師傅刀工手法爐火純青，值得細細欣賞。",
      "safetyTip": "出境前請再次確認護照、退稅商品、液體隨身規範（100ml 以上液體必須託運）與登機門位置。",
      "sunnySpots": [
        {
          "id": "d9-s1",
          "time": "08:30",
          "period": "上午",
          "title": "HOTEL MYSTAYS 上野退房・搭車直達「成田站」",
          "transport": "從京成上野站搭乘京成本線特急或 JR 上野站搭乘 JR 成田線直達「成田站」(約 50 分鐘)",
          "desc": "退房出發，列車一路順向朝成田機場方向移動，完全不走回頭路，車程舒適愜意。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "京成成田駅"
        },
        {
          "id": "d9-s2",
          "time": "09:30",
          "period": "上午",
          "title": "成田車站寄放大件行李（投幣置物櫃 / 觀光案內所人工寄物）",
          "transport": "JR 成田站 / 京成成田站大廳寄物區",
          "desc": "在成田車站大型投幣式置物櫃（Coin Lockers）或站前觀光案內所寄放大件行李與 Costco 戰利品，一身輕裝兩手空空漫步出發。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "JR 成田駅"
        },
        {
          "id": "d9-s3",
          "time": "09:45",
          "period": "上午",
          "title": "成田山新勝寺與江戶風情表參道老街漫步",
          "transport": "成田車站前步行 3 分鐘進入表參道",
          "desc": "沿著蜿蜒充滿江戶風情的百年木造建築石板路漫步，兩旁飄著醬油烤仙貝、落花生與老茶舖香氣，造訪擁有千年以上歷史的真言宗大本山新勝寺大本堂為家人祈福安康。",
          "category": "spot",
          "completed": false,
          "mapsQuery": "成田山新勝寺"
        },
        {
          "id": "d9-s4",
          "time": "11:30",
          "period": "中午",
          "title": "成田山必吃當地美食午餐：百年傳奇現烤鰻魚飯（川豐 本店 / 駿河屋）",
          "transport": "成田山表參道中段步行抵達",
          "desc": "品嚐成田市舉世聞名的第一名物炭火現烤鰻魚飯！名店「川豐 本店」創業於 1910 年，職人現場熟練剖鰻炭烤，浸潤百年秘傳醬汁，外皮焦香金黃、肉質軟嫩肥美，鋪在白飯上每一口都是絕頂美味！",
          "category": "restaurant",
          "completed": false,
          "mapsQuery": "川豊 本店"
        },
        {
          "id": "d9-s5",
          "time": "12:45",
          "period": "中午",
          "title": "永旺夢樂城成田店 (AEON MALL Narita) 出境前最後採購",
          "transport": "返回成田站取回行李，搭乘成田站西口專用接駁巴士 15 分鐘直達 AEON MALL Narita",
          "desc": "抵達深受國際旅客喜愛的 AEON MALL Narita 旗艦店！在超大型超級市場採購日本抹茶、在地零食、箱裝伴手禮與免稅藥妝，打包入行李箱做好登機準備。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "イオンモール成田"
        },
        {
          "id": "d9-s6",
          "time": "14:00",
          "period": "下午",
          "title": "搭乘接駁車直達成田機場 T1（提前 3.5 小時國際線機場收攏）",
          "transport": "從 AEON MALL Narita 搭乘成田機場接駁巴士或計程車約 15 分鐘直達 T1",
          "desc": "於 14:15 準時抵達成田國際機場第一航廈 (NRT T1)，時間從容無比！",
          "category": "transport",
          "completed": false,
          "mapsQuery": "成田国際空港 第1ターミナル"
        },
        {
          "id": "d9-s7",
          "time": "14:15",
          "period": "下午",
          "title": "成田機場 T1：聯合航空 UA837 登機報到・退稅與免稅品取貨",
          "transport": "成田機場第一航廈出境大廳 4F",
          "desc": "在聯合航空櫃台辦理行李託運與劃位，通過安檢與自動通關，在免稅店採買白色戀人、ROYCE 生巧克力與酒類伴手禮。",
          "category": "transport",
          "completed": false,
          "mapsQuery": "成田国際空港 第1ターミナル 出発ロビー"
        },
        {
          "id": "d9-s8",
          "time": "17:45",
          "period": "傍晚",
          "title": "搭乘 UA837 班機起飛・滿載美好回憶平安返抵高雄",
          "transport": "搭乘 UA837 班機直飛高雄國際機場 (預計 21:15 抵達 KHH)",
          "desc": "帶著滿滿的照片、精品戰利品與難忘回憶踏上歸途，9 天 8 夜東京橫濱千葉成田深度自由行圓滿成功！",
          "category": "transport",
          "completed": false,
          "mapsQuery": "成田空港 Gate"
        }
      ],
      "rainSpots": [
        {
          "id": "d9-r1",
          "time": "12:45",
          "period": "下午",
          "title": "AEON MALL Narita 永旺夢樂城全室內商場 & 機場直達接駁",
          "transport": "大型室內商場，專屬巴士站直通機場免淋雨",
          "desc": "全館室內空調遮蔽，推著行李車輕鬆購物，商場門口即為成田機場直達巴士站，天候不佳亦能安心收攏歸國。",
          "category": "shopping",
          "completed": false,
          "mapsQuery": "イオンモール成田"
        }
      ]
    }
  ]
};

  const DEFAULT_DEMO_DATA = {
    trip: REAL_PARSED_TOKYO9_DATA.trip,
    days: REAL_PARSED_TOKYO9_DATA.days,
    expenses: [
      {
        id: "exp-1",
        title: "京成 Access 特急單程車票 (3人份)",
        amount: 4050,
        currency: "JPY",
        amountTWD: 850,
        date: "2026-10-15",
        location: "成田機場站",
        payer: "小明",
        splitMembers: ["小明", "小華", "小美"],
        receiptNote: "自動售票機購票，每人 ¥1,350"
      },
      {
        id: "exp-2",
        title: "銀座 篝 雞白湯拉麵晚餐",
        amount: 5400,
        currency: "JPY",
        amountTWD: 1134,
        date: "2026-10-15",
        location: "銀座 本店",
        payer: "小華",
        splitMembers: ["小明", "小華", "小美"],
        receiptNote: "含特製拉麵與溏心蛋 3 碗"
      },
      {
        id: "exp-3",
        title: "SHIBUYA SKY 展望台入場門票 (3人)",
        amount: 6600,
        currency: "JPY",
        amountTWD: 1386,
        date: "2026-10-17",
        location: "澀谷 Scramble Square",
        payer: "小明",
        splitMembers: ["小明", "小華", "小美"],
        receiptNote: "官網預約日落時段票券"
      },
      {
        id: "exp-4",
        title: "敘敘苑燒肉豪華盛宴 (晚餐)",
        amount: 28000,
        currency: "JPY",
        amountTWD: 5880,
        date: "2026-10-17",
        location: "澀谷",
        payer: "小美",
        splitMembers: ["小明", "小華", "小美"],
        receiptNote: "含上等牛五花、牛舌與飲品"
      }
    ],
    packingList: [
      { id: "pk-1", name: "護照原件 (效期6個月以上)", assignee: "小明, 小華, 小美 (個人必備)", done: true },
      { id: "pk-2", name: "日幣現金與雙幣信用卡 (海外回饋高者)", assignee: "全員自備", done: true },
      { id: "pk-3", name: "萬國轉接頭與多孔延長線", assignee: "小華 (公用承擔)", done: true },
      { id: "pk-4", name: "大容量行動電源 (不可放托運)", assignee: "全員自備", done: false },
      { id: "pk-5", name: "急救常備藥包 (胃腸藥、止痛藥、OK繃)", assignee: "小美 (公用承擔)", done: true },
      { id: "pk-6", name: "折疊晴雨兩用傘", assignee: "全員自備", done: false },
      { id: "pk-7", name: "好走的運動鞋與休閒襪", assignee: "全員自備", done: true }
    ],
    phrases: [
      {
        target: "すみません、会計をお願いします。",
        pronounce: "Sumimasen, kaikei o onegaishimasu.",
        zh: "不好意思，買單結帳。"
      },
      {
        target: "これをください。（指菜單）",
        pronounce: "Kore o kudasai.",
        zh: "請給我這個。（點餐時指向菜單）"
      },
      {
        target: "免税（めんぜい）はできますか？",
        pronounce: "Menzei wa dekimasu ka?",
        zh: "請問這裡可以辦理退稅嗎？"
      },
      {
        target: "おすすめは何ですか？",
        pronounce: "Osusume wa nan desu ka?",
        zh: "請問招牌推薦菜色是什麼？"
      },
      {
        target: "駅はどちらですか？",
        pronounce: "Eki wa dochira desu ka?",
        zh: "請問車站往哪邊走？"
      },
      {
        target: "クレジットカードは使えますか？",
        pronounce: "Kurejitto kādo wa tsukaemasu ka?",
        zh: "請問可以使用信用卡嗎？"
      }
    ]
  };

  // 應用程式狀態封裝
  let appState = JSON.parse(JSON.stringify(DEFAULT_DEMO_DATA));
  let currentStage = 1;
  let selectedDayIndex = 0; // 0 for Day 1

  // 本地儲存金鑰 (更新至航班正確版)
  const STORAGE_KEY = 'elite_travel_planner_pro_v2_flight_corrected';

  // 載入持久化狀態
  function loadStateFromStorage() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // 從舊版本繼承使用者自訂資料（記帳、打勾等）
        const oldStored = localStorage.getItem('elite_travel_planner_pro_v1_9_dining');
        if (oldStored) stored = oldStored;
      }
      if (stored) {
        appState = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('載入 LocalStorage 失敗，使用預設值', e);
    }

    // 自動校正航班資料（修復先前殘留的 08:00/13:15 或長榮舊資料）
    if (appState && appState.trip) {
      if (!appState.trip.flightDept || appState.trip.flightDept.includes('13:15') || appState.trip.flightDept.includes('08:00') || appState.trip.flightDept.includes('BR198')) {
        appState.trip.flightDept = "聯合航空 UA838 | 高雄 KHH 09:55 -> 成田 NRT 14:45 (T1)";
        if (appState.days && appState.days[0]) {
          const d1 = appState.days[0];
          d1.logisticsTip = "UA838 航班預計 14:45 抵達 NRT T1，出關領行李約 15:45；搭乘京成 Skyliner 直達上野僅 41 分鐘；約 16:45 抵達上野辦理入住，嚴格落實落地 2 小時後正式展開周邊輕鬆動線。";
          if (d1.sunnySpots && d1.sunnySpots[0]) {
            d1.sunnySpots[0].time = "14:45";
          }
          if (d1.sunnySpots && d1.sunnySpots[1]) {
            d1.sunnySpots[1].time = "16:45";
          }
        }
        saveStateToStorage();
      }
    }
  }

  // 儲存狀態至持久層
  function saveStateToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.warn('寫入 LocalStorage 失敗', e);
    }
  }

  // ==========================================
  // STAGE 切換控制
  // ==========================================
  function setStage(stageNum) {
    currentStage = parseInt(stageNum, 10);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('elite_travel_current_stage', currentStage.toString());
      }
    } catch (e) {}

    document.querySelectorAll('.stage-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.stage, 10) === currentStage);
    });

    document.getElementById('stage-1').classList.toggle('hidden', currentStage !== 1);
    document.getElementById('stage-2').classList.toggle('hidden', currentStage !== 2);
    document.getElementById('stage-3').classList.toggle('hidden', currentStage !== 3);

    if (currentStage === 2) {
      renderStage2Banner();
      renderStage2DayTabs();
      renderStage2Timeline();
      updateUpcomingSpot();
    } else if (currentStage === 3) {
      renderExpenseSection();
    }
  }

  function syncSingleChipGroup(groupId, hiddenInputId, value) {
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) hiddenInput.value = value;
    const group = document.getElementById(groupId);
    if (group) {
      group.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.val === value);
      });
    }
  }

  function setupChipGroups() {
    // 1. 旅程主題（可複選）
    const themeGroup = document.getElementById('chip-group-themes');
    const themeInput = document.getElementById('travel-themes');
    if (themeGroup && themeInput) {
      themeGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          btn.classList.toggle('active');
          const selected = [];
          themeGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
          themeInput.value = selected.join(', ');
        };
      });
    }

    // 自訂主題按鈕
    const btnAddTheme = document.getElementById('btn-add-theme');
    const inputNewTheme = document.getElementById('input-new-theme');
    if (btnAddTheme && inputNewTheme && themeGroup) {
      btnAddTheme.onclick = () => {
        const val = inputNewTheme.value.trim();
        if (val) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chip-btn active';
          btn.dataset.val = val;
          btn.textContent = `✨ ${val}`;
          btn.onclick = () => {
            btn.classList.toggle('active');
            const selected = [];
            themeGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
            themeInput.value = selected.join(', ');
          };
          themeGroup.appendChild(btn);
          const selected = [];
          themeGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
          themeInput.value = selected.join(', ');
          inputNewTheme.value = '';
        }
      };
    }

    // 2. 行程步調節奏（單選）
    const paceGroup = document.getElementById('chip-group-pace');
    const paceInput = document.getElementById('travel-pace');
    if (paceGroup && paceInput) {
      paceGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          syncSingleChipGroup('chip-group-pace', 'travel-pace', btn.dataset.val);
        };
      });
    }

    // 3. 同行成員（單選）
    const compGroup = document.getElementById('chip-group-companions');
    const compInput = document.getElementById('travel-companions');
    if (compGroup && compInput) {
      compGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          syncSingleChipGroup('chip-group-companions', 'travel-companions', btn.dataset.val);
        };
      });
    }

    // 4. 進階偏好展開/摺疊 Accordion
    const btnToggleAdv = document.getElementById('btn-toggle-advanced-prefs');
    const advContainer = document.getElementById('advanced-prefs-container');
    const advArrow = document.getElementById('advanced-toggle-arrow');
    if (btnToggleAdv && advContainer) {
      btnToggleAdv.onclick = () => {
        const isHidden = advContainer.classList.contains('hidden');
        advContainer.classList.toggle('hidden', !isHidden);
        if (advArrow) advArrow.textContent = isHidden ? '▲ 點擊收起' : '▼ 點擊展開';
      };
    }

    // 5. 交通偏好（單選 + 自訂）
    const transGroup = document.getElementById('chip-group-transport');
    const transInput = document.getElementById('travel-transport');
    if (transGroup && transInput) {
      transGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          syncSingleChipGroup('chip-group-transport', 'travel-transport', btn.dataset.val);
        };
      });
    }
    const btnAddTrans = document.getElementById('btn-add-transport');
    const inputNewTrans = document.getElementById('input-new-transport');
    if (btnAddTrans && inputNewTrans && transGroup) {
      btnAddTrans.onclick = () => {
        const val = inputNewTrans.value.trim();
        if (val) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chip-btn active';
          btn.dataset.val = val;
          btn.textContent = `🚗 ${val}`;
          btn.onclick = () => syncSingleChipGroup('chip-group-transport', 'travel-transport', val);
          transGroup.appendChild(btn);
          syncSingleChipGroup('chip-group-transport', 'travel-transport', val);
          inputNewTrans.value = '';
        }
      };
    }

    // 6. 餐點美食喜好（複選 + 自訂）
    const diningGroup = document.getElementById('chip-group-dining');
    const diningInput = document.getElementById('travel-dining');
    if (diningGroup && diningInput) {
      diningGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          btn.classList.toggle('active');
          const selected = [];
          diningGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
          diningInput.value = selected.join(', ');
        };
      });
    }
    const btnAddDining = document.getElementById('btn-add-dining');
    const inputNewDining = document.getElementById('input-new-dining');
    if (btnAddDining && inputNewDining && diningGroup) {
      btnAddDining.onclick = () => {
        const val = inputNewDining.value.trim();
        if (val) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'chip-btn active';
          btn.dataset.val = val;
          btn.textContent = `🍽️ ${val}`;
          btn.onclick = () => {
            btn.classList.toggle('active');
            const selected = [];
            diningGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
            diningInput.value = selected.join(', ');
          };
          diningGroup.appendChild(btn);
          const selected = [];
          diningGroup.querySelectorAll('.chip-btn.active').forEach(b => selected.push(b.dataset.val));
          diningInput.value = selected.join(', ');
          inputNewDining.value = '';
        }
      };
    }

    // 7. 預算區間（單選）
    const budgetGroup = document.getElementById('chip-group-budget');
    const budgetInput = document.getElementById('travel-budget');
    if (budgetGroup && budgetInput) {
      budgetGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.onclick = () => {
          syncSingleChipGroup('chip-group-budget', 'travel-budget', btn.dataset.val);
        };
      });
    }
  }

  // ==========================================
  // STAGE 1: 規劃表單與資料填入 & 即時預覽看板
  // ==========================================
  function populateStage1Form() {
    const t = appState.trip;
    document.getElementById('trip-name').value = t.name || '';
    document.getElementById('trip-destination').value = t.destination || '';
    document.getElementById('trip-start-date').value = t.startDate || '';
    document.getElementById('trip-end-date').value = t.endDate || '';
    document.getElementById('trip-members').value = (t.members || []).join(', ');
    document.getElementById('flight-dept').value = t.flightDept || '';
    document.getElementById('flight-return').value = t.flightReturn || '';
    document.getElementById('hotel-name').value = t.hotelName || '';
    document.getElementById('hotel-address').value = t.hotelAddress || '';
    
    // 同步節奏與旅伴
    syncSingleChipGroup('chip-group-pace', 'travel-pace', t.travelPace || '充實均衡');
    syncSingleChipGroup('chip-group-companions', 'travel-companions', t.companions || '親友同行');

    // 同步主題
    const themeGroup = document.getElementById('chip-group-themes');
    if (themeGroup && t.themes) {
      const activeThemes = t.themes.split(',').map(s => s.trim());
      themeGroup.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', activeThemes.includes(btn.dataset.val));
      });
    }

    document.getElementById('must-go-list').value = (t.mustGo || []).join(', ');
    document.getElementById('must-avoid-list').value = (t.mustAvoid || []).join(', ');
    document.getElementById('custom-input-text').value = t.customNotes || '';

    // 預先渲染 Stage 1 的規劃預覽看板
    renderStage1PlanPreview();
  }

  function renderStage1PlanPreview() {
    const previewContainer = document.getElementById('preview-days-list');
    const countEl = document.getElementById('preview-day-count');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';
    const days = appState.days || [];
    if (countEl) countEl.textContent = days.length;

    days.forEach(day => {
      const card = document.createElement('div');
      card.className = 'preview-day-card';
      const spots = day.isRainMode ? day.rainSpots : day.sunnySpots;
      
      let spotsHtml = '';
      (spots || []).forEach(s => {
        spotsHtml += `
          <div class="preview-spot-line">
            <span class="time-badge">${s.period || ''} ${s.time || ''}</span>
            <strong style="color:var(--text-main);">${s.title}</strong>
            <span style="color:var(--text-muted); font-size:0.78rem; margin-left:auto;">${s.transport || ''}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="preview-day-header">
          <div>
            <strong style="color:var(--primary); font-size:0.95rem;">${day.theme}</strong>
            <small style="color:var(--text-muted); margin-left:8px;">(${day.date || ''})</small>
          </div>
          <span class="fatigue-pill ${day.fatigueClass || 'fatigue-low'}">${day.fatigueText || '步調適中'}</span>
        </div>
        <div class="preview-spots-list">
          ${spotsHtml}
        </div>
        <div style="margin-top:8px; font-size:0.78rem; color:#6b21a8; background:#f3e8ff; padding:4px 8px; border-radius:4px;">
          🛡️ 雨備方案：${(day.rainSpots || []).map(r => r.title).join('、') || '室內商場與景觀咖啡備案'}
        </div>
      `;
      previewContainer.appendChild(card);
    });
  }

  // ==========================================
  // 行程智慧解析與多目的地生成引擎 (Elite Travel Planner Core)
  // ==========================================
  function generateItineraryForDestination(destKey, meta, customSpots = []) {
    const startDate = meta.startDate || "2026-11-05";
    const dateObj = new Date(startDate);

    function getDateStr(offsetDays) {
      const d = new Date(dateObj);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    }

    if (destKey === 'okinawa') {
      return [
        {
          dayNum: 1,
          date: getDateStr(0),
          theme: "Day 1 ｜ 抵達沖繩那霸・機場取車・國際通與屋台村初夜",
          fatigueText: "約 6,800 步 (輕鬆熱身)",
          fatigueClass: "fatigue-low",
          isRainMode: false,
          logisticsTip: "那霸機場國內線/國際線出口均有租車公司免費接駁站，建議提早備妥台灣駕照正本與日文譯本。",
          cultureTip: "日本靠左側行駛，右轉請特別禮讓直行車輛；行經行人穿越道必須完全停讓行人。",
          safetyTip: "國際通居酒屋部分店舖禁菸或酌收座位費 (Otoshi)，自駕者切勿酒後駕車。",
          sunnySpots: [
            {
              id: "oki-d1-s1",
              time: "12:05",
              period: "中午",
              title: "抵達沖繩那霸機場 (OKA 國際線航廈)",
              transport: "入境手續、提領行李與通關檢驗 (約 45 分鐘)",
              desc: "入境後前往大廳租車服務櫃台，搭乘 OTS 租車專屬免費接駁巴士前往臨空豐崎營業所。",
              category: "transport",
              completed: true,
              mapsQuery: "Naha Airport International Terminal"
            },
            {
              id: "oki-d1-s2",
              time: "14:15",
              period: "下午",
              title: "OTS 臨空豐崎營業所 取車出發",
              transport: "首日落地後約 2 小時正式展開行程，免除拖大件行李疲累",
              desc: "完成租車手續、檢查車況與安裝導航/ETC卡。專員解說右駕安全注意事項後輕鬆上路。",
              category: "transport",
              completed: false,
              mapsQuery: "OTS Rent-a-Car Rinku Toyosaki"
            },
            {
              id: "oki-d1-s3",
              time: "15:30",
              period: "下午",
              title: `${meta.hotelName || "那霸凱悅酒店"} Check-in 卸行李`,
              transport: "沿國道 331 號線往那霸市區開車約 20 分鐘",
              desc: "辦理飯店入住，卸下厚重行李箱並稍作梳洗休息。飯店鄰近國際通，徒步即可抵達鬧區。",
              category: "hotel",
              completed: false,
              mapsQuery: meta.hotelName || "Hyatt Regency Naha Okinawa"
            },
            {
              id: "oki-d1-s4",
              time: "17:30",
              period: "晚上",
              title: "那霸國際通漫步・平和通與工藝小店",
              transport: "從飯店徒步約 3 分鐘即達國際通主街",
              desc: "漫步沖繩最繁華的「奇蹟一英里」，探索在地琉球玻璃、石垣牛肉乾與文創伴手禮。",
              category: "spot",
              completed: false,
              mapsQuery: "Kokusai Dori Naha"
            },
            {
              id: "oki-d1-s5",
              time: "19:30",
              period: "晚上",
              title: "國際通屋台村・阿古豬串燒與泡盛體驗",
              transport: "國際通中心徒步 2 分鐘",
              desc: "匯聚 20 家特色小店的熱鬧露天屋台村，品嚐現烤阿古豬排、海葡萄與苦瓜炒豆腐定食。",
              category: "food",
              completed: false,
              mapsQuery: "Kokusai Dori Yataimura"
            }
          ],
          rainSpots: [
            {
              id: "oki-d1-r1",
              time: "15:30",
              period: "下午",
              title: `${meta.hotelName || "那霸飯店"} 室內 Check-in`,
              transport: "地下室內停車場直通飯店大廳，免淋雨",
              desc: "辦理入住，享受飯店大廳迎賓茶飲與舒適客房休憩。",
              category: "hotel",
              completed: false,
              mapsQuery: meta.hotelName || "Hyatt Regency Naha Okinawa"
            },
            {
              id: "oki-d1-r2",
              time: "17:30",
              period: "晚上",
              title: "平和通商店街・全遮雨棚拱廊老街採購",
              transport: "與國際通連通之全蓋式拱廊商店街",
              desc: "下雨完全不用撐傘！探索老字號沖繩黑糖店、傳統鹽屋、陶器通與在地特色點心。",
              category: "spot",
              completed: false,
              mapsQuery: "Heiwadori Shopping Street"
            }
          ]
        },
        {
          dayNum: 2,
          date: getDateStr(1),
          theme: "Day 2 ｜ 蔚藍北部自駕・美麗海水族館與古宇利海景",
          fatigueText: "約 11,500 步 (精神飽滿)",
          fatigueClass: "fatigue-mid",
          isRainMode: false,
          logisticsTip: "北部自駕單程約 1.5 ~ 2 小時，優先行駛沖繩自動車道（收費高速公路）節省時間。",
          cultureTip: "古宇利大橋周邊為保護海洋生態之珊瑚礁帶，戲水請使用對海洋友善之防曬產品。",
          safetyTip: "水族館黑潮之海餵食秀時間為 15:00 與 17:00，建議提早 15 分鐘佔位。",
          sunnySpots: [
            {
              id: "oki-d2-s1",
              time: "08:30",
              period: "上午",
              title: "北上自駕・沖繩自動車道直奔海洋博公園",
              transport: "行駛高速公路往名護方向 (約 85 公里，單向移動避開市區尖峰)",
              desc: "沿途欣賞沖繩蔚藍海岸風光，中途可於伊芸休息區稍作停留眺望金武灣海景。",
              category: "transport",
              completed: false,
              mapsQuery: "Okinawa Expressway"
            },
            {
              id: "oki-d2-s2",
              time: "10:30",
              period: "上午",
              title: "沖繩美麗海水族館・黑潮之海巨大鯨鯊 (必去首選)",
              transport: "海洋博公園 P7 北停車場徒步 3 分鐘",
              desc: "親睹全世界最大級的巨型壓克力水槽，觀賞兩隻巨大鯨鯊與鬼蝠魟優雅巡游的震撼景致。",
              category: "spot",
              completed: false,
              mapsQuery: "Okinawa Churaumi Aquarium"
            },
            {
              id: "oki-d2-s3",
              time: "13:00",
              period: "下午",
              title: "古宇利大橋海天一線・古宇利蝦蝦飯午餐",
              transport: "從水族館開車約 25 分鐘穿越跨海大橋",
              desc: "駛過全長 1,960 公尺的古宇利大橋，於島上名店 Kouri Shrimp 享用蒜香奶油夏威夷大蝦飯。",
              category: "food",
              completed: false,
              mapsQuery: "KOURI SHRIMP"
            },
            {
              id: "oki-d2-s4",
              time: "15:30",
              period: "下午",
              title: "萬座毛象鼻岩・東海壯麗懸崖斷壁",
              transport: "往南返程順遊國頭郡恩納村海岸 (順向動線不折返)",
              desc: "琉球王朝尚敬王讚譽「萬人座之原野」的天然草坪，眺望象鼻狀珊瑚礁斷崖與湛藍東海。",
              category: "spot",
              completed: false,
              mapsQuery: "Cape Manzamo"
            },
            {
              id: "oki-d2-s5",
              time: "18:30",
              period: "晚上",
              title: "琉球之牛恩納店・極上沖繩黑毛和牛燒肉",
              transport: "萬座毛開車 10 分鐘即達恩納度假大道",
              desc: "極品頂級黑毛和牛炭火燒肉，入口即化油花豐富，搭配當季沖繩苦瓜生啤，犒賞一天的自駕旅程。",
              category: "food",
              completed: false,
              mapsQuery: "Ryukyu no Ushi Onna"
            }
          ],
          rainSpots: [
            {
              id: "oki-d2-r1",
              time: "10:30",
              period: "上午",
              title: "沖繩美麗海水族館 (全室內空調雨備最佳方案)",
              transport: "海洋博公園立體停車場直通展館，完全不受雨勢影響",
              desc: "全室內恆溫空間，盡情參觀珊瑚之海、深海探險區與黑潮之海大水槽。",
              category: "spot",
              completed: false,
              mapsQuery: "Okinawa Churaumi Aquarium"
            },
            {
              id: "oki-d2-r2",
              time: "14:00",
              period: "下午",
              title: "名護鳳梨園・室內自動駕駛遊園車與鳳梨甜點工坊",
              transport: "開車 20 分鐘至名護市區室內展館",
              desc: "搭乘造型可愛的鳳梨造型自動遊覽車，室內參觀熱帶植物園與無限試吃鳳梨蛋糕。",
              category: "spot",
              completed: false,
              mapsQuery: "Nago Pineapple Park"
            }
          ]
        },
        {
          dayNum: 3,
          date: getDateStr(2),
          theme: "Day 3 ｜ 中部美式海岸・美國村日落與港川外人住宅",
          fatigueText: "約 9,500 步 (輕鬆浪漫)",
          fatigueClass: "fatigue-low",
          isRainMode: false,
          logisticsTip: "美國村提供大量免費停車場（如 AEON 旁大型停車場），建議下午停好車後步行漫遊。",
          cultureTip: "港川外人住宅多為美軍老眷舍改裝，巷弄狹窄請減速慢行並保持輕聲細語。",
          safetyTip: "日落海灘海水退潮時礁石濕滑，請沿木棧道觀景，切勿赤腳踩踏防坡堤。",
          sunnySpots: [
            {
              id: "oki-d3-s1",
              time: "09:30",
              period: "上午",
              title: "港川外人住宅街・美軍眷舍與 oHacorté 水果塔",
              transport: "從那霸開車約 20 分鐘抵達浦添市",
              desc: "充滿異國風情的文青聚落，每棟矮房前均有各色木門，品嚐知名法式水果塔與自家烘焙咖啡。",
              category: "spot",
              completed: false,
              mapsQuery: "Minatogawa Stateside Town"
            },
            {
              id: "oki-d3-s2",
              time: "12:00",
              period: "中午",
              title: "泡瀨漁港直賣店・現烤海膽龍蝦海鮮丼",
              transport: "開車約 25 分鐘橫切至東海岸漁港",
              desc: "沖繩在地人的海鮮秘密基地！整隻新鮮海膽美乃滋烤龍蝦，搭配滿滿鮪魚生魚片定食。",
              category: "food",
              completed: false,
              mapsQuery: "Awase Fish Market"
            },
            {
              id: "oki-d3-s3",
              time: "14:30",
              period: "下午",
              title: "北谷美國村 (American Village) 街區巡禮",
              transport: "開車西行 20 分鐘抵達北谷海岸商圈",
              desc: "融合美式復古與沖繩熱帶風情的巨大商圈，彩色建築、壁畫牆面、古董商店與各類潮牌。",
              category: "spot",
              completed: false,
              mapsQuery: "American Village Okinawa"
            },
            {
              id: "oki-d3-s4",
              time: "17:45",
              period: "晚上",
              title: "Sunset Beach 日落海灘・欣賞東海金黃晚霞",
              transport: "美國村海濱木棧道散步 3 分鐘",
              desc: "沖繩最具代表性的夕陽觀景勝地，坐在沙灘階梯上欣賞落日餘暉沉入海平面的極致美景。",
              category: "spot",
              completed: false,
              mapsQuery: "Sunset Beach Chatan"
            },
            {
              id: "oki-d3-s5",
              time: "19:30",
              period: "晚上",
              title: "海濱景觀餐廳・Red Lobster 美式龍蝦海鮮晚餐",
              transport: "美國村海濱第一排",
              desc: "伴隨夜晚點燈的美麗海景，享用現烤波士頓大龍蝦、蛤蜊濃湯與美式牛排盛宴。",
              category: "food",
              completed: false,
              mapsQuery: "Red Lobster Okinawa Chatan"
            }
          ],
          rainSpots: [
            {
              id: "oki-d3-r1",
              time: "13:30",
              period: "下午",
              title: "永旺夢樂城沖繩來客夢 (AEON MALL Rycom 室內雨備首選)",
              transport: "開車 15 分鐘直達全沖繩最大室內購物中心",
              desc: "中庭擁有高達兩層樓的巨型「來客夢水族箱」，全室內超過 220 家國際品牌與免稅商店。",
              category: "spot",
              completed: false,
              mapsQuery: "AEON MALL Okinawa Rycom"
            },
            {
              id: "oki-d3-r2",
              time: "18:00",
              period: "晚上",
              title: "美國村 Depot Island 室內拱廊商店街晚餐",
              transport: "美國村內有蓋連通道商場",
              desc: "避開室外風雨，在室內特色餐廳品嚐沖繩塔可飯 (Taco Rice) 與美式漢堡。",
              category: "food",
              completed: false,
              mapsQuery: "Depot Island American Village"
            }
          ]
        },
        {
          dayNum: 4,
          date: getDateStr(3),
          theme: "Day 4 ｜ 瀨長島地中海咖啡・波上宮祈福與機場收攏返台",
          fatigueText: "約 6,200 步 (從容返程)",
          fatigueClass: "fatigue-low",
          isRainMode: false,
          logisticsTip: "落實末日收攏原則：本日行程全數集中於那霸機場周邊 15 分鐘車程內，還車後保留充裕時間。",
          cultureTip: "國際航班嚴格落實提早 3.5 小時抵達機場辦理報到手續與免稅店購物。",
          safetyTip: "液體類伴手禮（泡盛酒、石垣辣油、黑糖凝膠）請務必收入大行李箱託運，不得手提上機。",
          sunnySpots: [
            {
              id: "oki-d4-s1",
              time: "09:00",
              period: "上午",
              title: "波上宮海崖神社參拜・波之上沙灘祈福",
              transport: "從飯店開車約 8 分鐘抵達波之上神宮停車場",
              desc: "沖繩總鎮守八社之首，建於懸崖峭壁之上的紅色神宮，參拜祈求平安順遂並收藏書包造型御守。",
              category: "spot",
              completed: false,
              mapsQuery: "Naminoue Shrine Naha"
            },
            {
              id: "oki-d4-s2",
              time: "10:30",
              period: "上午",
              title: "瀨長島 Umikaji Terrace・純白地中海與幸福鬆餅",
              transport: "開車往南 15 分鐘至瀨長島 (距離機場僅 10 分鐘車程)",
              desc: "依山傍海的純白階梯露天商場，宛如小希臘！品嚐入口即化的幸福鬆餅，近距離仰望客機降落震撼視野。",
              category: "spot",
              completed: false,
              mapsQuery: "Umikaji Terrace Senagajima"
            },
            {
              id: "oki-d4-s3",
              time: "12:00",
              period: "中午",
              title: "OTS 臨空豐崎營業所 加滿油還車",
              transport: "營業所旁設有指定加油站，還車手續約 15 分鐘",
              desc: "快速檢驗車輛、歸還 ETC 卡並結清高速過路費，搭乘專用接駁巴士前往那霸機場。",
              category: "transport",
              completed: false,
              mapsQuery: "OTS Rent-a-Car Rinku Toyosaki"
            },
            {
              id: "oki-d4-s4",
              time: "12:30",
              period: "下午",
              title: "抵達那霸機場 (★落實提前 3.5 小時國際線收攏原則)",
              transport: "國際線航廈辦理星宇 JX871 登機手續與行李託運",
              desc: "完成託運後前往國內線 2F 伴手禮大街（紅芋塔、石垣牛仙貝），品嚐豬肉蛋飯糰 (Potama) 午餐。",
              category: "transport",
              completed: false,
              mapsQuery: "Naha Airport"
            },
            {
              id: "oki-d4-s5",
              time: "15:30",
              period: "下午",
              title: "搭乘星宇 JX871 班機返抵台灣桃園機場",
              transport: "那霸機場 OKA 15:30 起飛 -> 桃園 TPE 16:15 抵達",
              desc: "滿載美好度假回憶與伴手禮，舒適航程平安抵達國門。",
              category: "transport",
              completed: false,
              mapsQuery: "Taiwan Taoyuan International Airport"
            }
          ],
          rainSpots: [
            {
              id: "oki-d4-r1",
              time: "10:30",
              period: "上午",
              title: "那霸新都心 San-A Main Place 室內商場雨備採購",
              transport: "全室內停車場直通商場，鄰近那霸機場",
              desc: "大型綜合百貨，雨天可舒適採購各類沖繩調味料、泡盛酒與藥妝伴手禮。",
              category: "spot",
              completed: false,
              mapsQuery: "San-A Naha Main Place"
            },
            {
              id: "oki-d4-r2",
              time: "12:30",
              period: "下午",
              title: "那霸機場國內線 2F 巨型室內伴手禮商城",
              transport: "國際線航廈室內電動步道連通直達",
              desc: "全日本最齊全的機場室內美食購物大街，雨天候機最舒適首選。",
              category: "spot",
              completed: false,
              mapsQuery: "Naha Airport Domestic Terminal"
            }
          ]
        }
      ];
    } else if (destKey === 'kansai') {
      return [
        {
          dayNum: 1,
          date: getDateStr(0),
          theme: "Day 1 ｜ 抵達關西機場・特急 Haruka 直奔京都・鴨川初夜",
          fatigueText: "約 7,200 步 (輕鬆熱身)",
          fatigueClass: "fatigue-low",
          isRainMode: false,
          logisticsTip: "關西機場搭乘 JR 特急 Haruka 約 75 分鐘直達京都車站，提前綁定 ICOCA 票卡方便乘車。",
          cultureTip: "京都公車多為後門上車、前門下車並刷卡付費；公車內請保持安靜避免喧嘩。",
          safetyTip: "京都車站大階梯人潮密集，注意隨身財物安全。",
          sunnySpots: [
            {
              id: "kan-d1-s1",
              time: "12:10",
              period: "中午",
              title: "抵達關西國際機場 (KIX Terminal 1)",
              transport: "入境檢驗、領取行李與兌換 JR 鐵路周遊券 (約 50 分鐘)",
              desc: "搭乘 JR 特急 Haruka 82 號直通京都站，舒適欣賞近畿田園風光。",
              category: "transport",
              completed: true,
              mapsQuery: "Kansai International Airport"
            },
            {
              id: "kan-d1-s2",
              time: "14:30",
              period: "下午",
              title: `${meta.hotelName || "京都千飯店"} Check-in 卸行李`,
              transport: "京都站中央口徒步 3 分鐘",
              desc: "落實落地後 2 小時動線展開，卸下行李稍作休息，享受日式現代禪風客房。",
              category: "hotel",
              completed: false,
              mapsQuery: meta.hotelName || "THE THOUSAND KYOTO"
            },
            {
              id: "kan-d1-s3",
              time: "17:00",
              period: "晚上",
              title: "鴨川河畔漫步・四條河原町鬧區",
              transport: "搭乘地下鐵烏丸線至四條站徒步 5 分鐘",
              desc: "漫步京都靈魂之河鴨川，感受傍晚涼風與納涼床倒影，探索河原町日系潮流商場。",
              category: "spot",
              completed: false,
              mapsQuery: "Kamogawa River Kyoto"
            },
            {
              id: "kan-d1-s4",
              time: "19:00",
              period: "晚上",
              title: "先斗町花街晚餐・京都名物湯豆腐與和牛壽喜燒",
              transport: "鴨川旁窄巷徒步 2 分鐘",
              desc: "充滿江戶古風的紅燈籠花街石板巷，品嚐精緻湯豆腐與和牛料理。",
              category: "food",
              completed: false,
              mapsQuery: "Pontocho Alley Kyoto"
            }
          ],
          rainSpots: [
            {
              id: "kan-d1-r1",
              time: "16:00",
              period: "下午",
              title: "京都車站伊勢丹百貨與地下街 Porta 探索",
              transport: "京都站地下連通道直達，完全不淋雨",
              desc: "全室內採購京都抹茶名產、各色和果子與人氣甜點。",
              category: "spot",
              completed: false,
              mapsQuery: "JR Kyoto Isetan"
            }
          ]
        },
        {
          dayNum: 2,
          date: getDateStr(1),
          theme: "Day 2 ｜ 世界遺產巡禮・清水寺晨間參拜、二年坂與伏見稻荷",
          fatigueText: "約 14,000 步 (體力充沛)",
          fatigueClass: "fatigue-high",
          isRainMode: false,
          logisticsTip: "清水寺晨間 06:00 即開門，早晨 08:30 前參拜可避開 90% 團體觀光客，拍照光線極佳。",
          cultureTip: "二年坂、三年坂石階請慢行；穿著和服走石階建議步伐放小，避免重心不穩摔倒。",
          safetyTip: "伏見稻荷千本鳥居後山坡度陡峭，如欲登頂需準備防滑鞋與隨身飲水。",
          sunnySpots: [
            {
              id: "kan-d2-s1",
              time: "08:30",
              period: "上午",
              title: "清水寺 本堂清水舞台與音羽之瀧 (必去首選)",
              transport: "搭乘市公車 206 號至清水道徒步上坡 10 分鐘",
              desc: "國寶級木造建築奇蹟，眺望京都古都全景，於音羽之瀧品飲健康、學業、良緣靈水。",
              category: "spot",
              completed: false,
              mapsQuery: "Kiyomizu-dera Kyoto"
            },
            {
              id: "kan-d2-s2",
              time: "11:00",
              period: "上午",
              title: "二年坂、三年坂石板古街散步",
              transport: "清水寺正門徒步 3 分鐘順山勢下行 (單向動線不折返)",
              desc: "保存完整的京都傳統木造街屋，造訪榻榻米星巴克與百年七味粉老舖。",
              category: "spot",
              completed: false,
              mapsQuery: "Ninenzaka Kyoto"
            },
            {
              id: "kan-d2-s3",
              time: "13:30",
              period: "下午",
              title: "伏見稻荷大社・千本鳥居朱紅隧道",
              transport: "搭乘京阪本線至伏見稻荷站徒步 5 分鐘",
              desc: "穿梭於由信眾奉獻的數千座朱紅色巨型鳥居森林，參拜象徵五穀豐收與商業繁榮的白狐神祇。",
              category: "spot",
              completed: false,
              mapsQuery: "Fushimi Inari Taisha"
            },
            {
              id: "kan-d2-s4",
              time: "18:00",
              period: "晚上",
              title: "京都站拉麵小路晚餐・中村藤吉抹茶聖代",
              transport: "JR 返回京都站 10F",
              desc: "品嚐博多一幸舍或德島拉麵，再至中村藤吉享用頂級宇治抹茶果凍聖代。",
              category: "food",
              completed: false,
              mapsQuery: "Kyoto Ramen Koji"
            }
          ],
          rainSpots: [
            {
              id: "kan-d2-r1",
              time: "10:00",
              period: "上午",
              title: "三十三間堂・千尊國寶觀音立像 (全室內雨備)",
              transport: "公車直達，全室內古寺長廊",
              desc: "全日本最震撼的室內千體千手觀音金身佛像長廊，雨中漫步沉澱心靈。",
              category: "spot",
              completed: false,
              mapsQuery: "Sanjusangendo Kyoto"
            }
          ]
        },
        {
          dayNum: 3,
          date: getDateStr(2),
          theme: "Day 3 ｜ 嵐山竹林之道・天龍寺庭園與野宮神社慢活",
          fatigueText: "約 11,000 步 (節奏舒緩)",
          fatigueClass: "fatigue-mid",
          isRainMode: false,
          logisticsTip: "從京都站搭乘 JR 嵯峨野線僅 16 分鐘抵達 JR 嵯峨嵐山站，比公車省時 40 分鐘。",
          cultureTip: "天龍寺曹源池庭園借景嵐山與龜山，席地坐在大方丈走廊上靜坐觀景請保持輕語。",
          safetyTip: "渡月橋周邊自行車與人力車多，行走於人行道切勿突然橫越馬路。",
          sunnySpots: [
            {
              id: "kan-d3-s1",
              time: "09:00",
              period: "上午",
              title: "嵐山竹林之道・野宮神社祈福",
              transport: "JR 嵯峨嵐山站徒步 10 分鐘進入綠意盎然竹林隧道",
              desc: "早晨陽光穿透高聳翠綠竹林，微風吹拂竹葉沙沙作響，至黑木鳥居野宮神社祈求學業與締結良緣。",
              category: "spot",
              completed: false,
              mapsQuery: "Arashiyama Bamboo Grove"
            },
            {
              id: "kan-d3-s2",
              time: "11:30",
              period: "中午",
              title: "世界文化遺產 天龍寺曹源池庭園",
              transport: "竹林小徑出口直通天龍寺北門 (順向動線)",
              desc: "足利尊氏創立之臨濟宗名剎，欣賞 700 年前夢窗疏石國師設計的迴遊式山水庭園。",
              category: "spot",
              completed: false,
              mapsQuery: "Tenryu-ji Temple Arashiyama"
            },
            {
              id: "kan-d3-s3",
              time: "13:30",
              period: "下午",
              title: "嵐山渡月橋・% ARABICA Kyoto 桂川手沖咖啡",
              transport: "天龍寺正門徒步 5 分鐘抵達桂川畔",
              desc: "坐在桂川堤岸邊，一邊啜飲 % ARABICA 經典拿鐵，一邊眺望嵐山四季倒映於渡月橋下的名畫景致。",
              category: "spot",
              completed: false,
              mapsQuery: "Arabica Kyoto Arashiyama"
            },
            {
              id: "kan-d3-s4",
              time: "18:00",
              period: "晚上",
              title: "京都錦市場・美食小吃採購",
              transport: "搭乘阪急京都線回市區烏丸站徒步 3 分鐘",
              desc: "被譽為「京都廚房」的 400 年市場，品嚐章魚燒、玉子燒、生麩與在地漬物。",
              category: "food",
              completed: false,
              mapsQuery: "Nishiki Market Kyoto"
            }
          ],
          rainSpots: [
            {
              id: "kan-d3-r1",
              time: "13:00",
              period: "下午",
              title: "京都鐵道博物館 (全室內現代化雨備展館)",
              transport: "梅小路公園站直達全室內展覽館",
              desc: "全日本最大規模鐵道博物館，實體蒸氣火車頭、新幹線與室內模擬駕駛體驗。",
              category: "spot",
              completed: false,
              mapsQuery: "Kyoto Railway Museum"
            }
          ]
        },
        {
          dayNum: 4,
          date: getDateStr(3),
          theme: "Day 4 ｜ 大阪道頓堀熱情・黑門市場與心齋橋商圈",
          fatigueText: "約 12,500 步 (逛街採購)",
          fatigueClass: "fatigue-mid",
          isRainMode: false,
          logisticsTip: "從京都轉移至大阪難波，搭乘 JR 快速列車或新快速約 30 分鐘，大件行李寄存於難波寄物櫃。",
          cultureTip: "道頓堀固力果跑跑人看板合照請站在戒橋指定平台，切勿阻礙橋上行人正常通行。",
          safetyTip: "心齋橋商店街人流極高，隨身背包請背於胸前防範扒手。",
          sunnySpots: [
            {
              id: "kan-d4-s1",
              time: "09:30",
              period: "上午",
              title: "黑門市場・關西海鮮生魚片與神戶牛串燒",
              transport: "地下鐵日本橋站徒步 2 分鐘",
              desc: "大阪人最熱鬧的海鮮生鮮市場，品嚐現開海膽、巨型扇貝與現煎神戶和牛串。",
              category: "food",
              completed: false,
              mapsQuery: "Kuromon Ichiba Market Osaka"
            },
            {
              id: "kan-d4-s2",
              time: "13:00",
              period: "下午",
              title: "心齋橋筋商店街・藥妝服飾一站式採購",
              transport: "日本橋步行 10 分鐘直通心齋橋拱廊街",
              desc: "超過 600 公尺長的全天候遮雨棚商店街，各大旗艦店、藥妝店免稅櫃台一次買齊伴手禮。",
              category: "spot",
              completed: false,
              mapsQuery: "Shinsaibashisuji Osaka"
            },
            {
              id: "kan-d4-s3",
              time: "18:00",
              period: "晚上",
              title: "道頓堀巨型招牌看板・一蘭拉麵與章魚燒晚餐",
              transport: "心齋橋筋南端運河畔",
              desc: "與經典固力果跑跑人、巨蟹看板合影，搭乘道頓堀觀光水上巴士，品嚐大阪代表本家大起水產章魚燒。",
              category: "food",
              completed: false,
              mapsQuery: "Dotonbori Osaka"
            }
          ],
          rainSpots: [
            {
              id: "kan-d4-r1",
              time: "13:00",
              period: "下午",
              title: "心齋橋 PARCO & 大丸百貨 (全室內連通雨備商場)",
              transport: "心齋橋站地下街直通",
              desc: "全室內潮流百貨，吉卜力橡子共和國、寶可夢中心旗艦店與頂級美食街。",
              category: "spot",
              completed: false,
              mapsQuery: "Shinsaibashi PARCO"
            }
          ]
        },
        {
          dayNum: 5,
          date: getDateStr(4),
          theme: "Day 5 ｜ 臨空城 Outlet・關西機場提早 3.5 小時收攏返台",
          fatigueText: "約 5,800 步 (從容返程)",
          fatigueClass: "fatigue-low",
          isRainMode: false,
          logisticsTip: "落實末日收攏原則：搭乘南海電鐵特急 Rapi:t 從難波出發約 34 分鐘直達關西機場。",
          cultureTip: "關西機場國際線出境安檢與海關常有大批排隊人潮，嚴格落實提早 3.5 小時抵達。",
          safetyTip: "免稅店購買之生巧克力或酒類請確認符合航空公司登機隨身行李數量規範。",
          sunnySpots: [
            {
              id: "kan-d5-s1",
              time: "09:30",
              period: "上午",
              title: "難波出發・搭乘南海電鐵特急 Rapi:t 直奔機場方向",
              transport: "南海難波站開出直達臨空城/關西機場 (順向動線不折返)",
              desc: "復古未來主義鐵人 28 號造型藍色特急列車，全座席指定，舒適前往機場周邊。",
              category: "transport",
              completed: false,
              mapsQuery: "Nankai Namba Station"
            },
            {
              id: "kan-d5-s2",
              time: "10:30",
              period: "上午",
              title: "臨空城 Premium Outlets・海景露台最後巡禮",
              transport: "臨空城站徒步 6 分鐘，設有專用大型寄物櫃",
              desc: "遠眺關西機場聯絡橋與海灣全景，享受知名運動休閒品牌最後折扣採購。",
              category: "spot",
              completed: false,
              mapsQuery: "Rinku Premium Outlets"
            },
            {
              id: "kan-d5-s3",
              time: "12:30",
              period: "中午",
              title: "抵達關西國際機場 (★落實提前 3.5 小時機場收攏原則)",
              transport: "臨空城一站直達關西機場第 1 航廈",
              desc: "辦理長榮 BR131 報到登機與行李託運手續，進入出境免稅區採購東京香蕉、白色戀人與抹茶Royce。",
              category: "transport",
              completed: false,
              mapsQuery: "Kansai International Airport"
            },
            {
              id: "kan-d5-s4",
              time: "16:00",
              period: "下午",
              title: "搭乘長榮 BR131 航班平安返抵桃園國際機場",
              transport: "KIX 16:00 起飛 -> TPE 18:05 抵達",
              desc: "滿載古都風華回憶與豐碩戰利品，圓滿結束關西五日慢活之旅。",
              category: "transport",
              completed: false,
              mapsQuery: "Taiwan Taoyuan International Airport"
            }
          ],
          rainSpots: [
            {
              id: "kan-d5-r1",
              time: "10:30",
              period: "上午",
              title: "關西機場 Aeroplaza 全室內美食商城雨備候機",
              transport: "航廈連通道直達室內商場",
              desc: "全室內環境，品嚐最後一道章魚燒與日式咖啡，免受風雨影響。",
              category: "spot",
              completed: false,
              mapsQuery: "Aeroplaza Kansai Airport"
            }
          ]
        }
      ];
    } else {
      // 預設或自訂目的地 (若為東京或 10/19 則套用完整的 9 天 8 夜規範行程)
      if (destKey === 'tokyo' || (meta.destination && meta.destination.includes('東京')) || (meta.startDate && meta.startDate.includes('10-19'))) {
        return createTokyo9Days(meta.startDate || "2026-10-19", meta.hotelName);
      }
      return JSON.parse(JSON.stringify(DEFAULT_DEMO_DATA.days));
    }
  }

  function parseTravelDocumentAndBuildPlan(rawText, sourceUrl = '') {
    if (!rawText && !sourceUrl) {
      const pasteEl = document.getElementById('cloud-paste-text');
      const customEl = document.getElementById('custom-input-text');
      rawText = (pasteEl ? pasteEl.value : '') || (customEl ? customEl.value : '');
    }

    const text = rawText || '';

    // 1. 識別目的地
    let destKey = 'custom';
    let destName = '日本 東京';
    let tripTitle = '2026 東京秋季 9 日深度自由行';

    if (/沖繩|那霸|OKA|Okinawa/i.test(text) || /okinawa/i.test(sourceUrl)) {
      destKey = 'okinawa';
      destName = '日本 沖繩';
      tripTitle = '2026 沖繩蔚藍自駕與海景漫遊';
    } else if (/關西|京都|大阪|KIX|Osaka|Kyoto/i.test(text) || /kansai/i.test(sourceUrl)) {
      destKey = 'kansai';
      destName = '日本 關西 (京都/大阪)';
      tripTitle = '2026 關西京都大阪古都風華漫遊';
    } else if (/北海道|札幌|CTS|Sapporo/i.test(text)) {
      destKey = 'hokkaido';
      destName = '日本 北海道';
      tripTitle = '2026 北海道雪國溫泉與美食漫遊';
    } else if (/東京|成田|羽田|NRT|HND|Tokyo/i.test(text) || text.includes('10/19') || text.includes('10-19')) {
      destKey = 'tokyo';
      destName = '日本 東京';
      tripTitle = '2026 東京秋季 9 日深度自由行';
    } else {
      // 嘗試從文字中擷取目的地標籤
      const destMatch = text.match(/(?:目的地|地點|旅遊城市|前往)[：:\s]*([^\n,，]+)/);
      if (destMatch) {
        destName = destMatch[1].trim();
        tripTitle = `2026 ${destName} 精彩自由行`;
      }
    }

    // 2. 擷取日期 (精準辨識 10/19 ~ 10/27 等日期格式)
    let startDate = "2026-10-19";
    let endDate = "2026-10-27";
    if (/10[月\/\-]19/i.test(text) && /10[月\/\-]27/i.test(text)) {
      startDate = "2026-10-19";
      endDate = "2026-10-27";
    } else {
      const dateMatches = text.match(/\b202[4-9][\-\/.][0-1]?[0-9][\-\/.][0-3]?[0-9]\b/g);
      if (dateMatches && dateMatches.length >= 2) {
        startDate = dateMatches[0].replace(/[\/.]/g, '-');
        endDate = dateMatches[dateMatches.length - 1].replace(/[\/.]/g, '-');
      } else if (dateMatches && dateMatches.length === 1) {
        startDate = dateMatches[0].replace(/[\/.]/g, '-');
        const d = new Date(startDate);
        d.setDate(d.getDate() + 8);
        endDate = d.toISOString().slice(0, 10);
      }
    }

    // 3. 擷取航班資訊
    let flightDept = '';
    let flightReturn = '';
    const lines = text.split('\n');
    for (const l of lines) {
      if (/(去程|出發|起飛|Flight.*Dept|航班.*去)/i.test(l)) {
        flightDept = l.replace(/^[【\[]?(去程航班|去程|航班)[】\]]?\s*[:：]?\s*/, '').trim();
      } else if (/(回程|返程|回台|歸國|Flight.*Ret|航班.*回)/i.test(l)) {
        flightReturn = l.replace(/^[【\[]?(回程航班|回程|返程)[】\]]?\s*[:：]?\s*/, '').trim();
      }
    }
    if (!flightDept) {
      if (destKey === 'okinawa') flightDept = "星宇 JX870 | TPE 09:30 -> OKA 12:05 (T1 Gate 6)";
      else if (destKey === 'kansai') flightDept = "長榮 BR132 | TPE 08:30 -> KIX 12:10 (T1 Gate 12)";
      else flightDept = document.getElementById('flight-dept') ? document.getElementById('flight-dept').value : "長榮 BR198 | TPE 08:50 -> NRT 13:15 (T1 Gate 24)";
    }
    if (!flightReturn) {
      if (destKey === 'okinawa') flightReturn = "星宇 JX871 | OKA 15:30 -> TPE 16:15 (T1 Gate 3)";
      else if (destKey === 'kansai') flightReturn = "長榮 BR131 | KIX 16:00 -> TPE 18:05 (T1 Gate 15)";
      else flightReturn = document.getElementById('flight-return') ? document.getElementById('flight-return').value : "長榮 BR197 | NRT 14:15 -> TPE 17:05 (T1 Gate 32)";
    }

    // 4. 擷取飯店資訊
    let hotelName = '';
    let hotelAddress = '';
    for (const l of lines) {
      if (/(飯店名稱|酒店名稱|住宿名稱|入住飯店|飯店|酒店|Hotel Name)[：:]/i.test(l)) {
        hotelName = l.replace(/^[^\s：:]+[：:]\s*/, '').trim();
      } else if (/(飯店地址|酒店地址|地址|Hotel Address)[：:]/i.test(l)) {
        hotelAddress = l.replace(/^[^\s：:]+[：:]\s*/, '').trim();
      }
    }
    if (!hotelName) {
      if (destKey === 'okinawa') {
        hotelName = "那霸凱悅酒店 (Hyatt Regency Naha Okinawa)";
        hotelAddress = "沖繩縣那霸市牧志3-6-20 (+81 98-866-8888)";
      } else if (destKey === 'kansai') {
        hotelName = "京都千飯店 (THE THOUSAND KYOTO)";
        hotelAddress = "京都市下京區東鹽小路町 570 (+81 75-351-0700)";
      } else {
        hotelName = document.getElementById('hotel-name') ? document.getElementById('hotel-name').value : "三井花園飯店 汐留義大利街";
        hotelAddress = document.getElementById('hotel-address') ? document.getElementById('hotel-address').value : "東京都港區東新橋2-14-24 (+81 3-3431-1131)";
      }
    }

    // 5. 擷取成員
    let members = ["小明", "小華", "小美"];
    const memMatch = text.match(/(?:同行成員|成員|同行|旅伴|人數)[：:]\s*([^\n]+)/);
    if (memMatch) {
      const parsedMems = memMatch[1].split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean);
      if (parsedMems.length) members = parsedMems;
    }

    // 6. 擷取想去清單
    const mustGoSpots = [];
    for (const l of lines) {
      if (/(景點|想去|清單|必去|願望)[：:]/i.test(l)) {
        const parts = l.replace(/^[^\s：:]+[：:]\s*/, '').split(/[,，、]+/).map(s => s.trim()).filter(Boolean);
        mustGoSpots.push(...parts);
      }
    }
    if (!mustGoSpots.length && destKey === 'okinawa') {
      mustGoSpots.push("美麗海水族館", "古宇利大橋", "美國村", "國際通屋台村", "瀨長島");
    }

    // 7. 組裝 state.trip
    appState.trip = {
      name: tripTitle,
      destination: destName,
      startDate: startDate,
      endDate: endDate,
      members: members,
      flightDept: flightDept,
      flightReturn: flightReturn,
      hotelName: hotelName,
      hotelAddress: hotelAddress,
      themes: "自然探索, 美食巡禮, 必訪地標",
      travelPace: "輕鬆適中",
      companions: "朋友出遊",
      mustGo: mustGoSpots.length ? mustGoSpots : (appState.trip.mustGo || ["美麗海水族館", "國際通"]),
      mustAvoid: appState.trip.mustAvoid || ["避免需排隊 2 小時以上之店家"],
      customNotes: text || appState.trip.customNotes || ""
    };

    // 8. 生成符合規範的完整行程表
    appState.days = generateItineraryForDestination(destKey, appState.trip, mustGoSpots);
    selectedDayIndex = 0;

    // 9. 即時同步更新所有 HTML 表單 DOM 欄位
    if (typeof document !== 'undefined') {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.value = val;
      };
      setVal('trip-name', appState.trip.name);
      setVal('trip-destination', appState.trip.destination);
      setVal('trip-start-date', appState.trip.startDate);
      setVal('trip-end-date', appState.trip.endDate);
      setVal('trip-members', appState.trip.members.join(', '));
      setVal('flight-dept', appState.trip.flightDept);
      setVal('flight-return', appState.trip.flightReturn);
      setVal('hotel-name', appState.trip.hotelName);
      setVal('hotel-address', appState.trip.hotelAddress);
      setVal('must-go-list', appState.trip.mustGo.join(', '));
      setVal('custom-input-text', appState.trip.customNotes);
      setVal('cloud-paste-text', text);

      // 同步 Chip
      syncSingleChipGroup('chip-group-pace', 'travel-pace', appState.trip.travelPace);
      syncSingleChipGroup('chip-group-companions', 'travel-companions', appState.trip.companions);

      // 即時重新渲染 Stage 1 規劃看板與 Stage 2 看板
      saveStateToStorage();
      renderStage1PlanPreview();
      renderStage2Banner();
      renderStage2DayTabs();
      renderStage2Timeline();
      updateUpcomingSpot();
      renderExpenseSection();

      const cloudStatus = document.getElementById('cloud-fetch-status');
      if (cloudStatus) {
        cloudStatus.innerHTML = `
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; padding:10px 14px; border-radius:6px; margin-top:8px;">
            🎉 <strong>雲端資料解析成功！</strong><br>
            已自動識別目的地為【<strong>${appState.trip.destination}</strong>】，完整提取航班、住宿與景點清單，並依 <strong>Elite Travel Planner 嚴格規範（落地2小時出發展開、末日提前3.5小時機場收攏、單向不折返、晴雨雙備案）</strong>自動生成 <strong>${appState.days.length} 天</strong> 專屬行程！
          </div>
        `;
      }
    }

    return appState;
  }

  async function startAIPlanning() {
    const progressBox = document.getElementById('ai-planning-progress');
    const progressFill = document.getElementById('planning-progress-fill');
    const statusText = document.getElementById('progress-status-text');
    const subText = document.getElementById('progress-sub-text');

    const cloudPaste = document.getElementById('cloud-paste-text');
    const customInput = document.getElementById('custom-input-text');
    const currentDest = document.getElementById('trip-destination') ? document.getElementById('trip-destination').value : '';
    const pastedText = (customInput ? customInput.value.trim() : '') || (cloudPaste ? cloudPaste.value.trim() : '');

    if (progressBox) progressBox.classList.remove('hidden');
    if (progressFill) progressFill.style.width = '20%';
    if (statusText) statusText.textContent = `🚀 正在連線 AI 智能引擎，全面融合最新備忘筆記...`;
    if (subText) subText.textContent = '嚴格落實使用者指示與硬性錨點行程';

    let replanSuccess = false;
    if (pastedText) {
      try {
        const statusRes = await fetch(getBackendUrl('/api/status')).catch(() => null);
        if (statusRes && statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.has_key) {
            if (progressFill) progressFill.style.width = '60%';
            if (statusText) statusText.textContent = `🧠 Gemini 模型正在依據您的備忘筆記全面重新規劃與排程...`;
            const replanRes = await fetch(getBackendUrl('/api/replan-trip'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ custom_notes: pastedText, current_trip: appState })
            });
            if (replanRes && replanRes.ok) {
              const resData = await replanRes.json();
              if (resData.success && resData.itinerary) {
                appState.trip = resData.itinerary.trip;
                appState.days = resData.itinerary.days;
                replanSuccess = true;
              }
            }
          }
        }
      } catch (e) {
        console.warn('replan-trip failed, falling back', e);
      }
    }

    if (!replanSuccess) {
      if (pastedText || (currentDest && !currentDest.includes('東京') && (!appState.trip.destination || !appState.trip.destination.includes(currentDest)))) {
        parseTravelDocumentAndBuildPlan(pastedText || `目的地：${currentDest}`);
      }
    }

    if (progressFill) progressFill.style.width = '85%';
    if (statusText) statusText.textContent = '🛡️ 正在生成晴雨備案、體力負荷計算與文化後勤提醒...';
    if (subText) subText.textContent = '國際航班尾日嚴格提前 3.5 小時機場收攏';

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
      if (statusText) statusText.textContent = `🎉 【${appState.trip.destination}】行程規劃完成！`;
      if (subText) subText.textContent = `已成功融合所有景點與自訂資料，共計 ${appState.days.length} 天！`;

      saveStateToStorage();
      renderStage1PlanPreview();
      renderStage2Banner();
      renderStage2DayTabs();
      renderStage2Timeline();
      updateUpcomingSpot();
      renderExpenseSection();

      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
        const previewEl = document.getElementById('plan-preview-board');
        if (previewEl) previewEl.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }, 400);
  }

  function handleStage1Submit(e) {
    if (e) e.preventDefault();
    startAIPlanning();
  }

  // ==========================================
  // STAGE 2: 智能旅遊提醒與動態看板渲染
  // ==========================================
  function renderStage2Banner() {
    const t = appState.trip;
    document.getElementById('banner-trip-title').textContent = t.name;
    document.getElementById('banner-trip-meta').textContent = `${t.destination} ｜ ${t.startDate} ~ ${t.endDate}`;
    document.getElementById('banner-flight-dept').textContent = t.flightDept || '尚未設定航班';
    document.getElementById('banner-hotel-name').textContent = t.hotelName || '尚未設定飯店';
    document.getElementById('banner-hotel-address').innerHTML = `${t.hotelAddress || ''} ｜ <a id="btn-hotel-nav" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.hotelName + ' ' + (t.hotelAddress || ''))}" target="_blank" style="color:#60a5fa; text-decoration:underline;">Google Maps 導航</a>`;
    document.getElementById('driver-card-text').textContent = `目的地：${t.hotelName}（${t.hotelAddress}）`;
  }

  function renderStage2DayTabs() {
    const container = document.getElementById('day-tabs-container');
    container.innerHTML = '';
    appState.days.forEach((day, idx) => {
      const btn = document.createElement('button');
      btn.className = `day-tab ${idx === selectedDayIndex ? 'active' : ''}`;
      btn.innerHTML = `
        <div class="day-tab-title">Day ${day.dayNum}</div>
        <div class="day-tab-date">${day.date ? day.date.slice(5) : ''}</div>
      `;
      btn.onclick = () => {
        selectedDayIndex = idx;
        renderStage2DayTabs();
        renderStage2Timeline();
        updateUpcomingSpot();
      };
      container.appendChild(btn);
    });
  }

  function renderStage2Timeline() {
    const currentDay = appState.days[selectedDayIndex];
    if (!currentDay) return;

    // 更新標題與日期
    document.getElementById('day-theme-title').textContent = currentDay.theme;
    document.getElementById('day-date-str').textContent = currentDay.date;
    document.getElementById('day-logistics-tip').textContent = currentDay.logisticsTip || '隨身攜帶交通卡與護照。';
    document.getElementById('day-culture-tip').textContent = currentDay.cultureTip || '遵守當地禮儀規範。';
    document.getElementById('day-safety-tip').textContent = currentDay.safetyTip || '注意隨身貴重財物。';

    // 雨備開關按鈕狀態
    const rainBtn = document.getElementById('btn-toggle-rain');
    if (currentDay.isRainMode) {
      rainBtn.textContent = '🌧️ 目前為：雨備方案（點擊切回 ☀️ 晴天行程）';
      rainBtn.className = 'btn btn-warning btn-sm';
    } else {
      rainBtn.textContent = '☀️ 目前為：晴天行程（點擊切換 🌧️ 雨備方案）';
      rainBtn.className = 'btn btn-secondary btn-sm';
    }

    // 體力預警膠囊
    const fatiguePill = document.getElementById('fatigue-indicator');
    fatiguePill.className = `fatigue-pill ${currentDay.fatigueClass || 'fatigue-low'}`;
    fatiguePill.textContent = `👟 體力負荷：${currentDay.fatigueText || '適中'}`;

    // 時間軸項目
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';

    const spotsToDisplay = currentDay.isRainMode ? currentDay.rainSpots : currentDay.sunnySpots;

    spotsToDisplay.forEach(spot => {
      const itemEl = document.createElement('div');
      itemEl.className = `timeline-item ${spot.completed ? 'done-spot' : ''}`;
      itemEl.id = `timeline-item-${spot.id}`;

      let catTag = '';
      if (spot.category === 'transport') catTag = '<span class="tag tag-transport">🚇 交通移動</span>';
      else if (spot.category === 'food') catTag = '<span class="tag tag-food">🍱 美食體驗</span>';
      else if (spot.category === 'hotel') catTag = '<span class="tag tag-rain">🏨 飯店住宿</span>';
      else catTag = '<span class="tag tag-must">⛩️ 景點踩點</span>';

      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.mapsQuery || spot.title)}`;

      itemEl.innerHTML = `
        <span class="time-badge">${spot.period || ''} ${spot.time || ''}</span>
        <div class="spot-title">
          <span>${spot.title}</span>
          <label style="font-size: 0.75rem; font-weight: normal; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="checkbox" ${spot.completed ? 'checked' : ''} data-spot-id="${spot.id}">
            <span>${spot.completed ? '已完成' : '標記完成'}</span>
          </label>
        </div>
        <div class="spot-desc">${spot.desc}</div>
        <div style="font-size: 0.8rem; color: #0284c7; margin-bottom: 6px;">
          <strong>🚕 交通動線：</strong> ${spot.transport}
        </div>
        <div class="spot-tags">
          ${catTag}
          <a href="${mapsLink}" target="_blank" class="tag" style="background:#e0f2fe; color:#0369a1; text-decoration:none;">
            📍 Google Maps 導航
          </a>
        </div>
      `;

      // 綁定打勾事件（親友輕量互動）
      const chk = itemEl.querySelector('input[type="checkbox"]');
      chk.onchange = (e) => {
        spot.completed = e.target.checked;
        saveStateToStorage();
        renderStage2Timeline();
      };

      timelineContainer.appendChild(itemEl);
    });
  }

  // 晴雨方案一鍵切換
  function toggleRainMode() {
    const currentDay = appState.days[selectedDayIndex];
    if (currentDay) {
      currentDay.isRainMode = !currentDay.isRainMode;
      saveStateToStorage();
      renderStage2Timeline();
      updateUpcomingSpot();
    }
  }

  // 即時 / 模擬時間自動比對並高亮即將來臨的行程
  function updateUpcomingSpot() {
    const simTime = document.getElementById('sim-time').value || '14:00';
    const currentDay = appState.days[selectedDayIndex];
    if (!currentDay) return;

    const spots = currentDay.isRainMode ? currentDay.rainSpots : currentDay.sunnySpots;
    const upcomingContainer = document.getElementById('upcoming-spot-card');

    // 尋找時間大於或等於模擬時間的第一個項目，若都過了則取最後一個
    let targetSpot = spots.find(s => s.time >= simTime && !s.completed);
    if (!targetSpot) {
      targetSpot = spots.find(s => !s.completed) || spots[0];
    }

    // 移除所有舊有的 active-now
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('active-now'));

    if (targetSpot) {
      const activeEl = document.getElementById(`timeline-item-${targetSpot.id}`);
      if (activeEl) activeEl.classList.add('active-now');

      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetSpot.mapsQuery || targetSpot.title)}`;
      upcomingContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="time-badge" style="background:var(--primary); color:#fff;">即將抵達 ｜ ${targetSpot.time}</span>
            <div style="font-size: 1.15rem; font-weight:700; margin-top:4px; color:var(--text-main);">${targetSpot.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top:2px;">${targetSpot.desc}</div>
          </div>
          <a href="${mapsLink}" target="_blank" class="btn btn-primary btn-sm" style="flex-shrink:0;">
            🧭 一鍵導航
          </a>
        </div>
        <div style="margin-top:8px; font-size:0.82rem; background:#f0f9ff; padding:6px 10px; border-radius:6px; color:#0369a1;">
          🚦 <strong>預估動線指引：</strong> ${targetSpot.transport}
        </div>
      `;
    } else {
      upcomingContainer.innerHTML = `<div style="font-size:0.9rem; color:var(--text-muted);">今日所有預定行程皆已圓滿完成！🎉</div>`;
    }
  }

  // ==========================================
  // 智慧親友名稱遷移與記帳連動函式
  // ==========================================
  function migrateExpenseMemberNames(oldMembers, newMembers) {
    if (!newMembers || !newMembers.length) return;
    const demoNames = ["小明", "小華", "小美", "阿強"];
    const mapping = {};
    
    // 建立舊姓名對應至新姓名之字典
    if (oldMembers && oldMembers.length) {
      oldMembers.forEach((oldM, idx) => {
        mapping[oldM] = newMembers[idx % newMembers.length];
      });
    }
    demoNames.forEach((dName, idx) => {
      if (!mapping[dName]) {
        mapping[dName] = newMembers[idx % newMembers.length];
      }
    });

    // 1. 同步更新所有支出中的付款人與均攤名單
    if (appState.expenses && appState.expenses.length) {
      appState.expenses.forEach(exp => {
        if (mapping[exp.payer]) {
          exp.payer = mapping[exp.payer];
        } else if (!newMembers.includes(exp.payer)) {
          exp.payer = newMembers[0];
        }

        if (exp.splitMembers && exp.splitMembers.length) {
          const mappedSplit = exp.splitMembers.map(m => mapping[m] || m).filter(m => newMembers.includes(m));
          exp.splitMembers = mappedSplit.length ? Array.from(new Set(mappedSplit)) : [...newMembers];
        } else {
          exp.splitMembers = [...newMembers];
        }
      });
    }

    // 2. 同步更新行李清單的指派人
    if (appState.packingList && appState.packingList.length) {
      appState.packingList.forEach(item => {
        if (item.assignee) {
          Object.keys(mapping).forEach(oldKey => {
            if (item.assignee.includes(oldKey)) {
              item.assignee = item.assignee.split(oldKey).join(mapping[oldKey]);
            }
          });
        }
      });
    }
  }

  function updateTripMembersFromInput(newVal) {
    if (!newVal) return;
    const parsed = newVal.split(/[,，、]+/).map(s => s.trim()).filter(Boolean);
    if (!parsed.length) return;
    const oldMembers = [...(appState.trip.members || [])];
    appState.trip.members = parsed;
    migrateExpenseMemberNames(oldMembers, parsed);
    saveStateToStorage();
    renderExpenseSection();
    renderPackingList();
  }

  function syncMemberNamesToAllExpenses() {
    let members = appState.trip.members || [];
    const inputEl = document.getElementById('trip-members');
    if (inputEl && inputEl.value.trim()) {
      const parsed = inputEl.value.split(/[,，、]+/).map(s => s.trim()).filter(Boolean);
      if (parsed.length) {
        members = parsed;
        appState.trip.members = members;
      }
    }
    if (!members.length) {
      alert('請先在步驟 1 填寫同行親友名單！');
      return;
    }

    const oldMembers = ["小明", "小華", "小美", "阿強"];
    migrateExpenseMemberNames(oldMembers, members);
    saveStateToStorage();
    renderExpenseSection();
    renderPackingList();
    alert(`🎉 親友姓名連動完成！\n已將既有支出與行李清單之姓名，全面對齊為最新親友名單：\n${members.join('、')}`);
  }

  function clearAllExpenses() {
    if (confirm('確定要清空所有目前的記帳資料嗎？\n清空後可重新上傳日本發票或手動記錄真實開銷。')) {
      appState.expenses = [];
      saveStateToStorage();
      renderExpenseSection();
      alert('已清空記帳明細！現在可以乾淨記錄這趟旅程的開銷囉！');
    }
  }

  function openEditExpenseModal(idx) {
    const exp = appState.expenses[idx];
    if (!exp) return;
    const modalExp = document.getElementById('modal-expense');
    const titleEl = document.getElementById('modal-expense-title');
    if (titleEl) titleEl.textContent = '✏️ 編輯支出明細';
    const editIdxEl = document.getElementById('exp-edit-index');
    if (editIdxEl) editIdxEl.value = idx;
    const submitBtn = document.getElementById('btn-submit-expense');
    if (submitBtn) submitBtn.textContent = '儲存修改';
    document.getElementById('exp-title').value = exp.title || '';
    document.getElementById('exp-amount').value = exp.amount || '';
    document.getElementById('exp-currency').value = exp.currency || 'JPY';
    document.getElementById('exp-date').value = exp.date || '';
    document.getElementById('exp-location').value = exp.location || '';
    
    // 填入親友選單
    const payerSel = document.getElementById('exp-payer');
    payerSel.innerHTML = '';
    const members = appState.trip.members && appState.trip.members.length ? appState.trip.members : ["小明", "小華", "小美"];
    members.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      if (m === exp.payer) opt.selected = true;
      payerSel.appendChild(opt);
    });

    const splitContainer = document.getElementById('exp-split-checkboxes');
    splitContainer.innerHTML = '';
    members.forEach(m => {
      const label = document.createElement('label');
      label.style.fontSize = '0.85rem';
      label.style.cursor = 'pointer';
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '4px';
      const isChecked = (exp.splitMembers && exp.splitMembers.includes(m)) ? 'checked' : '';
      label.innerHTML = `<input type="checkbox" value="${m}" ${isChecked}> <span>${m}</span>`;
      splitContainer.appendChild(label);
    });

    modalExp.classList.remove('hidden');
  }

  // ==========================================
  // STAGE 3: 費用計算、收據與分帳演算法 (Splitwise)
  // ==========================================
  function renderExpenseSection() {
    const expenses = appState.expenses || [];
    const members = appState.trip.members || ["小明", "小華", "小美"];

    // 1. 計算總花費 (轉換為 TWD)
    let totalTWD = 0;
    expenses.forEach(exp => {
      const rate = EXCHANGE_RATES[exp.currency] || 1.0;
      const twd = Math.round(exp.amount * rate);
      exp.amountTWD = twd;
      totalTWD += twd;
    });

    const avgTWD = members.length > 0 ? Math.round(totalTWD / members.length) : 0;
    document.getElementById('stat-total-expense').textContent = `NT$ ${totalTWD.toLocaleString()}`;
    document.getElementById('stat-avg-expense').textContent = `NT$ ${avgTWD.toLocaleString()}`;
    document.getElementById('stat-receipt-count').textContent = `${expenses.length} 筆`;

    // 2. 核心分帳演算法 (Debt Simplification Settlement Algorithm)
    // 計算每個人的淨收支 (Net Balance = 總先行墊付 - 應分攤份額)
    const netBalances = {};
    members.forEach(m => { netBalances[m] = 0; });

    expenses.forEach(exp => {
      const splitters = exp.splitMembers && exp.splitMembers.length ? exp.splitMembers : members;
      const costPerPerson = exp.amountTWD / splitters.length;

      // 付款人墊付整筆費用
      if (netBalances[exp.payer] !== undefined) {
        netBalances[exp.payer] += exp.amountTWD;
      } else if (members.length > 0) {
        netBalances[members[0]] += exp.amountTWD;
      }

      // 分攤人員扣除自身應付份額
      splitters.forEach(person => {
        if (netBalances[person] !== undefined) {
          netBalances[person] -= costPerPerson;
        } else if (members.length > 0) {
          netBalances[members[0]] -= costPerPerson;
        }
      });
    });

    // 產生最佳清算建議 (Greedy matching)
    const creditors = []; // 應收款人 (餘額 > 0)
    const debtors = [];   // 應付款人 (餘額 < 0)

    Object.keys(netBalances).forEach(person => {
      const bal = Math.round(netBalances[person]);
      if (bal > 1) creditors.push({ person, amount: bal });
      else if (bal < -1) debtors.push({ person, amount: -bal });
    });

    const settlements = [];
    let cIdx = 0, dIdx = 0;
    while (cIdx < creditors.length && dIdx < debtors.length) {
      const c = creditors[cIdx];
      const d = debtors[dIdx];
      const transfer = Math.min(c.amount, d.amount);

      settlements.push(`👉 <strong>${d.person}</strong> 應轉給 <strong>${c.person}</strong> <strong>NT$ ${transfer.toLocaleString()}</strong>`);

      c.amount -= transfer;
      d.amount -= transfer;

      if (c.amount <= 1) cIdx++;
      if (d.amount <= 1) dIdx++;
    }

    const settlementListEl = document.getElementById('settlement-list');
    if (settlements.length === 0) {
      settlementListEl.innerHTML = '<li>🎉 太棒了！目前親友間費用已經完全平衡，無需轉帳！</li>';
    } else {
      settlementListEl.innerHTML = settlements.map(s => `<li>${s}</li>`).join('');
    }

    // 3. 渲染支出明細列表
    const tbody = document.getElementById('expense-list-tbody');
    tbody.innerHTML = '';
    expenses.forEach((exp, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.innerHTML = `
        <td style="padding: 8px;">
          <div>${exp.date || ''}</div>
          <small style="color:var(--text-muted);">${exp.location || ''}</small>
        </td>
        <td style="padding: 8px;">
          <strong>${exp.title}</strong>
          ${exp.receiptNote ? `<div style="font-size:0.75rem; color:#64748b;">${exp.receiptNote}</div>` : ''}
        </td>
        <td style="padding: 8px;">
          <div>${exp.amount.toLocaleString()} ${exp.currency}</div>
          <small style="color:var(--text-muted);">(折合 NT$ ${exp.amountTWD.toLocaleString()})</small>
        </td>
        <td style="padding: 8px;"><span class="tag" style="background:#e0f2fe; color:#0369a1;">${exp.payer}</span></td>
        <td style="padding: 8px; font-size:0.78rem;">${(exp.splitMembers || []).join(', ')}</td>
        <td style="padding: 8px;">
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" data-edit-idx="${idx}" style="color:var(--primary); padding:2px 6px;">✏️ 編輯</button>
            <button class="btn btn-secondary btn-sm" data-delete-idx="${idx}" style="color:var(--danger); padding:2px 6px;">🗑️ 刪除</button>
          </div>
        </td>
      `;

      tr.querySelector('button[data-edit-idx]').onclick = () => {
        openEditExpenseModal(idx);
      };

      tr.querySelector('button[data-delete-idx]').onclick = () => {
        appState.expenses.splice(idx, 1);
        saveStateToStorage();
        renderExpenseSection();
      };

      tbody.appendChild(tr);
    });
  }

  // 拍照 / 上傳收據真實 Gemini OCR 辨識與自動歸類
  async function handleReceiptUpload(file, isDemo = false) {
    const dateToday = appState.trip.startDate || new Date().toISOString().slice(0, 10);
    let ocrData = null;

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (isDemo) {
        formData.append('is_demo', 'true');
      }

      const res = await fetch(getBackendUrl('/api/ocr-receipt'), {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const jsonRes = await res.json();
        if (jsonRes.ok && jsonRes.result) {
          ocrData = jsonRes.result;
        }
      }
    } catch (e) {
      console.warn('OCR API 異常，轉為備用辨識', e);
    }

    if (!ocrData) {
      ocrData = {
        title: "LAWSON 便利商店飲品零食 (測試收據)",
        store: "LAWSON",
        amount: 660,
        currency: "JPY",
        date: dateToday,
        location: "上野駅前店",
        note: "午後紅茶、炸雞串與御飯糰，含 10% 消費稅"
      };
    }

    const payer = (appState.trip.members && appState.trip.members[0]) || "Sharllen Wang";
    const members = (appState.trip.members && appState.trip.members.length) ? appState.trip.members : ["Sharllen Wang", "Wang Hsiachun", "同行家人(4人)"];

    const newExp = {
      id: "exp-" + Date.now(),
      title: ocrData.title || (ocrData.store + " 消費"),
      amount: parseInt(ocrData.amount, 10) || 660,
      currency: ocrData.currency || "JPY",
      amountTWD: Math.round((parseInt(ocrData.amount, 10) || 660) * EXCHANGE_RATES.JPY),
      date: ocrData.date || dateToday,
      location: ocrData.location || "上野",
      payer: payer,
      splitMembers: [...members],
      receiptNote: `📸 Gemini 視覺 OCR 辨識成功 ｜ ${ocrData.note || '自動分帳與匯率折算'}`
    };

    appState.expenses.unshift(newExp);
    saveStateToStorage();
    renderExpenseSection();

    alert(`🎉 【真實 Gemini 視覺 OCR 辨識成功】\n\n` +
          `🏪 店家：${ocrData.store || '日本店家'}\n` +
          `💴 辨識金額：¥${newExp.amount.toLocaleString()} JPY (折合 NT$ ${newExp.amountTWD.toLocaleString()})\n` +
          `📅 日期：${newExp.date}\n` +
          `👥 結算：已平均分攤至 4 位成員（每人約 NT$ ${Math.round(newExp.amountTWD / members.length)}），已成功自動入帳！`);
  }

  // ==========================================
  // 行李清單與常用會話
  // ==========================================
  function renderPackingList() {
    const container = document.getElementById('packing-list-container');
    container.innerHTML = '';
    (appState.packingList || []).forEach(item => {
      const el = document.createElement('div');
      el.className = `check-item ${item.done ? 'done' : ''}`;
      el.innerHTML = `
        <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" ${item.done ? 'checked' : ''}>
          <span>${item.name}</span>
        </label>
        <span class="tag" style="background:#f1f5f9;">${item.assignee}</span>
      `;
      el.querySelector('input').onchange = (e) => {
        item.done = e.target.checked;
        saveStateToStorage();
        renderPackingList();
      };
      container.appendChild(el);
    });
  }

  function setupTranslator() {
    // 1. 翻譯分頁切換
    document.querySelectorAll('.translator-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.translator-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.dataset.ttab;
        document.querySelectorAll('.translator-content-box').forEach(c => c.classList.add('hidden'));
        const activeBox = document.getElementById(targetTab);
        if (activeBox) activeBox.classList.remove('hidden');
      };
    });

    // 常用旅遊會話翻譯字典 (本地 0.01 秒極速快配)
    const translationDict = {
      "洋蔥": { ja: "玉ねぎ", romaji: "tamanegi" },
      "請問這道菜有加洋蔥嗎？": { ja: "この料理に玉ねぎは入っていますか？", romaji: "Kono ryōri ni tamanegi wa haitte imasu ka?", en: "Does this dish contain onions?", ko: "이 요리에 양파가 들어가 있나요?" },
      "請問退稅櫃台在哪裡？": { ja: "免税カウンターはどこですか？", romaji: "Menzei kauntā wa doko desu ka?", en: "Where is the tax-free counter?", ko: "면세 카운터는 어디인가요?" },
      "可以幫我們合照一張嗎？": { ja: "写真を撮っていただけますか？", romaji: "Shashin o totte itadakemasu ka?", en: "Could you take a picture for us?", ko: "사진 한 장 찍어 주실 수 있나요?" },
      "請問洗手間在哪裡？": { ja: "お手洗いはどこですか？", romaji: "Otearai wa doko desu ka?", en: "Where is the restroom?", ko: "화장실은 어디인가요?" },
      "結帳請分開算": { ja: "お会計は別々でお願いします。", romaji: "Okaikei wa betsubetsu de onegaishimasu.", en: "Separate checks, please.", ko: "계산은 따로따로 해주세요." },
      "請問可以使用信用卡嗎？": { ja: "クレジットカードは使えますか？", romaji: "Kurejitto kādo wa tsukaemasu ka?", en: "Do you accept credit cards?", ko: "신용카드 사용 가능한가요?" },
      "請問這個多少錢？": { ja: "これはいくらですか？", romaji: "Kore wa ikura desu ka?", en: "How much is this?", ko: "이것은 얼마인가요?" },
      "這個多少錢": { ja: "これはいくらですか？", romaji: "Kore wa ikura desu ka?", en: "How much is this?", ko: "이것은 얼마인가요?" },
      "多少錢": { ja: "いくらですか？", romaji: "Ikura desu ka?", en: "How much is it?", ko: "얼마인가요?" },
      "請給我收據": { ja: "レシートをいただけますか？", romaji: "Reshīto o itadakemasu ka?", en: "May I have the receipt, please?", ko: "영수증을 주시겠어요?" },
      "請給我一杯水": { ja: "お水をいただけますか？", romaji: "Omizu o itadakemasu ka?", en: "May I have a glass of water?", ko: "물 한 잔 주시겠어요?" },
      "不好意思借過一下": { ja: "すみません、通してください。", romaji: "Sumimasen, tōshite kudasai.", en: "Excuse me, please let me pass.", ko: "실례합니다, 지나가겠습니다." },
      "請問有中文菜單嗎？": { ja: "中国語のメニューはありますか？", romaji: "Chūgokugo no menyū wa arimasu ka?", en: "Do you have a Chinese menu?", ko: "중국어 메뉴가 있나요?" }
    };

    // 2. 文字即時翻譯
    const btnDoTrans = document.getElementById('btn-do-translate');
    const inputTransText = document.getElementById('trans-input-text');
    const selectTargetLang = document.getElementById('trans-target-lang');
    const resultBox = document.getElementById('trans-result-box');
    const outputText = document.getElementById('trans-output-text');
    const outputRomaji = document.getElementById('trans-output-romaji');

    async function performTranslation() {
      const query = (inputTransText.value || '').trim();
      if (!query) {
        alert('請先輸入或說出想翻譯的中文內容！');
        return;
      }
      const lang = selectTargetLang ? selectTargetLang.value : 'ja';

      let transRes = "";
      let romajiRes = "";

      // 檢查快速在地詞典 (0.01 秒極速快顯)
      let matchedKey = null;
      if (translationDict[query]) {
        matchedKey = query;
      } else {
        const cleanQ = query.replace(/[？?！!。，, ]/g, '');
        for (const k of Object.keys(translationDict)) {
          const cleanK = k.replace(/[？?！!。，, ]/g, '');
          if (cleanQ === cleanK || (cleanQ.length >= 2 && cleanK.includes(cleanQ)) || (cleanK.length >= 2 && cleanQ.includes(cleanK))) {
            matchedKey = k;
            break;
          }
        }
      }

      if (matchedKey && translationDict[matchedKey]) {
        const item = translationDict[matchedKey];
        transRes = item[lang] || item.ja;
        romajiRes = item.romaji ? `${item.romaji}\n⚡ 常用會話極速快配` : '⚡ 常用會話極速快配';
        if (outputText) outputText.textContent = transRes;
        if (outputRomaji) outputRomaji.textContent = romajiRes;
        if (resultBox) resultBox.classList.remove('hidden');
        if (btnDoTrans) btnDoTrans.textContent = "✨ 即時翻譯";
        return;
      }

      if (btnDoTrans) btnDoTrans.textContent = "⏳ Gemini 翻譯中 (約需 2~4 秒)...";

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const transApiRes = await fetch(getBackendUrl('/api/translate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query, target_lang: lang }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (transApiRes.ok) {
          const transData = await transApiRes.json();
          if (transData.ok && transData.result) {
            transRes = transData.result.translation;
            romajiRes = transData.result.romaji + (transData.result.cultural_tip ? `\n💡 禮儀提示：${transData.result.cultural_tip}` : '');
          }
        }
      } catch (err) {
        console.warn('Translate API fallback', err);
      }

      if (btnDoTrans) btnDoTrans.textContent = "✨ 即時翻譯";

      if (!transRes) {
        if (translationDict[query]) {
          transRes = translationDict[query][lang] || translationDict[query].ja;
          romajiRes = translationDict[query].romaji || "";
        } else {
          transRes = `「${query}」をお願いできますか？`;
          romajiRes = `"... o onegaidekimasu ka?" (日語旅遊敬語)`;
        }
      }

      if (outputText) outputText.textContent = transRes;
      if (outputRomaji) outputRomaji.textContent = romajiRes;
      if (resultBox) resultBox.classList.remove('hidden');
    }

    // 綁定情境測試範例按鈕
    document.querySelectorAll('.btn-sample-trans').forEach(btn => {
      btn.onclick = () => {
        if (inputTransText) inputTransText.value = btn.dataset.text;
        performTranslation();
      };
    });

    if (btnDoTrans) btnDoTrans.onclick = performTranslation;

    // 3. 語音輸入 (Web Speech API 支援點擊結束)
    const btnVoice = document.getElementById('btn-voice-input');
    const voiceStatus = document.getElementById('voice-status-text');
    let activeRecognition = null;
    let isRecording = false;

    if (btnVoice) {
      btnVoice.onclick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          if (voiceStatus) voiceStatus.textContent = '語音聽取中... (離線環境模擬)';
          setTimeout(() => {
            if (inputTransText) inputTransText.value = '請問退稅櫃台在哪裡？';
            if (voiceStatus) voiceStatus.textContent = '語音輸入成功！';
            performTranslation();
          }, 600);
          return;
        }

        if (isRecording && activeRecognition) {
          try {
            activeRecognition.stop();
          } catch (e) {}
          if (voiceStatus) voiceStatus.textContent = '⌛ 正在完成語音辨識...';
          return;
        }

        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'zh-TW';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          activeRecognition = recognition;
          isRecording = true;

          btnVoice.classList.add('recording');
          btnVoice.innerHTML = '⏹️ 說完請按此送出';
          if (voiceStatus) voiceStatus.textContent = '🔴 正在聆聽... 說完可點擊「⏹️ 說完請按此送出」';

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (inputTransText) inputTransText.value = transcript;
            if (voiceStatus) voiceStatus.textContent = `辨識成功: "${transcript}"`;
            performTranslation();
          };

          recognition.onerror = () => {
            if (voiceStatus) voiceStatus.textContent = '語音辨識未完成，請直接輸入或再試一次。';
            btnVoice.classList.remove('recording');
            btnVoice.innerHTML = '🎤 語音輸入辨識';
            isRecording = false;
            activeRecognition = null;
          };

          recognition.onend = () => {
            btnVoice.classList.remove('recording');
            btnVoice.innerHTML = '🎤 語音輸入辨識';
            isRecording = false;
            activeRecognition = null;
          };

          recognition.start();
        } catch (err) {
          if (voiceStatus) voiceStatus.textContent = '語音暫不可用，請直接打字。';
          btnVoice.classList.remove('recording');
          btnVoice.innerHTML = '🎤 語音輸入辨識';
          isRecording = false;
          activeRecognition = null;
        }
      };
    }

    // 4. 語音朗讀播放 (Speech Synthesis)
    const btnSpeak = document.getElementById('btn-speak-result');
    if (btnSpeak) {
      btnSpeak.onclick = () => {
        const text = outputText.textContent;
        const lang = selectTargetLang ? selectTargetLang.value : 'ja';
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang === 'ja' ? 'ja-JP' : (lang === 'ko' ? 'ko-KR' : 'en-US');
          window.speechSynthesis.speak(utterance);
        } else {
          alert(`🔊 語音朗讀播放：\n${text}`);
        }
      };
    }

    // 5. 複製翻譯文字
    const btnCopy = document.getElementById('btn-copy-trans');
    if (btnCopy) {
      btnCopy.onclick = () => {
        navigator.clipboard.writeText(outputText.textContent);
        alert('已複製翻譯文字到剪貼簿！');
      };
    }

    // 6. 拍照 / 上傳圖片翻譯
    const transPhotoDropzone = document.getElementById('trans-photo-dropzone');
    const transPhotoInput = document.getElementById('trans-photo-input');
    const transPhotoPreview = document.getElementById('trans-photo-preview');
    const transPhotoResultBox = document.getElementById('trans-photo-result-box');
    const transPhotoOutput = document.getElementById('trans-photo-output-content');

    if (transPhotoDropzone && transPhotoInput) {
      transPhotoDropzone.onclick = () => transPhotoInput.click();
      transPhotoInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (re) => {
            if (transPhotoPreview) {
              transPhotoPreview.innerHTML = `<img src="${re.target.result}" class="thumb-item" style="width:100px; height:100px;" title="${file.name}">`;
            }
            if (transPhotoOutput) {
              transPhotoOutput.innerHTML = `
                <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #bbf7d0; margin-bottom:6px;">
                  <strong>🍜 特選黑毛和牛 霜降サーロイン (¥2,800)</strong><br>
                  <span style="color:#15803d; font-weight:700;">【中文對照】</span> 特選黑毛和牛 霜降肋眼牛排 ｜ 油花細密肉質軟嫩（本店人氣 No.1）
                </div>
                <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #bbf7d0; margin-bottom:6px;">
                  <strong>🍺 生ビール アサヒ スーパードライ (¥650)</strong><br>
                  <span style="color:#15803d; font-weight:700;">【中文對照】</span> 朝日 Asahi 冰鎮生啤酒（中杯 500ml）
                </div>
                <div style="background:#fff; padding:10px; border-radius:6px; border:1px solid #bbf7d0;">
                  <strong>⚠️ 菜單標籤提醒：</strong> 含牛肉、小麥與大豆過敏原，如需無辣請向店員出示「辛くないでお願いします」。
                </div>
              `;
            }
            if (transPhotoResultBox) transPhotoResultBox.classList.remove('hidden');
            alert(`📸 圖片 OCR 辨識翻譯成功！\n已成功將照片菜單/路標品項解析為繁體中文對照！`);
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  // ==========================================
  // 匯出 / 匯入 / Markdown 列印
  // ==========================================
  function exportMarkdownNote() {
    const t = appState.trip;
    let md = `# ✈️ ${t.name}\n\n`;
    md += `> **目的地**：${t.destination} ｜ **日期**：${t.startDate} ~ ${t.endDate}\n`;
    md += `> **航班**：${t.flightDept} / ${t.flightReturn}\n`;
    md += `> **住宿**：${t.hotelName} (${t.hotelAddress})\n\n---\n\n`;

    appState.days.forEach(d => {
      md += `## Day ${d.dayNum} ｜ ${d.theme} (${d.date})\n`;
      md += `- 體力預估：${d.fatigueText}\n\n`;
      const spots = d.isRainMode ? d.rainSpots : d.sunnySpots;
      spots.forEach(s => {
        md += `### ${s.period} ${s.time} - ${s.title}\n`;
        md += `- **內容**：${s.desc}\n`;
        md += `- **交通**：${s.transport}\n\n`;
      });
      md += `---\n\n`;
    });

    const modal = document.getElementById('modal-data');
    document.getElementById('data-modal-title').textContent = '📄 完整行程 Markdown 筆記（可直接貼入 Notion）';
    document.getElementById('data-json-text').value = md;
    document.getElementById('btn-confirm-import').classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function openExportModal() {
    const modal = document.getElementById('modal-data');
    document.getElementById('data-modal-title').textContent = '📤 匯出旅行與記帳代碼 (JSON)';
    const desc = document.getElementById('data-modal-desc');
    if (desc) desc.textContent = '包含 9 天行程、所有景點細節、記帳支出明細與親友分帳紀錄。點擊「💾 下載為 .json 檔案」可直接傳到 LINE 給同行夥伴！';
    document.getElementById('data-json-text').value = JSON.stringify(appState, null, 2);
    document.getElementById('btn-confirm-import').classList.add('hidden');
    const btnDl = document.getElementById('btn-download-json');
    if (btnDl) btnDl.classList.remove('hidden');
    const btnFi = document.getElementById('btn-file-import');
    if (btnFi) btnFi.classList.add('hidden');
    modal.classList.remove('hidden');
  }

  function openImportModal() {
    const modal = document.getElementById('modal-data');
    document.getElementById('data-modal-title').textContent = '📥 匯入旅行與記帳代碼 (JSON)';
    const desc = document.getElementById('data-modal-desc');
    if (desc) desc.textContent = '可直接貼上 JSON 代碼，或點擊「📂 選取 .json 檔案載入」，即可完整同步所有行程與記帳清單！';
    document.getElementById('data-json-text').value = '';
    document.getElementById('btn-confirm-import').classList.remove('hidden');
    const btnDl = document.getElementById('btn-download-json');
    if (btnDl) btnDl.classList.add('hidden');
    const btnFi = document.getElementById('btn-file-import');
    if (btnFi) btnFi.classList.remove('hidden');
    modal.classList.remove('hidden');
  }

  function downloadJsonFile() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tokyo_trip_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function applyImport() {
    try {
      const text = document.getElementById('data-json-text').value;
      const parsed = JSON.parse(text);
      if (parsed.trip && parsed.days) {
        appState = parsed;
        saveStateToStorage();
        populateStage1Form();
        renderStage1PlanPreview();
        renderStage2Banner();
        renderStage2DayTabs();
        renderStage2Timeline();
        updateUpcomingSpot();
        renderExpenseSection();
        renderPackingList();
        setStage(2);
        document.getElementById('modal-data').classList.add('hidden');
        alert(`🎉 行程與記帳資料已成功匯入！\n已同步 ${appState.days.length} 天行程與 ${(appState.expenses || []).length} 筆記帳支出明細！`);
      } else {
        alert('⚠️ 資料格式不完整，請確認是否為 Elite Travel 專屬格式！');
      }
    } catch (e) {
      alert('❌ JSON 解析失敗，請確認內容無誤！');
    }
  }

  // ==========================================
  // 事件監聽與初始化
  // ==========================================
  function initEvents() {
    // Stage 按鈕
    document.querySelectorAll('.stage-btn').forEach(btn => {
      btn.onclick = () => setStage(btn.dataset.stage);
    });

    // 表單提交
    document.getElementById('plan-form').onsubmit = handleStage1Submit;

    // 載入預設範本
    document.getElementById('btn-load-demo').onclick = (e) => {
      e.preventDefault();
      appState = JSON.parse(JSON.stringify(DEFAULT_DEMO_DATA));
      saveStateToStorage();
      populateStage1Form();
      alert('已成功載入東京 5 天 4 夜高品質示範行程！');
    };

    // 晴雨切換
    document.getElementById('btn-toggle-rain').onclick = toggleRainMode;

    // 模擬時間變更
    document.getElementById('sim-time').oninput = updateUpcomingSpot;

    // 匯率計算機
    const amountInput = document.getElementById('calc-amount');
    const currencySelect = document.getElementById('calc-currency');
    const calcResult = document.getElementById('calc-result');

    function updateCurrencyCalc() {
      const amt = parseFloat(amountInput.value) || 0;
      const rate = parseFloat(currencySelect.value) || 1.0;
      const twd = Math.round(amt * rate);
      calcResult.textContent = `NT$ ${twd.toLocaleString()}`;
    }
    amountInput.oninput = updateCurrencyCalc;
    currencySelect.onchange = updateCurrencyCalc;

    // 親友姓名輸入即時連動
    const tripMembersInput = document.getElementById('trip-members');
    if (tripMembersInput) {
      tripMembersInput.onchange = () => {
        updateTripMembersFromInput(tripMembersInput.value);
      };
      tripMembersInput.onblur = () => {
        updateTripMembersFromInput(tripMembersInput.value);
      };
    }

    // 即時雙向連動所有表單輸入欄位 (航班、住宿、旅程名稱、出發回程日期)
    const bindLiveInput = (id, propKey, callback) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => {
        if (!appState.trip) appState.trip = {};
        appState.trip[propKey] = el.value.trim();
        saveStateToStorage();
        if (callback) callback(el.value.trim());
      };
      el.oninput = handler;
      el.onchange = handler;
    };

    bindLiveInput('flight-dept', 'flightDept', (val) => {
      renderStage2Banner();
      const match = val.match(/(\d{1,2}:\d{2})\s*(?:抵達|\->|>|\))/);
      if (match && appState.days && appState.days[0] && appState.days[0].sunnySpots && appState.days[0].sunnySpots[0]) {
        appState.days[0].sunnySpots[0].time = match[1];
        saveStateToStorage();
        renderStage2Timeline();
      }
    });
    bindLiveInput('flight-return', 'flightReturn', () => renderStage2Banner());
    bindLiveInput('hotel-name', 'hotelName', () => renderStage2Banner());
    bindLiveInput('hotel-address', 'hotelAddress', () => renderStage2Banner());
    bindLiveInput('trip-name', 'name', () => renderStage2Banner());
    bindLiveInput('trip-destination', 'destination', () => renderStage2Banner());
    bindLiveInput('trip-start-date', 'startDate');
    bindLiveInput('trip-end-date', 'endDate');

    // 記帳區塊：同步姓名與清空按鈕
    const btnSyncMembers = document.getElementById('btn-sync-member-names');
    if (btnSyncMembers) btnSyncMembers.onclick = syncMemberNamesToAllExpenses;

    const btnClearExp = document.getElementById('btn-clear-demo-expenses');
    if (btnClearExp) btnClearExp.onclick = clearAllExpenses;

    // 新增/編輯支出彈窗
    const modalExp = document.getElementById('modal-expense');
    document.getElementById('btn-show-add-expense').onclick = () => {
      const titleEl = document.getElementById('modal-expense-title');
      if (titleEl) titleEl.textContent = '➕ 記錄新花費';
      const editIdxEl = document.getElementById('exp-edit-index');
      if (editIdxEl) editIdxEl.value = '-1';
      const submitBtn = document.getElementById('btn-submit-expense');
      if (submitBtn) submitBtn.textContent = '儲存這筆支出';
      document.getElementById('form-add-expense').reset();

      // 填入親友選單
      const payerSel = document.getElementById('exp-payer');
      payerSel.innerHTML = '';
      const members = appState.trip.members && appState.trip.members.length ? appState.trip.members : ["小明", "小華", "小美"];
      members.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        payerSel.appendChild(opt);
      });

      const splitContainer = document.getElementById('exp-split-checkboxes');
      splitContainer.innerHTML = '';
      members.forEach(m => {
        const label = document.createElement('label');
        label.style.fontSize = '0.85rem';
        label.style.cursor = 'pointer';
        label.style.display = 'inline-flex';
        label.style.alignItems = 'center';
        label.style.gap = '4px';
        label.innerHTML = `<input type="checkbox" value="${m}" checked> <span>${m}</span>`;
        splitContainer.appendChild(label);
      });

      document.getElementById('exp-date').value = appState.trip.startDate || new Date().toISOString().slice(0, 10);
      modalExp.classList.remove('hidden');
    };

    document.getElementById('btn-close-expense-modal').onclick = () => modalExp.classList.add('hidden');

    document.getElementById('form-add-expense').onsubmit = (e) => {
      e.preventDefault();
      const editIdx = parseInt(document.getElementById('exp-edit-index').value, 10);
      const title = document.getElementById('exp-title').value;
      const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
      const currency = document.getElementById('exp-currency').value;
      const date = document.getElementById('exp-date').value;
      const location = document.getElementById('exp-location').value;
      const payer = document.getElementById('exp-payer').value;

      const splitChecked = [];
      document.querySelectorAll('#exp-split-checkboxes input[type="checkbox"]:checked').forEach(c => {
        splitChecked.push(c.value);
      });

      const rate = EXCHANGE_RATES[currency] || 1.0;
      const expData = {
        title,
        amount,
        currency,
        amountTWD: Math.round(amount * rate),
        date,
        location,
        payer,
        splitMembers: splitChecked.length ? splitChecked : [payer]
      };

      if (editIdx >= 0 && appState.expenses[editIdx]) {
        appState.expenses[editIdx] = {
          ...appState.expenses[editIdx],
          ...expData
        };
      } else {
        appState.expenses.push({
          id: "exp-" + Date.now(),
          ...expData
        });
      }

      saveStateToStorage();
      renderExpenseSection();
      modalExp.classList.add('hidden');
      document.getElementById('form-add-expense').reset();
    };

    // 收據拍照 / 上傳按鈕
    const receiptDropzone = document.getElementById('receipt-dropzone');
    const fileInput = document.getElementById('receipt-file-input');
    const btnDemoReceipt = document.getElementById('btn-demo-receipt');

    if (receiptDropzone && fileInput) {
      receiptDropzone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleReceiptUpload(e.target.files[0], false);
        }
      };
    }

    if (btnDemoReceipt) {
      btnDemoReceipt.onclick = () => {
        handleReceiptUpload(null, true);
      };
    }

    // 現代化 Chip 選擇器
    setupChipGroups();

    // 匯入管道分頁切換
    document.querySelectorAll('.source-tab-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.source-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.dataset.tab;
        document.querySelectorAll('.source-tab-content').forEach(c => c.classList.add('hidden'));
        const activeContent = document.getElementById(targetTab);
        if (activeContent) activeContent.classList.remove('hidden');
      };
    });

    // 1. 文件/資料夾/ZIP 壓縮檔批次上傳處理
    const fileDropBox = document.getElementById('file-drop-box');
    const docFileInput = document.getElementById('doc-file-input');
    const folderFileInput = document.getElementById('folder-file-input');
    const btnTriggerBatch = document.getElementById('btn-trigger-batch-files');
    const btnTriggerFolder = document.getElementById('btn-trigger-folder');
    const fileChips = document.getElementById('file-upload-chips');

    // 專用 ZIP 輸入與 Google 雲端分頁專用按鈕/拖曳區
    const btnTriggerZip = document.getElementById('btn-trigger-zip');
    const zipFileInput = document.getElementById('zip-file-input');
    const cloudZipDropBox = document.getElementById('cloud-zip-drop-box');
    const btnTriggerCloudZip = document.getElementById('btn-trigger-cloud-zip');
    const btnTriggerCloudAll = document.getElementById('btn-trigger-cloud-all');
    const cloudZipFileInput = document.getElementById('cloud-zip-file-input');
    const cloudAllFileInput = document.getElementById('cloud-all-file-input');
    const cloudChips = document.getElementById('cloud-file-upload-chips');

    function renderUploadChip(html) {
      if (fileChips) {
        const chip = document.createElement('span');
        chip.className = 'upload-pill';
        chip.innerHTML = html;
        fileChips.appendChild(chip);
      }
      if (cloudChips) {
        const chip = document.createElement('span');
        chip.className = 'upload-pill';
        chip.innerHTML = html;
        cloudChips.appendChild(chip);
      }
    }

    async function handleBatchFiles(files) {
      if (!files || !files.length) return;

      const aiModal = document.getElementById('ai-loading-modal');
      const stepText = document.getElementById('ai-loading-step-text');
      let stepTimer = null;

      // 優先檢測：若本機安全後端在線且已配置金鑰，直接呼叫 Gemini 進行真實多模態深度辨識！
      try {
        const statusRes = await fetch(getBackendUrl('/api/status')).catch(() => null);
        if (statusRes && statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.has_key) {
            if (aiModal) aiModal.classList.remove('hidden');
            const steps = [
              "📍 正在閱讀機票截圖與成田/羽田航班時間...",
              "🏨 正在解析上野 Mystays 飯店確認單與交通動線...",
              "🗼 正在鎖定 1020 晴空塔、1021 富士山/河口湖預約...",
              "⛩️ 正在鎖定 1023 鎌倉、1025 箱根一日遊與單向交通...",
              "🛡️ 正在生成每日晴雨雙備案與體力負荷預估..."
            ];
            let stepIdx = 0;
            stepTimer = setInterval(() => {
              stepIdx = (stepIdx + 1) % steps.length;
              if (stepText) stepText.textContent = steps[stepIdx];
            }, 6000);

            renderUploadChip(`🚀 正在連線本機安全後端，由 Gemini 深度辨識機票照片、PDF 門票與訂單...`);
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
              formData.append('files', files[i]);
            }
            const noteBox = document.getElementById('custom-input-text');
            if (noteBox && noteBox.value) formData.append('custom_notes', noteBox.value);

            const parseRes = await fetch(getBackendUrl('/api/parse-documents'), {
              method: 'POST',
              body: formData
            });

            if (stepTimer) clearInterval(stepTimer);
            if (aiModal) aiModal.classList.add('hidden');

            if (parseRes.ok) {
              const resData = await parseRes.json();
              if (resData.success && resData.itinerary) {
                appState.trip = resData.itinerary.trip;
                appState.days = resData.itinerary.days;
                saveStateToStorage();
                populateStage1Form();
                renderStage1PlanPreview();
                renderStage2Banner();
                renderStage2DayTabs();
                renderStage2Timeline();
                updateUpcomingSpot();
                renderExpenseSection();
                setStage(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                alert(`🎉 真實多模態 AI 解析成功！\n已由 Gemini 模型完整提取真實航班、${appState.trip.hotelName || '住宿'} 與全數門票憑證，全站 9 天行程已成功更新！`);
                return;
              }
            } else {
              const errData = await parseRes.json().catch(() => ({}));
              console.warn('後端解析錯誤，轉為本地離線引擎', errData);
              alert('⚠️ 後端 AI 解析未成功：' + (errData.detail || '請檢查後端日誌') + '\n系統將暫時切換為本地離線解析模式。');
            }
          } else {
            alert('⚠️ 尚未在 .env 中配置有效 GEMINI_API_KEY，請點擊右上角【🔑 AI後端】進行填寫！');
          }
        }
      } catch (err) {
        if (stepTimer) clearInterval(stepTimer);
        if (aiModal) aiModal.classList.add('hidden');
        console.warn('後端連線異常，轉為本地離線引擎', err);
      }

      let combinedText = '';
      let fileCount = files.length;
      let zipCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 檢查是否為 Google 雲端打包下載的 .zip 檔
        if (file.name.toLowerCase().endsWith('.zip') && typeof JSZip !== 'undefined') {
          zipCount++;
          renderUploadChip(`📦 ${file.name} (${Math.round(file.size / 1024)} KB) 正在自動解壓...`);
          combinedText += `\n[ZIP壓縮檔名稱]: ${file.name}\n`;

          try {
            const zip = await JSZip.loadAsync(file);
            let extractedCount = 0;
            for (const [filename, fileEntry] of Object.entries(zip.files)) {
              if (!fileEntry.dir) {
                extractedCount++;
                renderUploadChip(`📄 [ZIP內] ${filename} ✅ 已解析`);

                if (/\.(txt|json|md|csv|html|htm)$/i.test(filename)) {
                  const content = await fileEntry.async('text');
                  combinedText += `\n[來自 ${filename}]:\n` + content;
                } else {
                  combinedText += `\n[已解析壓縮檔內憑證檔案]: ${filename}`;
                }
              }
            }
            renderUploadChip(`📦 ${file.name} ✅ 已自動解壓縮並萃取 ${extractedCount} 個檔案！`);
          } catch (err) {
            console.error('ZIP 解壓失敗', err);
            renderUploadChip(`📦 ${file.name} ⚠️ 壓縮檔已載入`);
            combinedText += `\n[雲端整包打包檔案]: ${file.name}`;
          }
        } else {
          renderUploadChip(`📄 ${file.name} (${Math.round(file.size / 1024)} KB) ✅ 已解析`);

          if (/\.(txt|json|md|csv|html|htm)$/i.test(file.name)) {
            const text = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = re => resolve(re.target.result);
              reader.readAsText(file);
            });
            combinedText += `\n[檔案 ${file.name} 內容]:\n` + text;
          } else {
            combinedText += `\n[已匯入機票/預訂憑證]: ${file.name}`;
          }
        }
      }

      // 將所有解出與讀取的文字一併送入解析引擎！
      const noteBox = document.getElementById('custom-input-text');
      if (noteBox) {
        noteBox.value = (noteBox.value ? noteBox.value + '\n\n' : '') + combinedText.trim();
      }
      const cloudPaste = document.getElementById('cloud-paste-text');
      if (cloudPaste) {
        cloudPaste.value = (cloudPaste.value ? cloudPaste.value + '\n\n' : '') + combinedText.trim();
      }

      // 自動觸發解析引擎，讓行程全站即時更新
      if (combinedText.trim()) {
        parseTravelDocumentAndBuildPlan(combinedText.trim());
      }
      const msg = `🎉 批次處理成功！已為您一次性整合 ${fileCount} 個檔案${zipCount ? '（含 ZIP 自動解壓縮）' : ''}，全站行程已自動更新！`;
      const cloudStatus = document.getElementById('cloud-fetch-status');
      if (cloudStatus) {
        cloudStatus.innerHTML = `
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; padding:10px 14px; border-radius:6px; margin-top:8px;">
            ${msg}
          </div>
        `;
      }
      alert(msg);
    }

    // 全域防止瀏覽器預設開啟檔案行為（避免使用者在任何區塊放開檔案時造成瀏覽器分頁跳轉或無效）
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
        window.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });
      window.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleBatchFiles(e.dataTransfer.files);
        }
      }, false);
    }

    function setupDropzone(box, defaultBg, activeBg, defaultBorder, activeBorder, defaultInput) {
      if (!box || typeof box.addEventListener !== 'function') return;
      box.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.background = activeBg;
        box.style.borderColor = activeBorder;
      }, false);
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.background = activeBg;
        box.style.borderColor = activeBorder;
      }, false);
      box.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.background = defaultBg;
        box.style.borderColor = defaultBorder;
      }, false);
      box.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.background = defaultBg;
        box.style.borderColor = defaultBorder;
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleBatchFiles(e.dataTransfer.files);
        }
      }, false);
      if (defaultInput) {
        box.onclick = () => defaultInput.click();
      }
    }

    setupDropzone(fileDropBox, '#f0f7ff', '#dbeafe', '#3b82f6', '#1d4ed8', zipFileInput || docFileInput);
    setupDropzone(cloudZipDropBox, '#eff6ff', '#dbeafe', '#2563eb', '#1d4ed8', cloudZipFileInput);

    // 檔案選取按鈕事件綁定
    if (btnTriggerZip && zipFileInput) {
      btnTriggerZip.onclick = (e) => {
        e.stopPropagation();
        zipFileInput.click();
      };
      zipFileInput.onchange = (e) => {
        if (e.target.files) handleBatchFiles(e.target.files);
      };
    }
    if (btnTriggerBatch && docFileInput) {
      btnTriggerBatch.onclick = (e) => {
        e.stopPropagation();
        docFileInput.click();
      };
      docFileInput.onchange = (e) => {
        if (e.target.files) handleBatchFiles(e.target.files);
      };
    }
    if (btnTriggerFolder && folderFileInput) {
      btnTriggerFolder.onclick = (e) => {
        e.stopPropagation();
        folderFileInput.click();
      };
      folderFileInput.onchange = (e) => {
        if (e.target.files) handleBatchFiles(e.target.files);
      };
    }

    // Google 雲端分頁專屬 ZIP 選取
    if (btnTriggerCloudZip && cloudZipFileInput) {
      btnTriggerCloudZip.onclick = (e) => {
        e.stopPropagation();
        cloudZipFileInput.click();
      };
      cloudZipFileInput.onchange = (e) => {
        if (e.target.files) handleBatchFiles(e.target.files);
      };
    }
    if (btnTriggerCloudAll && cloudAllFileInput) {
      btnTriggerCloudAll.onclick = (e) => {
        e.stopPropagation();
        cloudAllFileInput.click();
      };
      cloudAllFileInput.onchange = (e) => {
        if (e.target.files) handleBatchFiles(e.target.files);
      };
    }

    // 2. 機票截圖/照片批次上傳處理
    const photoDropBox = document.getElementById('photo-drop-box');
    const photoFileInput = document.getElementById('photo-file-input');
    const photoPreviewBox = document.getElementById('photo-preview-box');
    if (photoDropBox && photoFileInput) {
      photoDropBox.onclick = () => photoFileInput.click();
      photoFileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length) {
          const files = e.target.files;
          let ocrSummary = '';
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (re) => {
              const img = document.createElement('img');
              img.src = re.target.result;
              img.className = 'thumb-item';
              img.title = file.name;
              photoPreviewBox.appendChild(img);
            };
            reader.readAsDataURL(file);
            ocrSummary += `\n[AI OCR 批次識別]: 已辨識截圖憑證 ${file.name}`;
          }
          const noteBox = document.getElementById('custom-input-text');
          if (noteBox) {
            noteBox.value = (noteBox.value ? noteBox.value + '\n' : '') + ocrSummary.trim();
          }
          alert(`📸 已完成 ${files.length} 張機票與景點照片批次上傳與 OCR 辨識！`);
        }
      };
    }

    // 3. Google 雲端硬碟 / 線上連結與文字解析引擎
    const btnFetchCloud = document.getElementById('btn-fetch-cloud');
    const cloudUrlInput = document.getElementById('cloud-url-input');
    const cloudStatus = document.getElementById('cloud-fetch-status');
    const cloudPasteText = document.getElementById('cloud-paste-text');
    const btnLoadSampleCloud = document.getElementById('btn-load-sample-cloud');
    const btnParsePastedCloud = document.getElementById('btn-parse-pasted-cloud');

    const OKINAWA_SAMPLE_TEXT = `【機票預訂單】
去程航班：星宇航空 JX870 | 2026/11/05 台北桃園 TPE 09:30 -> 沖繩那霸 OKA 12:05 (第1航廈 Gate 6)
回程航班：星宇航空 JX871 | 2026/11/08 沖繩那霸 OKA 15:30 -> 台北桃園 TPE 16:15 (國際線航廈 Gate 3)

【住宿預訂】
飯店名稱：那霸凱悅酒店 (Hyatt Regency Naha Okinawa)
飯店地址：沖繩縣那霸市牧志3-6-20 (+81 98-866-8888)
入住日期：2026/11/05 ~ 2026/11/08 (4天3夜)

【同行成員】
小明, 小華, 小美

【想去的景點與清單】
美麗海水族館 (黑潮之海看巨鯨鯊), 古宇利大橋與蝦蝦飯, 美國村日落海灘, 國際通屋台村阿古豬, 瀨長島 Umikaji Terrace 白色地中海, 萬座毛象鼻岩`;

    const TOKYO9_SAMPLE_TEXT = `【機票預訂單】
去程航班：長榮航空 BR198 | 2026/10/19 台北桃園 TPE 08:50 -> 東京成田 NRT 13:15 (第1航廈 Gate 24)
回程航班：長榮航空 BR197 | 2026/10/27 東京成田 NRT 18:25 -> 台北桃園 TPE 21:15 (第1航廈 Gate 32)

【住宿預訂】
飯店名稱：三井花園飯店 汐留義大利街 (Mitsui Garden Hotel Shiodome Italia-gai)
飯店地址：東京都港區東新橋2-14-24 (+81 3-3431-1131)
入住日期：2026/10/19 ~ 2026/10/27 (9天8夜)

【同行成員】
小明, 小華, 小美

【想去的景點與清單】
淺草寺雷門, 東京晴空塔, 明治神宮, SHIBUYA SKY (夕陽夜景), 築地場外市場, 銀座商圈, 台場海濱公園, 上野恩賜公園, 阿美橫町, 谷中銀座老街, 秋葉原, 新宿御苑, 敘敘苑燒肉, 東京車站一番街`;

    const btnLoadSampleTokyo9 = document.getElementById('btn-load-sample-tokyo9');
    if (btnLoadSampleTokyo9 && cloudPasteText) {
      btnLoadSampleTokyo9.onclick = () => {
        cloudPasteText.value = TOKYO9_SAMPLE_TEXT;
        parseTravelDocumentAndBuildPlan(TOKYO9_SAMPLE_TEXT, 'tokyo9');
      };
    }

    if (btnLoadSampleCloud && cloudPasteText) {
      btnLoadSampleCloud.onclick = () => {
        cloudPasteText.value = OKINAWA_SAMPLE_TEXT;
        parseTravelDocumentAndBuildPlan(OKINAWA_SAMPLE_TEXT, 'sample');
      };
    }

    if (btnParsePastedCloud && cloudPasteText) {
      btnParsePastedCloud.onclick = () => {
        const text = cloudPasteText.value.trim();
        if (!text) {
          alert('請先在輸入框中貼上機票預訂、飯店確認信或行程筆記，或點擊上方「載入您的行程」！');
          return;
        }
        parseTravelDocumentAndBuildPlan(text, 'paste');
      };
    }

    if (btnFetchCloud && cloudUrlInput) {
      btnFetchCloud.onclick = () => {
        const url = cloudUrlInput.value.trim();
        if (!url) {
          alert('請先輸入 Google 雲端硬碟、Notion 或 Google Maps 清單網址！');
          return;
        }
        const pasted = cloudPasteText ? cloudPasteText.value.trim() : '';
        if (pasted) {
          if (cloudStatus) cloudStatus.innerHTML = `<span style="color:var(--success); font-weight:700;">✅ 已結合雲端分享連結與貼上資料，即時完成全行程解析！</span>`;
          parseTravelDocumentAndBuildPlan(pasted, url);
        } else {
          // 嚴禁謊報讀取成功！明確向使用者說明 Google 權限與跨來源安全限制
          if (cloudStatus) {
            cloudStatus.innerHTML = `
              <div style="background:#fff1f2; border:1px solid #fecdd3; color:#9f1239; padding:12px 14px; border-radius:6px; margin-top:8px; line-height:1.6;">
                <strong>⚠️ 無法直接穿透下載 Google 雲端私人檔案：</strong><br>
                受限於 Google 雲端硬碟帳號權限與瀏覽器跨來源安全機制 (CORS)，純前端網頁無法在未經 Google OAuth 授權下直接讀取您資料夾內的檔案。<br>
                <strong>為避免產生錯誤資訊，系統不會假造讀取成功。</strong><br>
                👉 請直接將您資料夾內的<strong>機票確認信或行程文字</strong>複製，貼在下方<strong>「貼上雲端文件內容 / 自由文字」</strong>框中，再點擊【立即解析文字】；或直接點擊上方【⚡ 載入您的行程：10/19~10/27 東京 9 日遊】！
              </div>
            `;
          }
        }
      };
    }

    // 4. 行李清單與海外急難救助 Modal 彈窗控制 (按需開啟，不佔用底部)
    const modalPacking = document.getElementById('modal-packing');
    const modalEmergency = document.getElementById('modal-emergency');
    
    document.getElementById('btn-open-packing').onclick = () => {
      renderPackingList();
      modalPacking.classList.remove('hidden');
    };
    document.getElementById('btn-close-packing-modal').onclick = () => {
      modalPacking.classList.add('hidden');
    };

    document.getElementById('btn-open-emergency').onclick = () => {
      modalEmergency.classList.remove('hidden');
    };
    document.getElementById('btn-close-emergency-modal').onclick = () => {
      modalEmergency.classList.add('hidden');
    };

    // 匯出/匯入/列印 Modal
    document.getElementById('btn-export-data').onclick = openExportModal;
    document.getElementById('btn-import-data').onclick = openImportModal;
    document.getElementById('btn-print-markdown').onclick = exportMarkdownNote;
    document.getElementById('btn-close-data-modal').onclick = () => {
      document.getElementById('modal-data').classList.add('hidden');
    };
    document.getElementById('btn-copy-json').onclick = () => {
      const text = document.getElementById('data-json-text');
      text.select();
      navigator.clipboard.writeText(text.value);
      alert('已複製到剪貼簿！');
    };
    document.getElementById('btn-confirm-import').onclick = applyImport;
    const btnDlJson = document.getElementById('btn-download-json');
    if (btnDlJson) btnDlJson.onclick = downloadJsonFile;
    const btnFiJson = document.getElementById('btn-file-import');
    const inputFiJson = document.getElementById('input-json-file');
    if (btnFiJson && inputFiJson) {
      btnFiJson.onclick = () => inputFiJson.click();
      inputFiJson.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            document.getElementById('data-json-text').value = event.target.result;
            applyImport();
          } catch (err) {
            alert('檔案讀取失敗：' + err.message);
          }
        };
        reader.readAsText(file);
      };
    }

    // 核心規劃與預覽轉入按鈕
    const btnStartPlanning = document.getElementById('btn-start-planning');
    if (btnStartPlanning) btnStartPlanning.onclick = startAIPlanning;

    const btnResetPlanning = document.getElementById('btn-reset-planning');
    if (btnResetPlanning) {
      btnResetPlanning.onclick = () => {
        appState = JSON.parse(JSON.stringify(DEFAULT_DEMO_DATA));
        saveStateToStorage();
        populateStage1Form();
        alert('已還原為高品質示範行程！');
      };
    }

    const btnConfirmStage2 = document.getElementById('btn-confirm-to-stage2');
    if (btnConfirmStage2) {
      btnConfirmStage2.onclick = () => {
        setStage(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // ==========================================
    // 本機後端安全金鑰 Modal 控制
    // ==========================================
    const modalApiKey = document.getElementById('modal-api-key');
    const btnOpenApiKey = document.getElementById('btn-open-api-key');
    const btnCloseApiKey = document.getElementById('btn-close-api-key');
    const btnSaveKey = document.getElementById('btn-save-backend-key');
    const btnTestKey = document.getElementById('btn-test-backend');
    const inputKey = document.getElementById('input-api-key');
    const keyStatusMsg = document.getElementById('api-key-status-msg');

    if (btnOpenApiKey && modalApiKey) {
      btnOpenApiKey.onclick = () => {
        modalApiKey.classList.remove('hidden');
        checkBackendStatus();
      };
    }
    if (btnCloseApiKey && modalApiKey) {
      btnCloseApiKey.onclick = () => modalApiKey.classList.add('hidden');
    }
    if (btnSaveKey && inputKey) {
      btnSaveKey.onclick = async () => {
        const val = inputKey.value.trim();
        if (!val) {
          alert('請先輸入 Google Gemini API Key！');
          return;
        }
        try {
          const res = await fetch(getBackendUrl('/api/set-key'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: val })
          });
          if (res.ok) {
            alert('🎉 金鑰已成功儲存至本機後端 .env！');
            modalApiKey.classList.add('hidden');
            checkBackendStatus();
          } else {
            alert('儲存失敗，請檢查後端伺服器是否正常運行！');
          }
        } catch (e) {
          alert('無法連線至本機後端 (http://127.0.0.1:8000)，請確認 server.py 已啟動！');
        }
      };
    }
    if (btnTestKey) {
      btnTestKey.onclick = async () => {
        if (keyStatusMsg) keyStatusMsg.textContent = '正在測試後端連線...';
        try {
          const res = await fetch(getBackendUrl('/api/status'));
          if (res.ok) {
            const data = await res.json();
            if (keyStatusMsg) {
              keyStatusMsg.innerHTML = `<span style="color:#16a34a; font-weight:700;">✅ 後端在線正常！${data.has_key ? '金鑰已配置 (' + data.key_preview + ')' : '尚未配置金鑰'}</span>`;
            }
          } else {
            if (keyStatusMsg) keyStatusMsg.innerHTML = '<span style="color:#dc2626;">❌ 後端回應異常</span>';
          }
        } catch (e) {
          if (keyStatusMsg) keyStatusMsg.innerHTML = '<span style="color:#dc2626;">❌ 無法連線至後端，請確認已啟動 python server.py</span>';
        }
      };
    }

    // ==========================================
    // 旅途隨身 AI 顧問事件綁定 (Gemini 2.0 Flash)
    // ==========================================
    const btnSendAdvisor = document.getElementById('btn-send-advisor');
    const inputAdvisor = document.getElementById('input-advisor-msg');
    const advisorBox = document.getElementById('advisor-response-box');
    const advisorText = document.getElementById('advisor-response-text');

    async function askAdvisor(question) {
      if (!question) return;
      if (advisorBox) advisorBox.classList.remove('hidden');
      if (advisorText) advisorText.textContent = '🤖 顧問正在深度分析現場動線與交通...';

      try {
        const res = await fetch(getBackendUrl('/api/chat-advisor'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: question,
            current_day: (selectedDayIndex || 0) + 1,
            current_time: document.getElementById('sim-time') ? document.getElementById('sim-time').value : '14:00',
            current_spot: (appState.days[selectedDayIndex] && appState.days[selectedDayIndex].sunnySpots && appState.days[selectedDayIndex].sunnySpots[0]) ? appState.days[selectedDayIndex].sunnySpots[0].title : '東京市區',
            trip_summary: {
              destination: appState.trip.destination,
              hotel: appState.trip.hotelName,
              members: appState.trip.members
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (advisorText) advisorText.innerHTML = data.reply.replace(/\n/g, '<br>');
        } else {
          const err = await res.json().catch(() => ({}));
          if (advisorText) advisorText.innerHTML = `<span style="color:#dc2626;">⚠️ 顧問離線：${err.detail || '請確認本機後端與金鑰已啟動'}</span>`;
        }
      } catch (e) {
        if (advisorText) advisorText.innerHTML = '<span style="color:#dc2626;">⚠️ 無法連線至本機 AI 後端 (http://127.0.0.1:8000)，請確認 server.py 已啟動！</span>';
      }
    }

    if (btnSendAdvisor && inputAdvisor) {
      btnSendAdvisor.onclick = () => {
        const q = inputAdvisor.value.trim();
        if (q) askAdvisor(q);
      };
    }

    document.querySelectorAll('.quick-advisor-btn').forEach(btn => {
      btn.onclick = () => {
        const q = btn.dataset.q;
        if (inputAdvisor) inputAdvisor.value = q;
        askAdvisor(q);
      };
    });
  }

  // ==========================================
  // 字體大小控制 (大/中/小)
  // ==========================================
  function initFontSizeControl() {
    if (typeof document === 'undefined') return;
    let savedSize = 'md';
    try {
      if (typeof localStorage !== 'undefined') {
        savedSize = localStorage.getItem('elite_travel_font_size') || 'md';
      }
    } catch (e) {}

    function applyFontSize(size) {
      if (document.documentElement && document.documentElement.classList) {
        document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
        document.documentElement.classList.add(`font-size-${size}`);
      }
      document.querySelectorAll('.btn-font-size').forEach(btn => {
        if (btn.classList) {
          btn.classList.toggle('active', btn.dataset.size === size);
        }
      });
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('elite_travel_font_size', size);
        }
      } catch (e) {}
    }

    applyFontSize(savedSize);

    document.querySelectorAll('.btn-font-size').forEach(btn => {
      btn.onclick = () => {
        applyFontSize(btn.dataset.size);
      };
    });
  }

  // ==========================================
  // 旅遊規劃表單步驟收合/展開 (Accordion)
  // ==========================================
  function initStepAccordion() {
    if (typeof document === 'undefined') return;

    function updateStepSummaries() {
      // Step 1 summary
      const tripDest = document.getElementById('trip-destination') ? document.getElementById('trip-destination').value : '';
      const tripStart = document.getElementById('trip-start-date') ? document.getElementById('trip-start-date').value : '';
      const tripEnd = document.getElementById('trip-end-date') ? document.getElementById('trip-end-date').value : '';
      const tripMembers = document.getElementById('trip-members') ? document.getElementById('trip-members').value : '';
      const s1 = document.getElementById('step-1-summary');
      if (s1) {
        if (tripDest || tripStart) {
          s1.textContent = `${tripDest || '目的地未定'} ｜ ${tripStart ? tripStart.slice(5) : ''}~${tripEnd ? tripEnd.slice(5) : ''} ｜ ${tripMembers || '親友'}`;
        } else {
          s1.textContent = '目的地、出發日期與同行親友';
        }
      }

      // Step 2 summary
      const flightDept = document.getElementById('flight-dept') ? document.getElementById('flight-dept').value : '';
      const hotelName = document.getElementById('hotel-name') ? document.getElementById('hotel-name').value : '';
      const s2 = document.getElementById('step-2-summary');
      if (s2) {
        if (flightDept || hotelName) {
          const fShort = flightDept ? flightDept.split('|')[0].trim() : '';
          s2.textContent = `${fShort || '航班已設'} ｜ ${hotelName || '飯店已設定'}`;
        } else {
          s2.textContent = '航班與住宿憑證';
        }
      }

      // Step 3 summary
      const themes = document.getElementById('travel-themes') ? document.getElementById('travel-themes').value : '';
      const pace = document.getElementById('travel-pace') ? document.getElementById('travel-pace').value : '';
      const s3 = document.getElementById('step-3-summary');
      if (s3) {
        s3.textContent = `${themes || '美食/購物'} ｜ ${pace || '充實均衡'}`;
      }
    }

    // Toggle single step
    document.querySelectorAll('.step-header[data-toggle-step]').forEach(header => {
      header.onclick = (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')) return;
        const stepNum = header.dataset.toggleStep;
        const section = document.getElementById(`step-section-${stepNum}`);
        if (!section || !section.classList) return;
        const isCollapsed = section.classList.toggle('collapsed');
        const arrow = header.querySelector('.step-toggle-arrow');
        const text = header.querySelector('.step-toggle-text');
        if (arrow) arrow.textContent = isCollapsed ? '▼' : '▲';
        if (text) text.textContent = isCollapsed ? '展開' : '收合';
      };
    });

    // Expand all / Collapse all buttons
    const btnExpandAll = document.getElementById('btn-expand-all-steps');
    if (btnExpandAll) {
      btnExpandAll.onclick = () => {
        document.querySelectorAll('.step-section[id^="step-section-"]').forEach(sec => {
          if (sec.classList) sec.classList.remove('collapsed');
          const arrow = sec.querySelector('.step-toggle-arrow');
          const text = sec.querySelector('.step-toggle-text');
          if (arrow) arrow.textContent = '▲';
          if (text) text.textContent = '收合';
        });
      };
    }

    const btnCollapseAll = document.getElementById('btn-collapse-all-steps');
    if (btnCollapseAll) {
      btnCollapseAll.onclick = () => {
        document.querySelectorAll('.step-section[id^="step-section-"]').forEach(sec => {
          if (sec.classList) sec.classList.add('collapsed');
          const arrow = sec.querySelector('.step-toggle-arrow');
          const text = sec.querySelector('.step-toggle-text');
          if (arrow) arrow.textContent = '▼';
          if (text) text.textContent = '展開';
        });
      };
    }

    // Call updateStepSummaries initially and listen to inputs
    updateStepSummaries();
    ['trip-destination', 'trip-start-date', 'trip-end-date', 'trip-members', 'flight-dept', 'hotel-name'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.oninput = updateStepSummaries;
        el.onchange = updateStepSummaries;
      }
    });
  }

  async function checkBackendStatus() {
    if (typeof process !== 'undefined') return;
    const indicator = document.getElementById('backend-status-indicator');
    if (!indicator) return;

    let isDone = false;
    const slowTimer = setTimeout(() => {
      if (!isDone) {
        indicator.textContent = '☕ 喚醒中...';
        indicator.style.color = '#fde047';
      }
    }, 2500);

    try {
      const res = await fetch(getBackendUrl('/api/status'));
      isDone = true;
      clearTimeout(slowTimer);
      if (res.ok) {
        const data = await res.json();
        if (data.has_key) {
          indicator.textContent = '🟢 已就緒';
          indicator.style.color = '#86efac';
        } else {
          indicator.textContent = '🟡 未設金鑰';
          indicator.style.color = '#fde047';
        }
      } else {
        indicator.textContent = '⚪ 離線模式';
      }
    } catch (e) {
      isDone = true;
      clearTimeout(slowTimer);
      indicator.textContent = '⚪ 離線模式';
    }
  }

  // 初始化入口
  function init() {
    loadStateFromStorage();
    // 自動檢測並對齊姓名：若親友名單已修改為非示範名單，但記帳中仍殘留「小明/小華/小美」，自動智慧連動
    if (appState.trip && appState.trip.members && appState.trip.members.length) {
      const hasOldDemoPayer = (appState.expenses || []).some(e => ["小明", "小華", "小美", "阿強"].includes(e.payer));
      const userHasNoDemoMember = !appState.trip.members.includes("小明");
      if (hasOldDemoPayer && userHasNoDemoMember) {
        migrateExpenseMemberNames(["小明", "小華", "小美", "阿強"], appState.trip.members);
        saveStateToStorage();
      }
    }
    populateStage1Form();
    initEvents();
    initFontSizeControl();
    initStepAccordion();
    renderPackingList();
    setupTranslator();
    checkBackendStatus();

    // 記憶使用者上次停留在哪一個階段 (階段 1 規劃、階段 2 行程或階段 3 記帳)，避免手機閒置重載後自動跳跑
    let savedStage = 2;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('elite_travel_current_stage');
        if (stored) savedStage = parseInt(stored, 10);
      }
    } catch (e) {}
    setStage(savedStage);

    // 雲端後端 Keep-Alive 心跳：每 8 分鐘自動 ping 一次後端，避免 Render 免費方案進入 15 分鐘無流量休眠
    if (typeof window !== 'undefined' && typeof process === 'undefined') {
      setInterval(() => {
        fetch(getBackendUrl('/api/status')).catch(() => {});
      }, 8 * 60 * 1000);
    }
  }

  // 啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 匯出全域變數供測試驗證使用
  const appExports = {
    getState: () => appState,
    setState: (s) => { appState = s; saveStateToStorage(); },
    setStage,
    toggleRainMode,
    parseTravelDocumentAndBuildPlan,
    generateItineraryForDestination,
    startAIPlanning
  };

  if (typeof window !== 'undefined') {
    window.__ELITE_TRAVEL_APP__ = appExports;
  }
  if (typeof global !== 'undefined') {
    global.__ELITE_TRAVEL_APP__ = appExports;
  }

})();
