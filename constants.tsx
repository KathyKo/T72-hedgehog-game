import { GameStage, QuizLevelData } from './types';

const BASE_PATH = import.meta.env.MODE === 'production'
  ? '/T72-hedgehog-game'
  : '';

export const LEVELS: QuizLevelData[] = [
  {
    id: GameStage.LEVEL_1,
    context: "糟糕！水分子軍團發動膨脹攻擊，布料即將失守！",
    question: "為了抵擋水分子的膨脹攻擊，該選哪種原料？",
    options: [
      { text: "一般 G100 天絲", isCorrect: false },
      { text: "Micro LF 天絲", isCorrect: true }
    ],
    rewardItem: 'blueCrystal',
    rewardName: '能量藍晶石 (Micro LF)',
    nextStage: GameStage.LEVEL_2
  },
  {
    id: GameStage.LEVEL_2,
    context: "前方發現摩擦黑洞！紗線開始鬆散滑脫了！",
    question: "為了不讓紗線鬆散滑脫，該怎麼辦？",
    options: [
      { text: "低撚度 ", isCorrect: false },
      { text: "強化撚度工藝 ", isCorrect: true }
    ],
    rewardItem: 'goldenRope',
    rewardName: '黃金緊固繩 (強化撚度)',
    nextStage: GameStage.LEVEL_3
  },
  {
    id: GameStage.LEVEL_3,
    context: "變形怪獸現身！布料結構正在崩壞！",
    question: "需要更強的結構支撐，該用哪種織法？",
    options: [
      { text: "1/4 斜紋 ", isCorrect: false },
      { text: "1/2 斜紋 + 增加交織點", isCorrect: true }
    ],
    rewardItem: 'shinyShield',
    rewardName: '閃耀結構盾 (交織點)',
    nextStage: GameStage.LEVEL_4
  },
  {
    id: GameStage.LEVEL_4,
    context: "終極 BOSS：地獄洗衣機降臨！",
    question: "真正的強者不怕考驗，我們要進行什麼測試？",
    options: [
      { text: "只看新品柔軟的樣子", isCorrect: false },
      { text: "洗衣機與摩擦實測", isCorrect: true }
    ],
    rewardItem: 'certificate',
    rewardName: '永恆光輝披風 (經久耐用)',
    nextStage: GameStage.SUMMARY
  }
];

export const ASSETS = {
  blueCrystal: `${BASE_PATH}/blue-crystal-icon.png`,
  goldenRope: `${BASE_PATH}/golden-rope.png`,
  shinyShield: `${BASE_PATH}/shiny-shield.png`,
  certificate: `${BASE_PATH}/everlasting-cape.png`,

  startBg: `${BASE_PATH}/start-bg.png`,
  introBg: `${BASE_PATH}/intro-bg.png`,
  summaryBg: `${BASE_PATH}/summary-bg.jpg`,
  level1Bg: `${BASE_PATH}/level1-bg.png`,
  level2Bg: `${BASE_PATH}/level2-bg.png`,
  level3Bg: `${BASE_PATH}/level3-bg.png`,
  level4Bg: `${BASE_PATH}/level4-bg.png`,
  endBg: `${BASE_PATH}/end.png`,

  hedgehogHappy: `${BASE_PATH}/hedgehog-happy.png`,
  hedgehogCry: `${BASE_PATH}/hedgehog-sad.png`,
  hedgehogWorried: `${BASE_PATH}/hedgehog-worried.png`,
  hedgehogGo: `${BASE_PATH}/hedgehog-go.png`,
  hedgehogBattle: `${BASE_PATH}/hedgehog-battle.png`,
  hedgehogEnd: `${BASE_PATH}/hedgehog-end.png`,

  monster: `${BASE_PATH}/water-monster.png`,
  finalBoss: `${BASE_PATH}/final-boss.png`,
  cloud: `${BASE_PATH}/cloud.png`,
};