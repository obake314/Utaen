export interface Tanka {
  id: number;
  kami: string; // 上の句 (5-7-5)
  shimo: string; // 下の句 (7-7)
  author: string;
  era: string;
  theme: string;
}

export const tankaList: Tanka[] = [
  {
    id: 1,
    kami: "花の色は\n移りにけりな\nいたづらに",
    shimo: "わが身世にふる\nながめせしまに",
    author: "小野小町",
    era: "平安時代",
    theme: "恋",
  },
  {
    id: 2,
    kami: "秋の田の\nかりほの庵の\n苫をあらみ",
    shimo: "わが衣手は\n露にぬれつつ",
    author: "天智天皇",
    era: "飛鳥時代",
    theme: "秋",
  },
  {
    id: 3,
    kami: "春すぎて\n夏来にけらし\n白妙の",
    shimo: "衣ほすてふ\n天の香具山",
    author: "持統天皇",
    era: "飛鳥時代",
    theme: "夏",
  },
  {
    id: 4,
    kami: "田子の浦に\nうち出でてみれば\n白妙の",
    shimo: "富士の高嶺に\n雪は降りつつ",
    author: "山部赤人",
    era: "奈良時代",
    theme: "冬",
  },
  {
    id: 5,
    kami: "奥山に\n紅葉踏み分け\n鳴く鹿の",
    shimo: "声聞く時ぞ\n秋は悲しき",
    author: "猿丸大夫",
    era: "平安時代",
    theme: "秋",
  },
  {
    id: 6,
    kami: "かささぎの\n渡せる橋に\nおく霜の",
    shimo: "白きを見れば\n夜ぞ更けにける",
    author: "大伴家持",
    era: "奈良時代",
    theme: "冬",
  },
  {
    id: 7,
    kami: "天の原\nふりさけ見れば\n春日なる",
    shimo: "三笠の山に\n出でし月かも",
    author: "安倍仲麿",
    era: "奈良時代",
    theme: "望郷",
  },
  {
    id: 8,
    kami: "わが庵は\n都のたつみ\nしかぞ住む",
    shimo: "世をうぢ山と\n人はいふなり",
    author: "喜撰法師",
    era: "平安時代",
    theme: "隠遁",
  },
  {
    id: 9,
    kami: "瀬をはやみ\n岩にせかるる\n滝川の",
    shimo: "われても末に\nあはむとぞ思ふ",
    author: "崇徳院",
    era: "平安時代",
    theme: "恋",
  },
  {
    id: 10,
    kami: "ちはやぶる\n神代もきかず\n竜田川",
    shimo: "からくれなゐに\n水くくるとは",
    author: "在原業平",
    era: "平安時代",
    theme: "秋",
  },
  {
    id: 11,
    kami: "これやこの\n行くも帰るも\n別れては",
    shimo: "知るも知らぬも\n逢坂の関",
    author: "蝉丸",
    era: "平安時代",
    theme: "人生",
  },
  {
    id: 12,
    kami: "嘆けとて\n月やはものを\n思はする",
    shimo: "かこち顔なる\nわが涙かな",
    author: "西行法師",
    era: "平安時代",
    theme: "恋",
  },
];
