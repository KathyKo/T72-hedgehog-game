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
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 圖片預加載
  useEffect(() => {
    const imagesToLoad = Object.values(ASSETS);
    let loadedCount = 0;
    const loadImage = (src: string) => new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = () => resolve(src);
    });
    Promise.all(imagesToLoad.map(src => loadImage(src).then(() => {
      loadedCount++;
      setLoadingProgress(Math.round((loadedCount / imagesToLoad.length) * 100));
    }))).then(() => setIsLoading(false));
  }, []);

  // 音效系統
  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'click' | 'boss-defeat') => {
    if (!isAudioInitialized) return;
    const audioPath = {
      'correct': `${BASE_PATH}/sounds/correct.mp3`,
      'wrong': `${BASE_PATH}/sounds/wrong.mp3`,
      'victory': `${BASE_PATH}/sounds/victory.mp3`,
      'click': `${BASE_PATH}/sounds/blip.mp3`,
      'boss-defeat': `${BASE_PATH}/sounds/boss-defeat.mp3`
    }[type];

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

  // BGM 控制
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

  // 遊戲操作
  const handleStart = () => { setStage(GameStage.INTRO); setStoryIndex(0); };

  const handleNextStory = () => {
    playSound('click');
    if (storyIndex < STORY_SCRIPT.length - 1) setStoryIndex(prev => prev + 1);
    else setStage(GameStage.LEVEL_1);
  };

  // 修正：加入 e.preventDefault 防止 iPad 連點
  const handleCorrect = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isProcessing) return;

    setIsProcessing(true);

    if (stage === GameStage.LEVEL_4) {
      playSound('boss-defeat');
    } else {
      playSound('correct');
      setTimeout(() => playSound('victory'), 300);
    }
    setShowReward(true);
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
    setTimeLeft(40);
    setIsProcessing(false);
  };

  const handleSummaryNext = () => { playSound('click'); setStage(GameStage.ENDING); };
  const handleVideoEnded = () => { setStage(GameStage.VICTORY); };

  useEffect(() => {
    if (stage === GameStage.INTER_LEVEL && pendingStage) {
      const timer = setTimeout(() => { setStage(pendingStage); setPendingStage(null); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, pendingStage]);

  // 👇 [重要] 倒數計時邏輯：完全改回你提供的那版寫法 (直接在 prev<=1 時 resetGame)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === GameStage.VICTORY) {
      setTimeLeft(40);
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            resetGame(); // 這裡直接執行，保證跳轉
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
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

  if (isLoading) return (
    <div className="w-screen min-h-[100dvh] bg-[#060b28] flex flex-col items-center justify-center text-white">
      <div className="animate-spin text-6xl mb-4">🦔</div>
      <div className="text-2xl font-bold mb-2">Loading Resources...</div>
      <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-400">{loadingProgress}%</p>
    </div>
  );

  return (
    <div className="w-screen min-h-[100dvh] bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full aspect-video max-h-[100dvh] max-w-[177.78vh] bg-[#060b28] shadow-2xl overflow-hidden font-sans select-none">

        {!isAudioInitialized && (<div onClick={initAudio} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"><div className="animate-bounce mb-4 text-6xl">👆</div><h1 className="text-4xl text-white font-black font-['Chiron_GoRound_TC'] drop-shadow-lg mb-2">點擊畫面開啟音效</h1></div>)}

        {/* START */}
        {stage === GameStage.START && (
          <div className="w-full h-full relative bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.startBg}')` }}>
            <div className="absolute bottom-[12%] left-0 w-full flex justify-center z-50">
              <button onClick={handleStart} className="hotspot-btn w-[200px] h-[60px] md:w-[300px] md:h-[90px] rounded-full"></button>
            </div>
          </div>
        )}

        {/* INTRO */}
        {stage === GameStage.INTRO && (
          <div className="w-full h-full relative flex flex-col items-center justify-end pb-8" onClick={handleNextStory}>
            {/* 👇 修正：確保背景圖層正確顯示 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.introBg}')`, zIndex: -2 }}></div>
            <div className="absolute inset-0 bg-black/60 blur-sm" style={{ zIndex: -1 }}></div>

            <div className="relative z-10 flex-1 w-full flex items-end justify-center pb-4">
              <img src={STORY_SCRIPT[storyIndex].image} alt="Speaker" className="h-[40vh] object-contain animate-float drop-shadow-2xl" />
            </div>

            <div className="relative z-10 w-[90%] max-w-4xl bg-white/95 rounded-[2rem] border-8 border-blue-500 p-6 shadow-2xl relative min-h-[140px] flex flex-col justify-center mb-8">
              <div className="absolute -top-5 left-8 bg-yellow-400 text-blue-900 font-black px-4 py-1 rounded-full border-4 border-white shadow-md text-lg">{STORY_SCRIPT[storyIndex].speaker}</div>
              <p className="text-xl md:text-3xl font-bold text-gray-800 whitespace-pre-line">{STORY_SCRIPT[storyIndex].text}</p>
              <div className="absolute bottom-4 right-6 text-blue-500 animate-bounce">▼</div>
            </div>
          </div>
        )}

        {/* INTER_LEVEL */}
        {stage === GameStage.INTER_LEVEL && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black">
            <img src={ASSETS.hedgehogGo} alt="Running" className="w-48 animate-bounce" />
            <h2 className="text-white text-3xl font-black mt-4 animate-pulse">前往下一世界...</h2>
          </div>
        )}

        {/* LEVEL 1-4 */}
        {currentLevel && (
          <div className="w-full h-full flex flex-col relative" style={{ backgroundImage: getBackgroundImage(), backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: getBackgroundColor() }}>
            <div className="h-[45%] w-full relative">
              <div className="absolute inset-0 w-full h-full">
                {/* 怪物位置微調 */}
                {stage === GameStage.LEVEL_1 && <img src={`${BASE_PATH}/water-monster.png`} className={`absolute top-[10%] right-[10%] h-[80%] object-contain ${showReward ? 'opacity-0' : ''}`} />}
                {stage === GameStage.LEVEL_2 && <img src={`${BASE_PATH}/sandpaper-monster.png`} className={`absolute top-[15%] right-[5%] h-[70%] object-contain ${showReward ? 'opacity-0' : ''}`} />}
                {stage === GameStage.LEVEL_3 && <img src={`${BASE_PATH}/glitch-monster.png`} className={`absolute top-[10%] right-[10%] h-[80%] object-contain ${showReward ? 'opacity-0' : ''}`} />}
                {stage === GameStage.LEVEL_4 && <img src={ASSETS.finalBoss} className={`absolute top-[5%] left-[30%] h-[90%] object-contain ${showReward ? 'opacity-0' : ''}`} />}
              </div>
              <div className="absolute bottom-0 left-0 h-[90%] flex items-end">
                {/* 👇 修正：刺蝟再往左移 (left-[-2%])，讓出更多空間 */}
                <img src={ASSETS.hedgehogBattle} className="h-full object-contain drop-shadow-2xl hero-float-animation relative left-[-2%]" />
              </div>
            </div>

            <div className="h-[55%] w-full flex items-start justify-center pt-2 px-4 relative z-10">
              {!showReward ? (
                // 👇 修正：對話框內距縮小 (p-3)，讓高度更矮
                <div className="bg-white/95 backdrop-blur-md rounded-[1.5rem] border-[5px] border-blue-200 w-full max-w-3xl p-3 md:p-6 shadow-xl flex flex-col justify-between h-[90%]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full font-black text-sm border border-white">LEVEL {currentLevelIndex + 1}</span>
                      <span className="text-blue-900 font-bold text-base truncate">{currentLevel.context}</span>
                    </div>
                    <h2 className="text-lg md:text-2xl text-gray-800 font-black leading-snug">{currentLevel.question}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {currentLevel.options.map((opt, idx) => (
                      <button key={idx} onClick={(e) => opt.isCorrect ? handleCorrect(e) : handleWrong(e)} disabled={isProcessing} className="bg-blue-50 hover:bg-yellow-50 border-2 border-blue-100 p-3 rounded-xl text-left flex items-center gap-3 active:scale-95 transition-transform">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow">{idx === 0 ? 'A' : 'B'}</div>
                        <span className="text-base font-bold text-gray-800">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                  <div className="bg-white p-6 rounded-[2rem] border-8 border-yellow-400 text-center w-[90%] max-w-md animate-pop-in">
                    <h2 className="text-3xl font-black text-yellow-600 mb-2">怪物擊破！</h2>
                    <div className="w-32 h-32 mx-auto mb-4"><img src={ASSETS[currentLevel.rewardItem]} className="w-full h-full object-contain" /></div>
                    <p className="text-xl font-bold text-blue-600 mb-4">{currentLevel.rewardName}</p>
                    <button onClick={handleRewardContinue} className="w-full py-3 bg-blue-500 text-white rounded-full font-black text-xl shadow-lg">繼續冒險 ➔</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUMMARY (解說頁) */}
        {stage === GameStage.SUMMARY && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.summaryBg}')` }}>
            <div className="relative z-10 flex flex-col items-center w-[90%] max-w-3xl">
              <img src={ASSETS.hedgehogEnd} alt="Cici" className="h-[clamp(160px,30vh,320px)] md:h-[clamp(220px,35vh,380px)] object-contain mb-[-20px] z-10 animate-float" />

              {/* 👇 修正：Summary 視窗內距縮小 (p-4)，更緊湊 */}
              <div className="bg-white/95 rounded-[2rem] border-8 border-yellow-400 p-4 md:p-10 shadow-2xl text-center w-full pt-10">
                <h2 className="text-2xl md:text-4xl font-black text-blue-900 mb-4">天絲 Plus+ 的秘密</h2>
                <p className="text-base md:text-xl text-gray-700 font-bold mb-6 text-left md:text-center">
                  使用 Micro LF 級天絲纖維，透過特殊工藝處理，有效降低原纖化現象，即使多次洗滌也能 <span className="text-yellow-600">防止起毛球</span>！
                </p>
                <button onClick={handleSummaryNext} className="bg-blue-500 text-white px-8 py-3 rounded-full text-xl font-black shadow-lg">下一頁 ➔</button>
              </div>
            </div>
          </div>
        )}

        {/* ENDING (影片) */}
        {stage === GameStage.ENDING && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video src={`${BASE_PATH}/ending.mp4`} autoPlay playsInline onEnded={handleVideoEnded} className="w-full h-full object-contain" />
          </div>
        )}

        {/* VICTORY (領獎 - 底部長條) */}
        {stage === GameStage.VICTORY && (
          <div className="relative w-full h-full text-center animate-pop-in z-30 bg-cover bg-center" style={{ backgroundImage: `url('${ASSETS.endBg}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t-8 border-yellow-400 p-4 md:p-6 pb-8 shadow-[0_-10px_60px_rgba(0,0,0,0.5)] flex flex-col items-center gap-2 z-50">
              <div className="w-[min(92vw,620px)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left flex-1">
                  <p className="text-base md:text-2xl font-black text-gray-800 leading-tight mb-1">
                    請拍攝此畫面，購買 <span className="text-blue-600">"天絲PLUS雲柔被1件"</span>，結帳出示畫面
                  </p>
                  <p className="text-2xl text-red-500 font-black animate-pulse">
                    加贈 "限量版小童枕1個"
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm font-bold">(限時優惠，請把握機會！)</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-2 shrink-0 min-w-[200px]">
                  <div className="bg-black/80 text-yellow-400 px-4 py-1 rounded-full text-sm md:text-lg font-bold tracking-wider mb-1">
                    畫面將在 {timeLeft} 秒後關閉
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 cursor-default text-white px-6 py-2 rounded-full text-lg font-black shadow-lg whitespace-nowrap">
                      前往購買
                    </button>
                    <button onClick={resetGame} className="bg-gray-200 text-gray-600 border-2 border-gray-300 px-6 py-2 rounded-full text-lg font-black hover:bg-gray-300 transition-colors whitespace-nowrap">
                      回到首頁
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFail && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80">
            <div className="bg-white rounded-[2rem] p-8 text-center border-b-[10px] border-red-500">
              <h3 className="text-4xl font-black text-gray-900 mb-4">防禦失敗！</h3>
              <button onClick={retryLevel} className="bg-red-500 text-white px-8 py-3 rounded-full text-2xl font-bold shadow-lg">再試一次</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;