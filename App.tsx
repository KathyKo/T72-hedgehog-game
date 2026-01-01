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
  const BASE_PATH = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // 資源預載
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

  // 音效系統
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

  useEffect(() => {
    if (!isAudioInitialized) return;
    let targetBgm = '';
    switch (stage) {
      case GameStage.START:
      case GameStage.INTRO: targetBgm = `${BASE_PATH}/sounds/bgm-start.mp3`; break;
      case GameStage.INTER_LEVEL: targetBgm = `${BASE_PATH}/sounds/bgm-transition.mp3`; break;
      case GameStage.LEVEL_1: targetBgm = `${BASE_PATH}/sounds/bgm-level1.mp3`; break;
      case GameStage.LEVEL_2: targetBgm = `${BASE_PATH}/sounds/bgm-level2.mp3`; break;
      case GameStage.LEVEL_3: targetBgm = `${BASE_PATH}/sounds/bgm-level3.mp3`; break;
      case GameStage.LEVEL_4: targetBgm = `${BASE_PATH}/sounds/bgm-level4.mp3`; break;
      case GameStage.SUMMARY: targetBgm = `${BASE_PATH}/sounds/wins.mp3`; break;
      case GameStage.ENDING: targetBgm = ''; break;
      case GameStage.VICTORY: targetBgm = `${BASE_PATH}/sounds/wins.mp3`; break;
      default: targetBgm = `${BASE_PATH}/sounds/bgm-start.mp3`; break;
    }

    if (!bgmRef.current) {
      bgmRef.current = new Audio();
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }

    const audioEl = bgmRef.current;
    const currentSrc = audioEl.src || '';
    if (targetBgm && !currentSrc.includes(targetBgm)) {
      audioEl.src = targetBgm;
      audioEl.play().catch(e => console.log("BGM play error", e));
    } else if (!targetBgm) {
      audioEl.pause();
    }
  }, [stage, isAudioInitialized]);

  // 遊戲邏輯控制
  const handleStart = () => { setStage(GameStage.INTRO); setStoryIndex(0); };
  const handleNextStory = () => { playSound('click'); if (storyIndex < STORY_SCRIPT.length - 1) { setStoryIndex(prev => prev + 1); } else { setStage(GameStage.LEVEL_1); } };

  const handleCorrect = () => {
    if (!currentLevel) return;
    if (stage === GameStage.LEVEL_4) {
      playSound('boss-defeat');
    } else {
      playSound('correct');
      setTimeout(() => playSound('victory'), 300);
    }
    setShowReward(true);
  };

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

  const handleWrong = () => { playSound('wrong'); setIsFail(true); };
  const retryLevel = () => setIsFail(false);

  const resetGame = () => {
    setStage(GameStage.START);
    setInventory({ blueCrystal: false, goldenRope: false, shinyShield: false, certificate: false });
    setIsFail(false);
    setShowReward(false);
    setIsVideoEnded(false);
    setTimeLeft(30);
  };

  const handleSummaryNext = () => { playSound('click'); setStage(GameStage.ENDING); };
  const handleVideoEnded = () => { setStage(GameStage.VICTORY); };

  useEffect(() => { if (stage === GameStage.INTER_LEVEL && pendingStage) { const timer = setTimeout(() => { setStage(pendingStage); setPendingStage(null); }, 3000); return () => clearTimeout(timer); } }, [stage, pendingStage]);

  // 🔥 修正：倒數計時邏輯 (確保歸零時跳轉)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (stage === GameStage.VICTORY) {
      setTimeLeft(33); // 初始時間
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            resetGame(); // 🔥 強制觸發重置
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [stage]);

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

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-[#060b28] flex flex-col items-center justify-center text-white">
        <div className="animate-spin text-6xl mb-4">🦔</div>
        <div className="text-2xl font-bold mb-2">Loading Resources...</div>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-400">{loadingProgress}%</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full aspect-video max-h-screen max-w-[177.78vh] bg-[#060b28] shadow-2xl overflow-hidden font-sans select-none">

        {!isAudioInitialized && (<div onClick={initAudio} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"><div className="animate-bounce mb-4 text-6xl">👆</div><h1 className="text-4xl text-white font-black font-['Chiron_GoRound_TC'] drop-shadow-lg mb-2">點擊畫面開啟音效</h1></div>)}

        {/* START, INTRO, INTER_LEVEL */}
        {stage === GameStage.START && (<div className="w-full h-full relative bg-cover bg-center bg-no-repeat animate-fade-in" style={{ backgroundImage: `url('${ASSETS.startBg}')` }}><div className="star-layer">{[...Array(50)].map((_, i) => (<div key={i} className="star" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, animationDelay: `${Math.random() * 3}s` }} />))}</div><div className="hedgehog-aura absolute pointer-events-none" style={{ left: '14%', top: '35%', width: '38%', aspectRatio: '1/1' }}></div><div className="monster-aura absolute pointer-events-none" style={{ right: '5%', top: '5%', width: '45%', aspectRatio: '1/1' }}></div><div className="absolute bottom-[12%] left-0 w-full flex justify-center z-50"><button onClick={handleStart} className="hotspot-btn w-[200px] h-[60px] md:w-[300px] md:h-[90px] rounded-full transition-colors" title="點擊開始遊戲"></button></div></div>)}
        {stage === GameStage.INTRO && (<div className="w-full h-full relative flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={handleNextStory}><div className="absolute inset-0 -z-10 bg-cover bg-center blur-sm opacity-50" style={{ backgroundImage: `url('${ASSETS.introBg}')` }}></div><div className="absolute bottom-[20%] z-10 animate-float"><img src={STORY_SCRIPT[storyIndex].image} alt="Speaker" className="w-64 md:w-96 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" /></div><div className="w-full max-w-4xl mb-12 md:mb-20 mx-4 z-20 cursor-pointer group"><div className="bg-white/95 rounded-[2rem] border-8 border-blue-500 p-8 shadow-2xl relative min-h-[180px] flex flex-col justify-center"><div className="absolute -top-6 left-10 bg-yellow-400 text-blue-900 font-black px-6 py-2 rounded-full border-4 border-white shadow-md text-xl">{STORY_SCRIPT[storyIndex].speaker}</div><p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed whitespace-pre-line">{STORY_SCRIPT[storyIndex].text}</p><div className="absolute bottom-4 right-6 text-blue-500 animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div></div><p className="text-center text-white/50 mt-4 text-lg font-bold tracking-widest">點擊繼續...</p></div></div>)}
        {stage === GameStage.INTER_LEVEL && (<div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden"><div className="absolute inset-0 opacity-20">{[...Array(20)].map((_, i) => (<div key={i} className="absolute h-1 bg-blue-400 w-full animate-slide-left" style={{ top: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>))}</div><div className="relative z-10 animate-bounce"><img src={ASSETS.hedgehogGo} alt="Running" className="w-48 h-48 object-contain" /></div><h2 className="text-white text-4xl font-black mt-8 animate-pulse tracking-widest font-['Chiron_GoRound_TC']">前往下一世界...</h2></div>)}

        {/* 遊戲關卡 (LEVEL 1-4) - 🔥 修正：使用絕對比例分層，確保不擋住 */}
        {currentLevel && (
          <div className="w-full h-full relative overflow-hidden mario-transition" style={{ backgroundImage: getBackgroundImage(), backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: getBackgroundColor() }}>
            {/* 上半部 (60%)：專門放動畫和角色，絕對安全區 */}
            <div className="absolute top-0 left-0 w-full h-[60%] pointer-events-none z-0">
              {stage !== GameStage.LEVEL_4 && (
                <div className="absolute bottom-[5%] left-[2%] w-[35%] md:w-[30%] hero-float-animation">
                  <img src={ASSETS.hedgehogBattle} alt="Hero" className="w-full object-contain drop-shadow-2xl" />
                </div>
              )}

              {/* 怪物層 */}
              {stage === GameStage.LEVEL_1 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'opacity-0' : ''}`}><div className="absolute top-[10%] right-[3%] w-[35%] enemy-float delay-1"><img src={`${BASE_PATH}/water-monster.png`} className="w-full object-contain drop-shadow-lg" /></div><div className="absolute top-[30%] right-[40%] w-[20%] enemy-float delay-2"><img src={`${BASE_PATH}/water-monster.png`} className="w-full object-contain opacity-80" /></div></div>)}
              {stage === GameStage.LEVEL_2 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'opacity-0' : ''}`}><div className="absolute bottom-[5%] right-[2%] w-[40%] enemy-grind delay-1"><img src={`${BASE_PATH}/sandpaper-monster.png`} className="w-full object-contain drop-shadow-xl" /></div><div className="absolute top-[10%] right-[45%] w-[25%] enemy-grind delay-2"><img src={`${BASE_PATH}/sandpaper-monster.png`} className="w-full object-contain" /></div></div>)}
              {stage === GameStage.LEVEL_3 && (<div className={`absolute inset-0 transition-opacity duration-500 ${showReward ? 'opacity-0' : ''}`}><div className="absolute top-[5%] right-[15%] w-[35%] enemy-aggressive delay-1"><img src={`${BASE_PATH}/glitch-monster.png`} className="w-full object-contain drop-shadow-2xl" /></div><div className="absolute bottom-[10%] right-[50%] w-[20%] enemy-aggressive delay-2"><img src={`${BASE_PATH}/glitch-monster.png`} className="w-full object-contain" /></div></div>)}

              {stage === GameStage.LEVEL_4 && (
                <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${showReward ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="absolute top-[5%] left-[40%] w-[55%] z-10 boss-idle"><img src={ASSETS.finalBoss} alt="Final Boss" className="w-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]" /></div>
                  <div className="absolute bottom-[5%] left-[2%] w-[35%] z-20 hero-float-animation"><img src={ASSETS.hedgehogBattle} alt="Hero" className="w-full object-contain drop-shadow-2xl" /></div>
                </div>
              )}
            </div>

            {/* 下半部 (40%)：專門放對話框，強制貼底 */}
            {!showReward && (
              <div className="absolute bottom-0 left-0 w-full h-[40%] flex flex-col items-center justify-end pb-4 md:pb-8 z-30">
                <div className="bg-white/95 backdrop-blur-md rounded-[1.5rem] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border-[4px] border-blue-200 w-[95%] md:w-[80%] max-w-4xl animate-pop-in flex flex-col justify-between h-full max-h-[280px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-black text-sm md:text-lg shadow-sm border border-white whitespace-nowrap">LEVEL {currentLevelIndex + 1}</span>
                    <span className="text-blue-900 font-bold text-base md:text-xl truncate">{currentLevel.context}</span>
                  </div>
                  <h2 className="text-lg md:text-2xl text-gray-800 font-black mb-2 leading-snug flex-grow flex items-center">{currentLevel.question}</h2>
                  <div className="grid grid-cols-2 gap-3 h-[80px] md:h-[100px]">
                    {currentLevel.options.map((opt, idx) => (
                      <button key={idx} onClick={opt.isCorrect ? handleCorrect : handleWrong} className="relative bg-blue-50 hover:bg-yellow-50 border-2 border-blue-100 hover:border-yellow-400 rounded-xl transition-all active:scale-95 flex items-center px-2">
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 text-white rounded-full flex shrink-0 items-center justify-center font-black text-sm border border-white shadow">{idx === 0 ? 'A' : 'B'}</div>
                          <span className="text-sm md:text-lg font-black text-gray-700 leading-tight text-left">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showReward && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="item-get-modal bg-gradient-to-b from-yellow-100 to-white p-8 rounded-[2rem] border-8 border-yellow-400 shadow-2xl text-center max-w-md w-[90%]">
                  <h2 className="text-3xl font-black text-yellow-600 mb-2 font-['ZCOOL_KuaiLe']">怪物擊破！</h2>
                  <p className="text-lg text-gray-500 font-bold mb-4">成功守護了布料結構</p>
                  <div className="w-32 h-32 mx-auto mb-4 relative animate-bounce-slow"><img src={ASSETS[currentLevel.rewardItem]} alt="Reward" className="w-full h-full object-contain" /></div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mb-4"><p className="text-blue-500 font-black text-lg">獲得道具</p><p className="text-xl font-black text-gray-800">{currentLevel.rewardName}</p></div>
                  <button onClick={handleRewardContinue} className="w-full py-3 text-xl font-black text-white bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-4 border-white shadow-lg active:scale-95">繼續冒險 ➔</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUMMARY (解說頁) - 🔥 修正：使用 absolute 定位刺蝟，確保不消失 */}
        {stage === GameStage.SUMMARY && (
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-cover bg-center animate-fade-in" style={{ backgroundImage: `url('${ASSETS.summaryBg}')` }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"></div>

            {/* 內容容器 */}
            <div className="relative z-10 w-[90%] max-w-3xl mt-20"> {/* mt-20 留空間給刺蝟 */}

              {/* 刺蝟：絕對定位在框框上方，像磁鐵一樣吸住 */}
              <div className="absolute -top-[140px] left-1/2 -translate-x-1/2 w-48 md:w-64 z-20 hero-float-animation">
                <img src={ASSETS.hedgehogEnd} alt="Cici" className="w-full object-contain drop-shadow-2xl" />
              </div>

              <div className="bg-white/95 rounded-[2rem] border-8 border-yellow-400 p-6 md:p-10 shadow-2xl text-center relative w-full pt-16">
                <h2 className="text-3xl md:text-4xl font-black text-blue-900 mb-4 font-['ZCOOL_KuaiLe']">天絲 Plus+ 的秘密</h2>
                <p className="text-base md:text-xl text-gray-700 font-bold leading-relaxed mb-6 px-2">
                  使用 Micro LF 級天絲纖維，透過特殊工藝處理，<br className="hidden md:block" />
                  有效降低原纖化現象，即使多次洗滌也能<br className="hidden md:block" />
                  <span className="text-yellow-600 font-black text-xl md:text-2xl">防止起毛球</span>，維持光澤與柔軟觸感！
                </p>
                <button onClick={handleSummaryNext} className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-3 rounded-full text-xl md:text-2xl font-black shadow-lg hover:scale-105 active:scale-95">下一頁 ➔</button>
              </div>
            </div>
          </div>
        )}

        {/* ENDING (影片) */}
        {stage === GameStage.ENDING && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video src={`${BASE_PATH}/ending.mp4`} autoPlay playsInline onEnded={handleVideoEnded} className="w-full h-full object-contain md:object-cover" />
          </div>
        )}

        {/* === VICTORY (領獎) === */}
        {stage === GameStage.VICTORY && (
          <div className="relative w-full h-full text-center animate-pop-in z-30 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.endBg}')` }}>
            <div className="absolute inset-0 bg-black/5"></div>

            {/* 底部資訊條 */}
            <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t-8 border-yellow-400 p-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col items-center gap-3 z-50">
              <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="text-center md:text-left flex-1">
                  <p className="text-base md:text-xl font-black text-gray-800 leading-tight mb-1">
                    請拍攝此畫面，購買 <span className="text-blue-600">"天絲PLUS雲柔被1件"</span><br />
                    結帳時出示此畫面
                  </p>
                  <p className="text-red-500 text-xl md:text-3xl font-black animate-pulse">
                    加贈 "限量版小童枕1個"
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm font-bold">(限時優惠，請把握機會！)</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                  <div className="bg-black/80 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                    畫面將在 {timeLeft} 秒後關閉
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 cursor-default text-white px-6 py-2 rounded-full text-lg font-black shadow-lg">前往購買</button>
                    <button onClick={resetGame} className="bg-gray-100 text-gray-600 border-2 border-gray-300 px-6 py-2 rounded-full text-lg font-black hover:bg-gray-200">回到首頁</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFail && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"><div className="bg-white rounded-[3rem] p-10 text-center border-b-[16px] border-red-100 shadow-2xl"><img src={ASSETS.hedgehogCry} alt="Sad" className="w-48 h-48 mx-auto mb-8 object-contain" /><h3 className="text-5xl font-black text-gray-900 mb-6">防禦失敗！</h3><button onClick={retryLevel} className="w-full py-6 text-4xl font-black text-white bg-red-500 rounded-full shadow-lg hover:bg-red-600">重新挑戰</button></div></div>)}
      </div>
    </div>
  );
};

export default App;