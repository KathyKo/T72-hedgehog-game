import React, { useState, useEffect, useRef } from 'react';
import { GameStage, Inventory } from './types';
import { LEVELS, ASSETS } from './constants';

const STORY_SCRIPT = [
  { text: "糟糕！睡眠星球的防護層正在崩壞！\n邪惡的「起毛球軍團」入侵了我們的纖維世界！", image: ASSETS.hedgehogWorried, speaker: "Cici" },
  { text: "如果不趕快阻止它們，布料就會變得粗糙刺癢，\n再也沒辦法睡個好覺了...", image: ASSETS.hedgehogWorried, speaker: "Cici" },
  { text: "別擔心！只要啟動「天絲Plus+ 防護系統」，\n就能找回強韌光滑的纖維！", image: ASSETS.hedgehogGo, speaker: "Cici" },
  { text: "我是守護者 Cici！必須前往不同世界，\n收集失落的寶物，才能修復防護罩！", image: ASSETS.hedgehogGo, speaker: "Cici" },
  { text: "第一站是充滿水分子的深水區域...\n準備好了嗎？戰鬥開始！", image: ASSETS.hedgehogBattle, speaker: "Cici" }
];

const App: React.FC = () => {
  // 自動判斷路徑 (GitHub Pages vs Local)
  const BASE_PATH = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // 防止連點鎖

  const [stage, setStage] = useState<GameStage>(GameStage.START);
  const [pendingStage, setPendingStage] = useState<GameStage | null>(null);
  const [isFail, setIsFail] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);

  const [inventory, setInventory] = useState<Inventory>({
    blueCrystal: false, goldenRope: false, shinyShield: false, certificate: false,
  });

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const currentLevelIndex = LEVELS.findIndex(l => l.id === stage);
  const currentLevel = LEVELS[currentLevelIndex];

  // 1. 圖片預加載邏輯
  useEffect(() => {
    const imagesToLoad = Object.values(ASSETS);
    let loadedCount = 0;
    const loadImage = (src: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src);
      });
    };
    Promise.all(imagesToLoad.map(src => {
      return loadImage(src).then(() => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / imagesToLoad.length) * 100));
      });
    })).then(() => setIsLoading(false));
  }, []);

  // 2. 音效系統
  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'click' | 'boss-defeat') => {
    if (!isAudioInitialized) return;
    let audioPath = '';
    switch (type) {
      case 'correct': audioPath = `${BASE_PATH}/sounds/correct.mp3`; break;
      case 'wrong': audioPath = `${BASE_PATH}/sounds/wrong.mp3`; break;
      case 'victory': audioPath = `${BASE_PATH}/sounds/victory.mp3`; break;
      case 'click': audioPath = `${BASE_PATH}/sounds/blip.mp3`; break;
      case 'boss-defeat': audioPath = `${BASE_PATH}/sounds/boss-defeat.mp3`; break;
      default: return;
    }
    const audio = new Audio(audioPath);
    audio.volume = type === 'click' ? 0.4 : 0.6;
    audio.play().catch(e => console.log("SFX play failed", e));
  };

  const initAudio = () => {
    if (isAudioInitialized) return;
    setIsAudioInitialized(true);
    if (!bgmRef.current) {
      bgmRef.current = new Audio(`${BASE_PATH}/sounds/bgm-start.mp3`);
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }
    bgmRef.current.play().catch(e => console.error("Audio unlock failed:", e));
  };

  // 3. BGM 控制
  useEffect(() => {
    if (!isAudioInitialized || !bgmRef.current) return;
    let targetBgm = `${BASE_PATH}/sounds/bgm-start.mp3`;

    if ([GameStage.INTER_LEVEL].includes(stage)) targetBgm = `${BASE_PATH}/sounds/bgm-transition.mp3`;
    else if ([GameStage.LEVEL_1].includes(stage)) targetBgm = `${BASE_PATH}/sounds/bgm-level1.mp3`;
    else if ([GameStage.LEVEL_2].includes(stage)) targetBgm = `${BASE_PATH}/sounds/bgm-level2.mp3`;
    else if ([GameStage.LEVEL_3].includes(stage)) targetBgm = `${BASE_PATH}/sounds/bgm-level3.mp3`;
    else if ([GameStage.LEVEL_4].includes(stage)) targetBgm = `${BASE_PATH}/sounds/bgm-level4.mp3`;
    else if ([GameStage.SUMMARY, GameStage.VICTORY].includes(stage)) targetBgm = `${BASE_PATH}/sounds/wins.mp3`;
    else if (stage === GameStage.ENDING) targetBgm = '';

    const currentSrc = bgmRef.current.src || '';
    if (targetBgm && !currentSrc.includes(targetBgm)) {
      bgmRef.current.src = targetBgm;
      bgmRef.current.play().catch(() => { });
    } else if (!targetBgm) {
      bgmRef.current.pause();
    }
  }, [stage, isAudioInitialized]);

  // 4. 遊戲核心操作 (加入 e.preventDefault 防止 iPad 連點)
  const handleStart = () => { setStage(GameStage.INTRO); setStoryIndex(0); };

  const handleNextStory = () => {
    playSound('click');
    if (storyIndex < STORY_SCRIPT.length - 1) setStoryIndex(prev => prev + 1);
    else setStage(GameStage.LEVEL_1);
  };

  const handleCorrect = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isProcessing) return;
    setIsProcessing(true);

    if (!currentLevel) return;
    if (stage === GameStage.LEVEL_4) {
      playSound('boss-defeat');
    } else {
      playSound('correct');
      setTimeout(() => playSound('victory'), 300);
    }
    setShowReward(true);
    // 0.5秒後解鎖
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleWrong = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isProcessing) return;
    playSound('wrong');
    setIsFail(true);
  };

  const retryLevel = () => setIsFail(false);

  const handleRewardContinue = () => {
    if (!currentLevel) return;
    setInventory(prev => ({ ...prev, [currentLevel.rewardItem]: true }));
    setShowReward(false);

    if (currentLevel.nextStage === GameStage.SUMMARY) {
      setStage(GameStage.SUMMARY);
    } else {
      setPendingStage(currentLevel.nextStage);
      setStage(GameStage.INTER_LEVEL);
    }
  };

  const resetGame = () => {
    setStage(GameStage.START);
    setInventory({ blueCrystal: false, goldenRope: false, shinyShield: false, certificate: false });
    setIsFail(false);
    setShowReward(false);
    setIsVideoEnded(false);
    setTimeLeft(40);
    setIsProcessing(false);
  };

  const handleSummaryNext = () => { playSound('click'); setStage(GameStage.ENDING); };
  const handleVideoEnded = () => { setStage(GameStage.VICTORY); };

  useEffect(() => { if (stage === GameStage.INTER_LEVEL && pendingStage) { const timer = setTimeout(() => { setStage(pendingStage); setPendingStage(null); }, 3000); return () => clearTimeout(timer); } }, [stage, pendingStage]);

  // 5. 倒數計時邏輯 (監聽 timeLeft=0 觸發重置，解決黑屏)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === GameStage.VICTORY) {
      setTimeLeft(40); // 進入時重置
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === GameStage.VICTORY && timeLeft === 0) {
      resetGame();
    }
  }, [timeLeft, stage]);

  const getBackgroundImage = () => {
    if (stage === GameStage.LEVEL_1) return `url('${ASSETS.level1Bg}')`;
    if (stage === GameStage.LEVEL_2) return `url('${ASSETS.level2Bg}')`;
    if (stage === GameStage.LEVEL_3) return `url('${ASSETS.level3Bg}')`;
    if (stage === GameStage.LEVEL_4) return `url('${ASSETS.level4Bg}')`;
    return 'none';
  };

  const getBackgroundColor = () => {
    if (stage === GameStage.LEVEL_1) return 'transparent';
    if (stage === GameStage.LEVEL_2) return '#d97706';
    if (stage === GameStage.LEVEL_3) return '#4c1d95';
    if (stage === GameStage.LEVEL_4) return '#020617';
    return '#060b28';
  };

  // --- Loading 畫面 ---
  if (isLoading) {
    return (
      <div className="w-screen h-[100dvh] bg-[#060b28] flex flex-col items-center justify-center text-white">
        <div className="animate-spin text-6xl mb-4">🦔</div>
        <div className="text-2xl font-bold mb-2">Loading Resources...</div>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-400">{loadingProgress}%</p>
      </div>
    );
  }

  // --- 主程式 ---
  return (
    // 👇 h-[100dvh] 是解決 iPad 網址列遮擋的關鍵
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-[#060b28] select-none font-sans">
      {!isAudioInitialized && (<div onClick={initAudio} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"><div className="animate-bounce mb-4 text-6xl">👆</div><h1 className="text-4xl text-white font-black font-['Chiron_GoRound_TC'] drop-shadow-lg mb-2">點擊畫面開啟音效</h1></div>)}

      {/* START */}
      {stage === GameStage.START && (<div className="w-full h-full relative bg-cover bg-center bg-no-repeat animate-fade-in" style={{ backgroundImage: `url('${ASSETS.startBg}')` }}><div className="star-layer">{[...Array(50)].map((_, i) => (<div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, animationDelay: `${Math.random() * 3}s` }} />))}</div><div className="hedgehog-aura absolute pointer-events-none" style={{ left: '14%', top: '35%', width: '38%', aspectRatio: '1/1' }}></div><div className="monster-aura absolute pointer-events-none" style={{ right: '5%', top: '5%', width: '45%', aspectRatio: '1/1' }}></div><div className="absolute bottom-[10%] left-0 w-full flex justify-center z-50"><button onClick={handleStart} className="hotspot-btn w-[260px] h-[60px] md:w-[550px] md:h-[130px] rounded-full transition-colors" title="點擊開始遊戲"></button></div></div>)}

      {/* INTRO */}
      {stage === GameStage.INTRO && (
        <div className="w-full h-full relative flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={handleNextStory}>
          {/* 👇 確保背景圖層級正確 */}
          <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.introBg}')` }}></div>
          <div className="absolute inset-0 -z-10 bg-black/40"></div>

          <div className="absolute bottom-[20%] md:bottom-40 z-10 animate-float"><img src={STORY_SCRIPT[storyIndex].image} alt="Speaker" className="w-48 md:w-96 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" /></div>
          <div className="w-full max-w-4xl mb-12 md:mb-20 mx-4 z-20 cursor-pointer group">
            <div className="bg-white/95 rounded-[2rem] border-8 border-blue-500 p-6 md:p-8 shadow-2xl relative min-h-[140px] md:min-h-[180px] flex flex-col justify-center">
              <div className="absolute -top-6 left-10 bg-yellow-400 text-blue-900 font-black px-6 py-2 rounded-full border-4 border-white shadow-md text-lg md:text-xl">{STORY_SCRIPT[storyIndex].speaker}</div>
              <p className="text-xl md:text-3xl font-bold text-gray-800 leading-relaxed whitespace-pre-line">{STORY_SCRIPT[storyIndex].text}</p>
              <div className="absolute bottom-4 right-6 text-blue-500 animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div>
            </div>
            <p className="text-center text-white/50 mt-4 text-lg font-bold tracking-widest">點擊繼續...</p>
          </div>
        </div>
      )}

      {/* INTER_LEVEL */}
      {stage === GameStage.INTER_LEVEL && (<div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden"><div className="absolute inset-0 opacity-20">{[...Array(20)].map((_, i) => (<div key={i} className="absolute h-1 bg-blue-400 w-full animate-slide-left" style={{ top: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>))}</div><div className="relative z-10 animate-bounce"><img src={ASSETS.hedgehogGo} alt="Running" className="w-48 h-48 object-contain" /></div><h2 className="text-white text-4xl font-black mt-8 animate-pulse tracking-widest font-['Chiron_GoRound_TC']">前往下一世界...</h2></div>)}

      {/* GAME LEVEL 1-4 */}
      {currentLevel && (
        <div className="w-full h-full relative overflow-hidden mario-transition" style={{ backgroundImage: getBackgroundImage(), backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: getBackgroundColor() }}>
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* 刺蝟位置：bottom-25% */}
            {stage !== GameStage.LEVEL_4 && (<div className="absolute bottom-[25%] left-[5%] w-[38%] hero-float-animation"><img src={ASSETS.hedgehogBattle} alt="Hero" className="w-full object-contain drop-shadow-2xl" /></div>)}

            {/* Level 2 摩擦怪上移 (bottom-18%) */}
            {stage === GameStage.LEVEL_1 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'pointer-events-none' : ''}`}><div className={`absolute top-[10%] right-[3%] w-[35%] enemy-float delay-1 ${showReward ? 'monster-die' : ''}`}><img src={`${BASE_PATH}/water-monster.png`} alt="Enemy" className="w-full object-contain opacity-90 drop-shadow-lg" /></div><div className={`absolute top-[20%] right-[35%] w-[20%] enemy-float delay-2 ${showReward ? 'monster-die' : ''}`}><img src={`${BASE_PATH}/water-monster.png`} alt="Enemy" className="w-full object-contain opacity-80" /></div><div className={`absolute top-[10%] right-[30%] w-[8%] enemy-float delay-3 ${showReward ? 'monster-die' : ''}`}><img src={`${BASE_PATH}/water-monster.png`} alt="Enemy" className="w-full object-contain opacity-70" /></div><div className={`absolute bottom-[15%] right-[3%] w-[8%] enemy-float delay-4 ${showReward ? 'monster-die' : ''}`}><img src={`${BASE_PATH}/water-monster.png`} alt="Enemy" className="w-full object-contain opacity-60" /></div><div className={`absolute top-[5%] right-[50%] w-[5%] enemy-float delay-5 ${showReward ? 'monster-die' : ''}`}><img src={`${BASE_PATH}/water-monster.png`} alt="Enemy" className="w-full object-contain opacity-50" /></div></div>)}
            {stage === GameStage.LEVEL_2 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'pointer-events-none' : ''}`}><div className={`absolute bottom-[18%] right-[1%] w-[45%] enemy-grind delay-1 ${showReward ? 'monster-sink' : ''}`}><img src={`${BASE_PATH}/sandpaper-monster.png`} alt="Sandpaper" className="w-full object-contain drop-shadow-xl" /></div><div className={`absolute bottom-[30%] right-[40%] w-[25%] enemy-grind delay-2 ${showReward ? 'monster-sink' : ''}`} style={{ animationDuration: '0.15s' }}><img src={`${BASE_PATH}/sandpaper-monster.png`} alt="Sandpaper" className="w-full object-contain" /></div><div className={`absolute bottom-[5%] right-[45%] w-[18%] enemy-grind delay-3 ${showReward ? 'monster-sink' : ''}`} style={{ animationDuration: '0.25s' }}><img src={`${BASE_PATH}/sandpaper-monster.png`} alt="Sandpaper" className="w-full object-contain blur-[1px]" /></div><div className={`absolute top-[40%] right-[3%] w-[15%] enemy-grind delay-4 ${showReward ? 'monster-sink' : ''}`}><img src={`${BASE_PATH}/sandpaper-monster.png`} alt="Sandpaper" className="w-full object-contain opacity-80 blur-[2px]" /></div></div>)}
            {stage === GameStage.LEVEL_3 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'pointer-events-none' : ''}`}><div className={`absolute top-[10%] right-[15%] w-[35%] enemy-aggressive delay-1 ${showReward ? 'monster-implode' : ''}`}><img src={`${BASE_PATH}/glitch-monster.png`} alt="Glitch" className="w-full object-contain drop-shadow-2xl" /></div><div className={`absolute bottom-[40%] right-[50%] w-[15%] enemy-aggressive delay-2 ${showReward ? 'monster-implode' : ''}`} style={{ animationDuration: '0.1s' }}><img src={`${BASE_PATH}/glitch-monster.png`} alt="Glitch" className="w-full object-contain" /></div><div className={`absolute top-[10%] right-[45%] w-[12%] enemy-aggressive delay-3 ${showReward ? 'monster-implode' : ''}`} style={{ animationDuration: '0.12s' }}><img src={`${BASE_PATH}/glitch-monster.png`} alt="Glitch" className="w-full object-contain blur-[1px]" /></div><div className={`absolute bottom-[5%] right-[5%] w-[20%] enemy-aggressive delay-4 ${showReward ? 'monster-implode' : ''}`} style={{ animationDuration: '0.18s' }}><img src={`${BASE_PATH}/glitch-monster.png`} alt="Glitch" className="w-full object-contain opacity-80" /></div></div>)}

            {stage === GameStage.LEVEL_4 && (
              <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${showReward ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70 pointer-events-none mix-blend-screen"><svg className="w-[180%] h-[180%]" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><g className="vortex-spin-cw"><circle cx="250" cy="250" r="100" fill="none" stroke="white" strokeWidth="2" strokeDasharray="30 20" opacity="0.6" /><circle cx="250" cy="250" r="180" fill="none" stroke="white" strokeWidth="1" strokeDasharray="50 50" opacity="0.4" /></g><g className="vortex-spin-ccw"><circle cx="250" cy="250" r="140" fill="none" stroke="white" strokeWidth="3" strokeDasharray="20 40" opacity="0.8" /><circle cx="250" cy="250" r="220" fill="none" stroke="white" strokeWidth="1" strokeDasharray="10 30" opacity="0.3" /></g></svg></div>
                <div className={`absolute top-[5%] left-[40%] w-[80%] md:w-[74%] z-10 boss-idle ${showReward ? 'boss-die' : ''}`}><img src={ASSETS.finalBoss} alt="Final Boss" className="w-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]" /></div>
                <div className="absolute bottom-[25%] left-[5%] w-[38%] z-20 hero-float-animation"><img src={ASSETS.hedgehogBattle} alt="Hero" className="w-full object-contain drop-shadow-2xl" /></div>
              </div>
            )}
          </div>

          {!showReward && (
            <div className="relative z-30 w-full h-full flex flex-col items-center justify-end pb-8 md:pb-12">
              <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-[6px] border-blue-200 max-w-4xl w-[90%] md:w-[80%] animate-pop-in">
                <div className="flex items-center gap-4 mb-4 md:mb-6"><span className="bg-yellow-400 text-blue-900 px-4 py-1 md:px-6 md:py-2 rounded-full font-black text-lg md:text-xl shadow-md border-2 border-white whitespace-nowrap">LEVEL {currentLevelIndex + 1}</span><span className="text-blue-900 font-bold text-xl md:text-2xl truncate">{currentLevel.context}</span></div>
                <h2 className="text-2xl md:text-4xl text-gray-800 font-black mb-6 md:mb-10 leading-snug">{currentLevel.question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">{currentLevel.options.map((opt, idx) => (
                  <button key={idx} onClick={(e) => opt.isCorrect ? handleCorrect(e) : handleWrong(e)} className="group relative bg-blue-50 hover:bg-yellow-50 border-4 border-blue-100 hover:border-yellow-400 p-4 md:p-6 rounded-[1.5rem] transition-all duration-200 text-left shadow-md hover:shadow-lg active:scale-95">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-500 text-white rounded-full flex shrink-0 items-center justify-center font-black text-lg border-2 border-white shadow">{idx === 0 ? 'A' : 'B'}</div><span className="text-lg md:text-2xl font-black text-gray-700 group-hover:text-gray-900">{opt.text}</span></div>
                  </button>
                ))}</div>
              </div>
            </div>
          )}
          {showReward && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="item-get-modal bg-gradient-to-b from-yellow-100 to-white p-12 rounded-[3rem] border-8 border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.6)] text-center relative max-w-2xl w-[90%] mx-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-xl ray-bg -z-10"></div>
                <h2 className="text-4xl md:text-5xl font-black text-yellow-600 mb-2 font-['ZCOOL_KuaiLe']">{stage === GameStage.LEVEL_4 ? "最終試煉通過！" : "怪物擊破！"}</h2>
                <p className="text-xl md:text-2xl text-gray-500 font-bold mb-8">{stage === GameStage.LEVEL_4 ? "成功守護了睡眠星球！" : "成功守護了布料結構"}</p>
                <div className="w-48 h-48 mx-auto mb-8 relative animate-bounce-slow"><div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50"></div><img src={ASSETS[currentLevel.rewardItem]} alt="Reward" className="w-full h-full object-contain relative z-10" /></div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-8"><p className="text-blue-500 font-black text-xl mb-1">獲得道具</p><p className="text-3xl font-black text-gray-800">{currentLevel.rewardName}</p></div>
                <button onClick={handleRewardContinue} className="w-full py-6 text-4xl font-black text-white bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-4 border-white shadow-[0_8px_0_#1e40af] active:translate-y-2 active:shadow-none transition-all">{stage === GameStage.LEVEL_4 ? "成功抵擋毛球 ➔" : "繼續冒險 ➔"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY (刺蝟放大 w-72) */}
      {stage === GameStage.SUMMARY && (
        <div className="w-full h-full relative flex flex-col items-center justify-center bg-cover bg-center animate-fade-in" style={{ backgroundImage: `url('${ASSETS.summaryBg}')` }}>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"></div>
          <div className="relative z-10 flex flex-col items-center max-w-5xl w-full p-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-50 rounded-full animate-pulse"></div>
              <img src={ASSETS.hedgehogEnd} alt="Cici Sleeping" className="w-72 md:w-96 relative z-10 hero-float-animation" />
            </div>
            <div className="bg-white/95 rounded-[3rem] border-8 border-yellow-400 p-10 md:p-12 shadow-2xl text-center relative w-full">
              <h2 className="text-3xl md:text-5xl font-black text-blue-900 mb-6 font-['ZCOOL_KuaiLe']">天絲 Plus+ 的秘密</h2>
              <p className="text-xl md:text-2xl text-gray-700 font-bold leading-relaxed mb-8 text-left md:text-center px-4">使用 Micro LF 級天絲纖維，透過特殊工藝處理，<br className="hidden md:block" />有效降低原纖化現象，即使多次洗滌也能<br className="hidden md:block" /><span className="text-yellow-600 font-black text-3xl">防止起毛球</span>，維持光澤與柔軟觸感！</p>
              <button onClick={handleSummaryNext} className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-16 py-5 rounded-full text-3xl font-black shadow-lg hover:scale-105 transition-transform active:scale-95">下一頁 ➔</button>
            </div>
          </div>
        </div>
      )}

      {/* ENDING */}
      {stage === GameStage.ENDING && (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <video src={`${BASE_PATH}/ending.mp4`} autoPlay playsInline onEnded={handleVideoEnded} className="w-full h-full object-contain md:object-cover" />
        </div>
      )}

      {/* VICTORY (底部橫條版) */}
      {stage === GameStage.VICTORY && (
        <div className="relative w-full h-full bg-cover bg-[center_top]" style={{ backgroundImage: `url('${ASSETS.endBg}')` }}>
          {/* 優惠券對話框：寬度可調 (max-w-2xl) */}
          <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t-8 border-yellow-400 p-4 pb-8 flex flex-col items-center z-50">
            <div className="w-full max-w-2xl flex flex-col gap-4">
              <div className="text-center">
                <p className="text-lg font-black text-gray-800">請拍攝此畫面，購買 <span className="text-blue-600">天絲PLUS雲柔被1件</span></p>
                <p className="text-2xl text-red-500 font-black animate-pulse my-1">加贈 "限量版小童枕1個"</p>
                <p className="text-xs text-gray-500">(限時優惠，請把握機會！)</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
                <span className="font-bold text-gray-600">畫面將在 {timeLeft} 秒後關閉</span>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow">前往購買</button>
                  <button onClick={resetGame} className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg font-bold">回到首頁</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFail && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"><div className="bg-white rounded-[3rem] p-10 text-center border-b-[16px] border-red-100 shadow-2xl"><img src={ASSETS.hedgehogCry} alt="Sad" className="w-48 h-48 mx-auto mb-8 object-contain" /><h3 className="text-5xl font-black text-gray-900 mb-6">防禦失敗！</h3><button onClick={retryLevel} className="w-full py-6 text-4xl font-black text-white bg-red-500 rounded-full shadow-lg hover:bg-red-600">重新挑戰</button></div></div>)}
    </div>
  );
};

export default App;