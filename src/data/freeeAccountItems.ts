export type AccountItemGroup = {
  large: string
  middles: Array<{
    middle: string
    items: Array<{
      account: string
      small: string
    }>
  }>
}

export const freeeAccountItems: AccountItemGroup[] = [
  {
    "large": "収益",
    "middles": [
      {
        "middle": "売上高",
        "items": [
          {
            "account": "売上高",
            "small": "売上高"
          },
          {
            "account": "サービス売上",
            "small": "売上高"
          },
          {
            "account": "製品売上",
            "small": "売上高"
          },
          {
            "account": "商品売上",
            "small": "売上高"
          },
          {
            "account": "売上値引・戻し",
            "small": "売上高"
          },
          {
            "account": "売上割引",
            "small": "売上高"
          },
          {
            "account": "売上返品",
            "small": "売上高"
          }
        ]
      },
      {
        "middle": "受取利息",
        "items": [
          {
            "account": "受取利息",
            "small": "受取利息"
          }
        ]
      },
      {
        "middle": "受取配当金",
        "items": [
          {
            "account": "受取配当金",
            "small": "受取配当金"
          }
        ]
      },
      {
        "middle": "雑収入",
        "items": [
          {
            "account": "雑収入",
            "small": "雑収入"
          }
        ]
      }
    ]
  },
  {
    "large": "資産",
    "middles": [
      {
        "middle": "現金・預金",
        "items": [
          {
            "account": "現金",
            "small": "現金"
          },
          {
            "account": "当座預金",
            "small": "当座預金"
          },
          {
            "account": "普通預金",
            "small": "普通預金"
          },
          {
            "account": "定期預金",
            "small": "定期預金"
          },
          {
            "account": "通知預金",
            "small": "通知預金"
          },
          {
            "account": "別段預金",
            "small": "別段預金"
          },
          {
            "account": "証券口座",
            "small": "証券口座"
          },
          {
            "account": "郵便貯金",
            "small": "郵便貯金"
          },
          {
            "account": "ゆうちょ貯金",
            "small": "郵便貯金"
          }
        ]
      },
      {
        "middle": "売上債権",
        "items": [
          {
            "account": "受取手形",
            "small": "受取手形"
          },
          {
            "account": "不渡手形",
            "small": "受取手形"
          },
          {
            "account": "売掛金",
            "small": "売掛金"
          },
          {
            "account": "割引手形",
            "small": "受取手形"
          },
          {
            "account": "電子記録債権",
            "small": "売掛金"
          },
          {
            "account": "売買掛金",
            "small": "売掛金"
          }
        ]
      },
      {
        "middle": "棚卸資産",
        "items": [
          {
            "account": "商品",
            "small": "商品"
          },
          {
            "account": "製品",
            "small": "製品"
          },
          {
            "account": "仕掛品",
            "small": "仕掛品"
          },
          {
            "account": "半製品",
            "small": "仕掛品"
          },
          {
            "account": "原材料",
            "small": "原材料"
          },
          {
            "account": "貯蔵品",
            "small": "貯蔵品"
          },
          {
            "account": "仕入品",
            "small": "商品"
          },
          {
            "account": "消耗品",
            "small": "貯蔵品"
          }
        ]
      },
      {
        "middle": "その他の流動資産",
        "items": [
          {
            "account": "仮払金",
            "small": "仮払金"
          },
          {
            "account": "仮払消費税等",
            "small": "仮払金"
          },
          {
            "account": "前払金",
            "small": "前払金"
          },
          {
            "account": "前払費用",
            "small": "前払費用"
          },
          {
            "account": "立替金",
            "small": "立替金"
          },
          {
            "account": "未収入金",
            "small": "未収入金"
          },
          {
            "account": "未収消費税等",
            "small": "未収入金"
          },
          {
            "account": "短期貸付金",
            "small": "短期貸付金"
          },
          {
            "account": "当座貸越",
            "small": "当座貸越"
          }
        ]
      },
      {
        "middle": "有価証券",
        "items": [
          {
            "account": "売買目的有価証券",
            "small": "売買目的有価証券"
          },
          {
            "account": "その他有価証券",
            "small": "その他有価証券"
          }
        ]
      },
      {
        "middle": "固定資産",
        "items": [
          {
            "account": "建物",
            "small": "建物"
          },
          {
            "account": "建物附属設備",
            "small": "建物"
          },
          {
            "account": "構築物",
            "small": "建物"
          },
          {
            "account": "機械装置",
            "small": "機械装置"
          },
          {
            "account": "車両運搬具",
            "small": "車両運搬具"
          },
          {
            "account": "工具器具備品",
            "small": "工具器具備品"
          },
          {
            "account": "一括償却資産",
            "small": "工具器具備品"
          },
          {
            "account": "リース資産",
            "small": "リース資産"
          },
          {
            "account": "建設仮勘定",
            "small": "建物"
          },
          {
            "account": "土地",
            "small": "土地"
          },
          {
            "account": "無形固定資産",
            "small": "無形固定資産"
          },
          {
            "account": "ソフトウェア",
            "small": "無形固定資産"
          },
          {
            "account": "リース資産（無形）",
            "small": "リース資産"
          },
          {
            "account": "投資その他の資産",
            "small": "投資その他の資産"
          },
          {
            "account": "投資有価証券",
            "small": "投資有価証券"
          },
          {
            "account": "出資金",
            "small": "出資金"
          },
          {
            "account": "長期貸付金",
            "small": "長期貸付金"
          },
          {
            "account": "長期前払費用",
            "small": "長期前払費用"
          }
        ]
      }
    ]
  },
  {
    "large": "負債",
    "middles": [
      {
        "middle": "仕入債務",
        "items": [
          {
            "account": "支払手形",
            "small": "支払手形"
          },
          {
            "account": "買掛金",
            "small": "買掛金"
          },
          {
            "account": "設備未払金",
            "small": "買掛金"
          },
          {
            "account": "未払金",
            "small": "未払金"
          },
          {
            "account": "電子記録債務",
            "small": "買掛金"
          },
          {
            "account": "未払消費税等",
            "small": "未払金"
          },
          {
            "account": "預り金",
            "small": "預り金"
          },
          {
            "account": "前受金",
            "small": "前受金"
          }
        ]
      },
      {
        "middle": "引当金",
        "items": [
          {
            "account": "賞与引当金",
            "small": "賞与引当金"
          },
          {
            "account": "製品保証引当金",
            "small": "製品保証引当金"
          },
          {
            "account": "損害補償引当金",
            "small": "損害補償引当金"
          }
        ]
      },
      {
        "middle": "その他の流動負債",
        "items": [
          {
            "account": "短期借入金",
            "small": "短期借入金"
          },
          {
            "account": "未払法人税等",
            "small": "未払法人税等"
          },
          {
            "account": "未払消費税等",
            "small": "未払法人税等"
          },
          {
            "account": "未払配当金",
            "small": "未払配当金"
          },
          {
            "account": "未払役員賞与",
            "small": "未払役員賞与"
          },
          {
            "account": "未払費用",
            "small": "未払費用"
          },
          {
            "account": "前受収益",
            "small": "前受収益"
          },
          {
            "account": "預り金",
            "small": "預り金"
          },
          {
            "account": "仮受金",
            "small": "仮受金"
          },
          {
            "account": "未払金",
            "small": "未払金"
          }
        ]
      },
      {
        "middle": "固定負債",
        "items": [
          {
            "account": "長期借入金",
            "small": "長期借入金"
          },
          {
            "account": "社債",
            "small": "社債"
          },
          {
            "account": "リース債務",
            "small": "リース債務"
          },
          {
            "account": "資産除去債務",
            "small": "資産除去債務"
          },
          {
            "account": "退職給付引当金",
            "small": "退職給付引当金"
          },
          {
            "account": "繰延税金負債",
            "small": "繰延税金負債"
          }
        ]
      }
    ]
  },
  {
    "large": "純資産",
    "middles": [
      {
        "middle": "資本金",
        "items": [
          {
            "account": "資本金",
            "small": "資本金"
          }
        ]
      },
      {
        "middle": "資本剰余金",
        "items": [
          {
            "account": "資本剰余金",
            "small": "資本剰余金"
          },
          {
            "account": "資本準備金",
            "small": "資本剰余金"
          }
        ]
      },
      {
        "middle": "利益剰余金",
        "items": [
          {
            "account": "利益剰余金",
            "small": "利益剰余金"
          },
          {
            "account": "利益準備金",
            "small": "利益剰余金"
          }
        ]
      },
      {
        "middle": "自己株式",
        "items": [
          {
            "account": "自己株式",
            "small": "自己株式"
          }
        ]
      }
    ]
  },
  {
    "large": "費用",
    "middles": [
      {
        "middle": "売上原価",
        "items": [
          {
            "account": "仕入高",
            "small": "仕入高"
          }
        ]
      },
      {
        "middle": "販売費及び一般管理費",
        "items": [
          {
            "account": "役員報酬",
            "small": "役員報酬"
          },
          {
            "account": "給料賃金",
            "small": "給料賃金"
          },
          {
            "account": "雑給",
            "small": "給料賃金"
          },
          {
            "account": "賞与",
            "small": "給料賃金"
          },
          {
            "account": "退職金",
            "small": "給料賃金"
          },
          {
            "account": "賞与引当金繰入",
            "small": "給料賃金"
          },
          {
            "account": "福利厚生費",
            "small": "福利厚生費"
          },
          {
            "account": "法定福利費",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（確定拠出年金）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（保険）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（健康診断）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（懇親会）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社員旅行）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社員教育）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（制服）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（保養所）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（人間ドック）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社内行事）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社宅）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（使用人兼務役員賞与）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（リフレッシュ）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社内施設利用）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（住宅補助）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（社員持株会）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（出産・育児支援）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（介護支援）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（慶弔見舞）",
            "small": "福利厚生費"
          },
          {
            "account": "福利厚生費（通勤費）",
            "small": "福利厚生費"
          },
          {
            "account": "法定福利費（健康保険）",
            "small": "福利厚生費"
          },
          {
            "account": "法定福利費（厚生年金）",
            "small": "福利厚生費"
          },
          {
            "account": "法定福利費（雇用保険）",
            "small": "福利厚生費"
          },
          {
            "account": "法定福利費（労災保険）",
            "small": "福利厚生費"
          },
          {
            "account": "役員賞与",
            "small": "役員報酬"
          },
          {
            "account": "外注費",
            "small": "外注費"
          },
          {
            "account": "業務委託料",
            "small": "外注費"
          },
          {
            "account": "支払報酬料",
            "small": "外注費"
          },
          {
            "account": "支払手数料",
            "small": "支払手数料"
          },
          {
            "account": "広告宣伝費",
            "small": "広告宣伝費"
          },
          {
            "account": "地代家賃",
            "small": "地代家賃"
          },
          {
            "account": "会議費",
            "small": "会議費"
          },
          {
            "account": "交際費",
            "small": "交際費"
          },
          {
            "account": "接待交際費",
            "small": "交際費"
          },
          {
            "account": "旅費交通費",
            "small": "旅費交通費"
          },
          {
            "account": "交通費",
            "small": "旅費交通費"
          },
          {
            "account": "通信費",
            "small": "通信費"
          },
          {
            "account": "荷造運賃",
            "small": "荷造運賃"
          },
          {
            "account": "水道光熱費",
            "small": "水道光熱費"
          },
          {
            "account": "修繕費",
            "small": "修繕費"
          },
          {
            "account": "消耗品費",
            "small": "消耗品費"
          },
          {
            "account": "事務用品費",
            "small": "消耗品費"
          },
          {
            "account": "新聞図書費",
            "small": "新聞図書費"
          },
          {
            "account": "研究開発費",
            "small": "研究開発費"
          },
          {
            "account": "旅費交通費（国内交通費）",
            "small": "旅費交通費"
          },
          {
            "account": "旅費交通費（海外交通費）",
            "small": "旅費交通費"
          },
          {
            "account": "リース料",
            "small": "リース料"
          },
          {
            "account": "レンタル料",
            "small": "リース料"
          },
          {
            "account": "保守料",
            "small": "保守料"
          },
          {
            "account": "修繕費（建物）",
            "small": "修繕費"
          },
          {
            "account": "修繕費（機械装置）",
            "small": "修繕費"
          },
          {
            "account": "修繕費（車両運搬具）",
            "small": "修繕費"
          },
          {
            "account": "修繕費（工具器具備品）",
            "small": "修繕費"
          },
          {
            "account": "修繕費（建物附属設備）",
            "small": "修繕費"
          },
          {
            "account": "支払保険料",
            "small": "支払保険料"
          },
          {
            "account": "保険料",
            "small": "支払保険料"
          },
          {
            "account": "支払手数料（銀行）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（振込手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（代引手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（クレジットカード）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（Amazon手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（販売手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（広告手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払リース料（車両運搬具）",
            "small": "リース料"
          },
          {
            "account": "支払リース料（器具備品）",
            "small": "リース料"
          },
          {
            "account": "支払リース料（建物）",
            "small": "リース料"
          },
          {
            "account": "支払リース料（機械装置）",
            "small": "リース料"
          },
          {
            "account": "支払リース料（ソフトウェア）",
            "small": "リース料"
          },
          {
            "account": "租税公課",
            "small": "租税公課"
          },
          {
            "account": "固定資産税",
            "small": "租税公課"
          },
          {
            "account": "車両費",
            "small": "車両費"
          },
          {
            "account": "車両費（燃料費）",
            "small": "車両費"
          },
          {
            "account": "車両費（整備費）",
            "small": "車両費"
          },
          {
            "account": "車両費（保険料）",
            "small": "車両費"
          },
          {
            "account": "車両費（その他）",
            "small": "車両費"
          },
          {
            "account": "図書研修費",
            "small": "図書研修費"
          },
          {
            "account": "研修費",
            "small": "図書研修費"
          },
          {
            "account": "人材教育費",
            "small": "図書研修費"
          },
          {
            "account": "人材教育費（社員教育）",
            "small": "図書研修費"
          },
          {
            "account": "人材教育費（セミナー受講）",
            "small": "図書研修費"
          },
          {
            "account": "求人費",
            "small": "求人費"
          },
          {
            "account": "採用広告費",
            "small": "求人費"
          },
          {
            "account": "通信費（電話代）",
            "small": "通信費"
          },
          {
            "account": "通信費（インターネット）",
            "small": "通信費"
          },
          {
            "account": "通信費（モバイル）",
            "small": "通信費"
          },
          {
            "account": "消耗品費（ソフトウェア）",
            "small": "消耗品費"
          },
          {
            "account": "消耗品費（ハードウェア）",
            "small": "消耗品費"
          },
          {
            "account": "消耗品費（備品）",
            "small": "消耗品費"
          },
          {
            "account": "消耗品費（事務用品）",
            "small": "消耗品費"
          },
          {
            "account": "消耗品費（その他）",
            "small": "消耗品費"
          },
          {
            "account": "支払報酬料（税理士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（弁護士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（社労士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（司法書士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（税理士法人）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（税理士事務所）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（社労士事務所）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（弁護士法人）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（行政書士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（公認会計士）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（コンサルティング）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（監査）",
            "small": "外注費"
          },
          {
            "account": "支払報酬料（その他）",
            "small": "外注費"
          },
          {
            "account": "支払手数料（配送手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（決済手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（システム手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（振込代行手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（保険解約手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（特許庁）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（印紙税）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（振替手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（保守管理料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（自動車登録代行費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（車検代行費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（車庫証明）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（講習会費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（登録免許税）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（雇用保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（労災保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（健康保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（厚生年金保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（中小企業退職金共済掛金）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（社会保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（ボランティア保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（雇用調整助成金申請）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（助成金申請）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（融資事務手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（年会費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（パスポート）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（更新手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（公証役場）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（不動産取得税）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（固定資産税）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（利息）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（損害保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（火災保険）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（賃貸保証料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（災害保険料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（支払保証料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（損害賠償金）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（保険金）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（訴訟費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（仲裁費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（翻訳費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（出願費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（登録費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（維持費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（見積書）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（配車手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（相談料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他・雑費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（事務手数料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（更新料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（出店料）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（保守費用）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（共済会費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（連合会費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（総会費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（出張旅費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（宿泊費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（接待費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（会議費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（交際費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（寄付金）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（寄付金）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（雑費）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          },
          {
            "account": "支払手数料（その他）",
            "small": "支払手数料"
          }
        ]
      },
      {
        "middle": "その他",
        "items": [
          {
            "account": "諸会費",
            "small": "諸会費"
          },
          {
            "account": "損害保険料",
            "small": "損害保険料"
          },
          {
            "account": "業務災害補償費",
            "small": "業務災害補償費"
          },
          {
            "account": "新聞図書費（新聞購読）",
            "small": "新聞図書費"
          },
          {
            "account": "新聞図書費（雑誌購読）",
            "small": "新聞図書費"
          }
        ]
      }
    ]
  }
]
