import { GameStage, QuizLevelData } from './types';

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
    rewardName: '閃耀結構盾 (1/2斜紋)',
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
  // 道具 Icons
  blueCrystal: '/blue-crystal-icon.png',
  goldenRope: '/golden-rope.png',
  shinyShield: '/shiny-shield.png',
  certificate: '/everlasting-cape.png',

  // 背景圖 
  startBg: '/start-bg.png',
  introBg: '/intro-bg.png',
  summaryBg: '/summary-bg.jpg',
  level1Bg: '/level1-bg.png',
  level2Bg: '/level2-bg.png',
  level3Bg: '/level3-bg.png',
  level4Bg: '/level4-bg.png',
  endBg: '/end.png',

  // 角色
  hedgehogHappy: '/hedgehog-happy.png',
  hedgehogCry: '/hedgehog-sad.png',
  hedgehogWorried: '/hedgehog-worried.png',
  hedgehogGo: '/hedgehog-go.png',
  hedgehogBattle: '/hedgehog-battle.png',
  hedgehogEnd: '/hedgehog-end.png',

  // 敵人與其他
  monster: '/water-monster.png',
  finalBoss: '/final-boss.png',
  cloud: '/cloud.png',
};