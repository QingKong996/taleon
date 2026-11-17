export const WORKBENCH_STEPS = [
  { step: 0, label: '故事想法' },
  { step: 1, label: '故事大纲' },
  { step: 2, label: '章节内容' },
] as const;

export type WorkbenchStep = (typeof WORKBENCH_STEPS)[number]['step'];

export type ChapterSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

export type OutlineChapter = {
  id: string;
  title: string;
  beat: string;
  paragraphs: readonly string[];
  sections?: readonly ChapterSection[];
};

export const DEFAULT_CHAPTER_COUNT = 12;
export const DEFAULT_WORDS_PER_CHAPTER = 2000;
export const MIN_CHAPTER_COUNT = 1;
export const MAX_CHAPTER_COUNT = 100;
export const MIN_WORDS_PER_CHAPTER = 500;
export const MAX_WORDS_PER_CHAPTER = 20000;

export const OUTLINE_CHAPTERS: readonly OutlineChapter[] = [
  {
    id: 'letter',
    title: '雾里的来信',
    beat: '开端',
    paragraphs: [
      '雾是在凌晨四点漫进港口的。它越过防波堤，漫过石阶，最后停在修灯铺的窗沿下，像一群没有脚步声的访客。沈砚推开木门时，整条街只剩下潮湿的灯影。',
      '海崖上的灯塔已经熄了三个小时。自父亲失踪后，这是它第一次在夜里失去光亮。港务局说是线路故障，可沈砚知道，那盏灯用的不是电，而是一种连他也说不清的旧式燃料。',
      '信就放在柜台上。信封没有邮戳，纸却干燥得反常。沈砚拆开它，看见一行熟悉的字：“三天后，不要让那艘船进港。”落款处没有名字。但他认得父亲笔画末尾的习惯——每一竖，都会向左边轻轻一挑。',
    ],
  },
  {
    id: 'archive',
    title: '不存在的航线',
    beat: '发展',
    paragraphs: [
      '港务档案馆在地下二层，空气里长期漂着盐和旧纸的味道。沈砚借着手机微光，在废弃航线图上找到父亲的名字。那是一艘没有船名的货轮，抵达时间被红笔圈住：三天后，凌晨四点十七分。',
      '值班表上同样留着他的签名。可十年前的那一夜，父亲应该独自守在灯塔上。沈砚把两张纸并排放好，突然听见身后的铁门合拢。',
      '门外传来脚步声，很慢，停在他与出口之间。有人低声问：“你也收到信了？”',
    ],
  },
  {
    id: 'lighthouse',
    title: '灯塔之下',
    beat: '转折',
    paragraphs: [
      '地窖的尽头亮着一盏煤油灯。灯下堆着父亲留下的航海日志，最后一页停在十年前的风暴夜：“四点十七分，我关了灯。船上的人不该靠岸。”',
      '沈砚往后翻，纸页却是空的。夹层里掉出一张泛黄的报纸，头版写着“雾港沉船事故，三十七人遇难”。报道的角落里，父亲的照片被红笔圈了两次。',
      '他终于明白，那不是一场意外。有人利用灯塔的黑暗把船引向礁石，而父亲选择了沉默十年。',
    ],
  },
  {
    id: 'last-light',
    title: '最后一束光',
    beat: '结局',
    paragraphs: [
      '风暴在午夜前抵达。沈砚站在灯塔顶层，脚下是整座雾港。远处那艘没有船名的货轮正穿过防波堤，甲板上没有灯，只有一个模糊的人影抬头望着他。',
      '父亲的信在口袋里发烫。点亮灯塔，船会看见暗礁；熄灭它，沉船将再次发生。沈砚把手放在生锈的闸柄上，听见十年前的风声从金属里醒来。',
      '四点十七分，一束光切开浓雾。海面上，货轮缓缓转向。沈砚知道，天亮之后，雾港积压了十年的秘密将和他一起暴露在日光下。但至少这一次，没有人会沉进黑夜里。',
    ],
  },
];
