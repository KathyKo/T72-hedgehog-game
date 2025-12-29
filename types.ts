
export enum GameStage {
  START = 'START',
  INTRO = 'INTRO',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4',
  SUMMARY = 'SUMMARY',
  INTER_LEVEL = 'INTER_LEVEL',
  TRANSITION = 'TRANSITION',
  VICTORY = 'VICTORY'
}

export interface Inventory {
  blueCrystal: boolean;
  goldenRope: boolean;
  shinyShield: boolean;
  certificate: boolean;
}

export interface QuizLevelData {
  id: GameStage;
  context: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  rewardItem: keyof Inventory;
  rewardName: string;
  nextStage: GameStage;
}
