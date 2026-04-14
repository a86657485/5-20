import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, FastForward, Timer, Settings, ArrowRight, RefreshCw, DoorOpen, Lightbulb, Megaphone } from 'lucide-react';

// --- Types & Helpers ---
type PenguinData = {
  id: string;
  weight: number;
  status: 'pool' | 'queue' | 'bucket';
  bucketIndex: number | null;
};

const generatePenguins = (count: number, type: 'normal' | 'sumo' = 'normal'): PenguinData[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `p-${Date.now()}-${i}`,
    weight: type === 'sumo' 
      ? Math.floor(Math.random() * 21) + 80 // 80-100
      : Math.floor(Math.random() * 91) + 10, // 10-100
    status: 'pool',
    bucketIndex: null,
  }));
};

// --- Components ---
const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full opacity-60 animate-snow"
        style={{
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 6 + 2}px`,
          height: `${Math.random() * 6 + 2}px`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

const PenguinIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M 50 10 C 30 10 20 30 20 60 C 20 85 35 95 50 95 C 65 95 80 85 80 60 C 80 30 70 10 50 10 Z" fill="#1e293b" />
    <path d="M 50 25 C 35 25 28 40 28 65 C 28 85 40 90 50 90 C 60 90 72 85 72 65 C 72 40 65 25 50 25 Z" fill="#ffffff" />
    <circle cx="40" cy="35" r="4" fill="#000000" />
    <circle cx="60" cy="35" r="4" fill="#000000" />
    <path d="M 45 42 L 55 42 L 50 50 Z" fill="#f59e0b" />
    <path d="M 30 90 C 25 90 20 95 25 98 L 35 98 C 38 95 35 90 30 90 Z" fill="#f59e0b" />
    <path d="M 70 90 C 75 90 80 95 75 98 L 65 98 C 62 95 65 90 70 90 Z" fill="#f59e0b" />
    <path d="M 22 45 C 10 50 5 65 15 60 C 20 58 22 50 22 45 Z" fill="#1e293b" />
    <path d="M 78 45 C 90 50 95 65 85 60 C 80 58 78 50 78 45 Z" fill="#1e293b" />
  </svg>
);

const Penguin: React.FC<{ penguin: PenguinData, onDragEnd?: any, draggable?: boolean, unit?: string }> = ({ penguin, onDragEnd, draggable = true, unit = 'kg' }) => {
  // 核心细节：体积和体重严格对应，使用实际宽高避免 flex 布局重叠
  const size = 40 + (penguin.weight / 100) * 60; // 10kg -> 46px, 100kg -> 100px
  const [isDragging, setIsDragging] = useState(false);
  
  const transition = penguin.status === 'queue' 
    ? { type: 'tween', duration: 1.5, ease: 'easeInOut' } // 走向缆车时更缓慢流畅
    : { type: 'spring', stiffness: 300, damping: 20 };    // 平时拖拽或排队时 Q 弹

  return (
    <motion.div
      layout
      className="relative pointer-events-none"
      style={{ 
        width: size, 
        height: size,
        zIndex: isDragging ? 9999 : Math.floor(penguin.weight)
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={transition}
    >
      <motion.div
        drag={draggable}
        dragSnapToOrigin
        whileDrag={{ scale: 1.1 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd(penguin, info);
        }}
        data-penguin-id={penguin.id}
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-auto ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="bg-white border-2 border-slate-800 rounded-full px-1.5 py-0.5 text-[10px] font-bold absolute -top-4 whitespace-nowrap shadow-sm z-10 text-slate-800">
          {penguin.weight}{unit}
        </div>
        <div 
          className="animate-wobble origin-bottom select-none flex items-center justify-center"
          style={{ 
            width: `${size * 0.7}px`,
            height: `${size * 0.7}px`,
            animationDelay: `${Math.random() * 2}s` 
          }}
        >
          <PenguinIcon />
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Level 0: Start Screen ---
const StartScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl max-w-2xl shadow-2xl border-4 border-blue-200"
      >
        <h1 className="text-4xl font-black text-blue-600 mb-6 text-center">🐧 企鹅滑雪场：缆车排队大作战</h1>
        
        <div className="space-y-6 text-lg text-slate-700 font-medium">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h2 className="font-bold text-blue-800 mb-2 flex items-center gap-2">📖 游戏背景</h2>
            <p>今天滑雪场的游客太多了，缆车入口挤成了一锅粥！站长需要你的帮助，把企鹅们按体重<strong>【从小到大】</strong>排好队送上缆车。</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h2 className="font-bold text-orange-800 mb-2 flex items-center gap-2">🎮 操作规则</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>相邻交换：</strong>你可以拖拽企鹅，但<strong>只能与相邻的企鹅交换位置</strong>。把重的企鹅一点点往后排！</li>
              <li><strong>直接上车：</strong>如果你在队伍中找到了当前<strong>最轻</strong>的企鹅，可以直接把它拖进下方的缆车入口。</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button 
            onClick={onStart}
            className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-4 rounded-full font-bold text-2xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Play fill="currentColor" /> 开始挑战
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Level 1: 大塞车 ---
const Level1 = ({ onComplete, setNarratorText }: any) => {
  const [penguins, setPenguins] = useState<PenguinData[]>(() => generatePenguins(20));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'failed' | 'success'>('playing');

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (timeElapsed >= 180 && gameState === 'playing') {
      setGameState('failed');
      setNarratorText("我的天！3分钟过去了，企鹅还是没排好！快启用【智能体重分流通道】！");
    }
  }, [timeElapsed, gameState, setNarratorText]);

  useEffect(() => {
    if (gameState === 'playing') {
      const pool = penguins.filter(p => p.status === 'pool');
      // 检查是否全部排好序（从小到大）或全部进入缆车
      if (pool.length === 0) {
        setGameState('success');
        setNarratorText("太棒了！你成功把所有企鹅送上缆车了！但是如果企鹅更多，这个方法就太慢了。让我们看看更高效的方法！");
      } else if (pool.length === penguins.length) {
        const isSorted = pool.every((p, i) => i === 0 || p.weight >= pool[i - 1].weight);
        if (isSorted) {
          setGameState('success');
          setNarratorText("太棒了！你成功把企鹅按体重排好队了！但是如果企鹅更多，这个方法就太慢了。让我们看看更高效的方法！");
        }
      }
    }
  }, [penguins, gameState, setNarratorText]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDragEnd = (penguin: PenguinData, info: any) => {
    if (gameState !== 'playing') return;
    
    let droppedInCableCar = false;
    const cableCar = document.querySelector('[data-drop-zone="cable-car"]');
    if (cableCar) {
      const rect = cableCar.getBoundingClientRect();
      if (info.point.x >= rect.left && info.point.x <= rect.right &&
          info.point.y >= rect.top && info.point.y <= rect.bottom) {
        droppedInCableCar = true;
      }
    }
    
    if (droppedInCableCar) {
      const pool = penguins.filter(p => p.status === 'pool');
      const minWeight = Math.min(...pool.map(p => p.weight));
      
      if (penguin.weight === minWeight) {
        setPenguins(prev => prev.map(p => p.id === penguin.id ? { ...p, status: 'queue' } : p));
        setNarratorText(`好险！${penguin.weight}kg 确实是目前最轻的。继续找下一个！`);
      } else {
        setNarratorText(`哎呀！${penguin.weight}kg 不是最轻的！最轻的还在队伍里呢！`);
      }
      return;
    }

    // 距离检测：找到距离落点最近的企鹅进行交换，提高精准度
    const poolPenguins = penguins.filter(p => p.status === 'pool');
    const otherPoolPenguins = poolPenguins.filter(p => p.id !== penguin.id);
    let closestId: string | null = null;
    let minDistance = 80; // 触发交换的最大距离（像素）

    otherPoolPenguins.forEach(p => {
      const el = document.querySelector(`[data-penguin-id="${p.id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(centerX - info.point.x, centerY - info.point.y);
        if (distance < minDistance) {
          minDistance = distance;
          closestId = p.id;
        }
      }
    });

    if (closestId) {
      const poolIdx1 = poolPenguins.findIndex(p => p.id === penguin.id);
      const poolIdx2 = poolPenguins.findIndex(p => p.id === closestId);

      if (Math.abs(poolIdx1 - poolIdx2) === 1) {
        setPenguins(prev => {
          const newPenguins = [...prev];
          const idx1 = newPenguins.findIndex(p => p.id === penguin.id);
          const idx2 = newPenguins.findIndex(p => p.id === closestId);
          if (idx1 !== -1 && idx2 !== -1) {
            const temp = newPenguins[idx1];
            newPenguins[idx1] = newPenguins[idx2];
            newPenguins[idx2] = temp;
          }
          return newPenguins;
        });
        setNarratorText(`交换成功！继续把重的往后排，轻的往前排！`);
      } else {
        setNarratorText(`只能交换【相邻】的两只企鹅哦！`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      <div className="absolute top-4 left-4 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-2xl border-2 border-slate-700 flex items-center gap-2 z-50">
        <Timer className="w-6 h-6" />
        {formatTime(timeElapsed)}
      </div>

      <div className="flex-1 relative p-8 pr-[340px] flex flex-wrap content-start gap-4 justify-start overflow-hidden pt-24">
        <AnimatePresence>
          {penguins.filter(p => p.status === 'pool').map(p => (
            <Penguin key={p.id} penguin={p} onDragEnd={handleDragEnd} />
          ))}
        </AnimatePresence>
      </div>
      
      <div 
        data-drop-zone="cable-car"
        className="h-48 bg-slate-800/80 border-t-8 border-slate-700 flex items-center px-8 overflow-x-auto shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="text-white font-bold text-2xl mr-8 whitespace-nowrap flex flex-col items-center">
          <div className="w-4 h-24 bg-red-500 rounded-full mb-2 animate-pulse"></div>
          缆车入口
        </div>
        <div className="flex gap-2 items-end h-full pb-4">
          {penguins.filter(p => p.status === 'queue').sort((a, b) => a.weight - b.weight).map(p => (
            <Penguin key={p.id} penguin={p} draggable={false} />
          ))}
        </div>
      </div>
      
      {gameState === 'failed' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl text-center max-w-md shadow-2xl border-4 border-red-200"
          >
            <h2 className="text-4xl font-bold text-red-600 mb-4">时间到！大塞车！</h2>
            <p className="text-xl text-slate-700 mb-8 font-medium">无序的队伍太难排了，我们需要更好的策略！</p>
            <button 
              onClick={onComplete}
              className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold text-2xl shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 flex items-center justify-center gap-2 w-full"
            >
              启用智能分流 <ArrowRight />
            </button>
          </motion.div>
        </div>
      )}

      {gameState === 'success' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl text-center max-w-md shadow-2xl border-4 border-green-200"
          >
            <h2 className="text-4xl font-bold text-green-600 mb-4">排队完成！</h2>
            <p className="text-xl text-slate-700 mb-8 font-medium">你成功完成了排序！但是如果企鹅更多，这个方法就太慢了。让我们看看更高效的方法！</p>
            <button 
              onClick={onComplete}
              className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold text-2xl shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 flex items-center justify-center gap-2 w-full"
            >
              启用智能分流 <ArrowRight />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Level 2: 智能分流 ---
const Level2 = ({ onComplete }: any) => {
  const [penguins, setPenguins] = useState<PenguinData[]>(() => generatePenguins(30));
  const [step, setStep] = useState<'call' | 'sort' | 'board' | 'boarding' | 'done'>('call');
  const [calledBuckets, setCalledBuckets] = useState<number[]>([]);
  const queueRef = React.useRef<HTMLDivElement>(null);

  const buckets = [
    { id: 0, name: '10-20kg 迷你区', min: 10, max: 20, color: 'bg-blue-200', borderColor: 'border-blue-400' },
    { id: 1, name: '21-40kg 轻量区', min: 21, max: 40, color: 'bg-green-200', borderColor: 'border-green-400' },
    { id: 2, name: '41-60kg 中型区', min: 41, max: 60, color: 'bg-yellow-200', borderColor: 'border-yellow-400' },
    { id: 3, name: '61-80kg 壮汉区', min: 61, max: 80, color: 'bg-orange-200', borderColor: 'border-orange-400' },
    { id: 4, name: '81-100kg 巨无霸区', min: 81, max: 100, color: 'bg-red-200', borderColor: 'border-red-400' },
  ];

  const getBucketForWeight = (weight: number) => {
    return buckets.find(b => weight >= b.min && weight <= b.max)?.id || 0;
  };

  const handleCallBucket = (bucketId: number) => {
    setPenguins(prev => prev.map(p => {
      if (p.status === 'pool' && getBucketForWeight(p.weight) === bucketId) {
        return { ...p, status: 'bucket', bucketIndex: bucketId };
      }
      return p;
    }));
    
    const newCalled = [...calledBuckets, bucketId];
    setCalledBuckets(newCalled);
    
    if (newCalled.length === buckets.length) {
      setStep('sort');
    }
  };

  const handleSort = () => {
    setPenguins(prev => {
      return [...prev].sort((a, b) => a.weight - b.weight);
    });
    setStep('board');
  };

  const handleBoard = async () => {
    setStep('boarding');
    const sortedPenguins = [...penguins].sort((a, b) => a.weight - b.weight);
    
    for (let i = 0; i < sortedPenguins.length; i++) {
      const p = sortedPenguins[i];
      setPenguins(prev => prev.map(curr => curr.id === p.id ? { ...curr, status: 'queue' } : curr));
      
      // 自动滚动到队伍最后面
      setTimeout(() => {
        if (queueRef.current) {
          queueRef.current.scrollTo({
            left: queueRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 800)); // 增加间隔，让动画更清晰
    }
    setStep('done');
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* 科学原理面板 */}
      {step === 'call' && (
        <div className="absolute top-6 right-6 w-96 bg-white p-6 rounded-2xl shadow-2xl border-4 border-indigo-200 z-50">
          <h2 className="text-xl font-black text-indigo-800 mb-3 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" /> 科学原理：桶排序
          </h2>
          <div className="text-slate-700 space-y-3 text-sm font-medium leading-relaxed">
            <p>当面对大量杂乱的数据时，直接排序会非常慢。</p>
            <p><strong>桶排序 (Bucket Sort)</strong> 的智慧在于：</p>
            <ul className="list-disc pl-5 space-y-1 text-indigo-900">
              <li>先按特征（如体重区间）划分出多个“桶”（候车区）。</li>
              <li>把数据分发到对应的桶里。</li>
              <li>在每个小桶内部单独排序。</li>
            </ul>
            <p className="text-orange-600 font-bold mt-2">
              👉 任务：点击各个候车区的喇叭，把对应体重的企鹅呼喊过去！
            </p>
          </div>
        </div>
      )}

      {/* 企鹅池 */}
      {step === 'call' && (
        <div className="flex-1 relative p-8 pr-[400px] flex flex-wrap content-start gap-4 justify-center overflow-hidden pt-12">
          <AnimatePresence>
            {penguins.filter(p => p.status === 'pool').map(p => (
              <Penguin key={p.id} penguin={p} draggable={false} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 动作按钮区 */}
      <div className={`absolute left-1/2 -translate-x-1/2 flex gap-4 z-50 transition-all duration-1000 ${step === 'call' ? 'bottom-64' : (step === 'boarding' || step === 'done' ? 'bottom-64' : 'bottom-12')}`}>
        {step === 'sort' && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white/90 px-8 py-4 rounded-full font-bold text-green-800 shadow-xl border-2 border-green-200 animate-pulse text-xl whitespace-nowrap">
              企鹅已全部分流！请吹哨让它们在各自的候车区内排好队！
            </div>
            <button onClick={handleSort} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 border-2 border-green-400">
              <RefreshCw /> 吹哨排队
            </button>
          </div>
        )}
        {step === 'board' && (
          <button onClick={handleBoard} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 border-2 border-yellow-400">
            <Play /> 缆车开门，依次上车！
          </button>
        )}
        {step === 'done' && (
          <button onClick={onComplete} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 animate-bounce border-2 border-purple-400">
            进入沙盒实验室 <ArrowRight />
          </button>
        )}
      </div>

      {/* 候车区 (Buckets) */}
      <div className={`absolute left-0 right-0 flex gap-2 px-4 transition-all duration-1000 ease-in-out
        ${step === 'call' ? 'bottom-0 h-56 pb-4' : 
          (step === 'boarding' || step === 'done') ? 'top-12 bottom-56' : 'top-12 bottom-32'}
      `}>
        {buckets.map(bucket => {
          const bucketPenguins = penguins.filter(p => p.status === 'bucket' && p.bucketIndex === bucket.id);
          const isCalled = calledBuckets.includes(bucket.id);
          return (
            <div 
              key={bucket.id} 
              data-bucket-id={bucket.id}
              className={`flex-1 border-4 flex flex-col items-center pt-8 relative transition-colors shadow-inner
                ${step === 'call' ? 'rounded-t-3xl' : 'rounded-2xl'}
                ${bucket.color} ${bucket.borderColor}
              `}
            >
              <div className="absolute -top-6 flex flex-col items-center gap-2 z-10">
                {!isCalled && step === 'call' && (
                  <button 
                    onClick={() => handleCallBucket(bucket.id)}
                    className="absolute bottom-full mb-2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 p-3 rounded-full shadow-lg animate-bounce border-2 border-yellow-500 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Megaphone size={24} fill="currentColor" />
                  </button>
                )}
                <div className="bg-white px-4 py-2 rounded-full font-bold text-sm shadow-md border-2 border-slate-200 text-slate-800 whitespace-nowrap">
                  {bucket.name}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 content-start w-full h-full overflow-hidden px-2 pt-4">
                <AnimatePresence>
                  {bucketPenguins.map(p => (
                    <Penguin key={p.id} penguin={p} draggable={false} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* 缆车入口 (Boarding & Done) */}
      <AnimatePresence>
        {(step === 'boarding' || step === 'done') && (
          <motion.div 
            initial={{ y: 250 }} animate={{ y: 0 }} exit={{ y: 250 }} transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-0 left-0 right-0 h-52 bg-slate-800 border-t-8 border-slate-700 flex items-center overflow-x-auto shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl z-40 scroll-smooth"
            ref={queueRef}
          >
            <div className="text-white font-bold text-2xl px-8 whitespace-nowrap flex flex-col items-center sticky left-0 bg-slate-800 z-20 h-full justify-center border-r-4 border-slate-700 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
              <div className="w-4 h-16 bg-green-500 rounded-full mb-2"></div>
              缆车入口
            </div>
            <div className="flex gap-1 items-end h-full pb-4 px-8 min-w-max">
              {penguins.filter(p => p.status === 'queue').sort((a, b) => a.weight - b.weight).map(p => (
                <Penguin key={p.id} penguin={p} draggable={false} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Level 3: 成绩排序 (巩固练习) ---
const Level3 = ({ setNarratorText, onComplete }: any) => {
  const [penguins, setPenguins] = useState<PenguinData[]>(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const isHigh = Math.random() < 0.95;
      const weight = isHigh 
        ? Math.floor(Math.random() * 41) + 60 // 60-100 分
        : Math.floor(Math.random() * 60);     // 0-59 分
      return {
        id: `p-${Date.now()}-${i}`,
        weight,
        status: 'pool',
        bucketIndex: null,
      };
    });
  });
  const [step, setStep] = useState<'drag' | 'sort' | 'board' | 'done'>('drag');
  const [calledBuckets, setCalledBuckets] = useState<number[]>([]);
  const queueRef = React.useRef<HTMLDivElement>(null);

  const buckets = [
    { id: 0, name: 'D (0-59)', min: 0, max: 59, color: 'bg-slate-200', borderColor: 'border-slate-400' },
    { id: 1, name: 'C (60-69)', min: 60, max: 69, color: 'bg-red-200', borderColor: 'border-red-400' },
    { id: 2, name: 'C+ (70-79)', min: 70, max: 79, color: 'bg-orange-200', borderColor: 'border-orange-400' },
    { id: 3, name: 'B (80-84)', min: 80, max: 84, color: 'bg-yellow-200', borderColor: 'border-yellow-400' },
    { id: 4, name: 'B+ (85-89)', min: 85, max: 89, color: 'bg-lime-200', borderColor: 'border-lime-400' },
    { id: 5, name: 'A (90-94)', min: 90, max: 94, color: 'bg-green-200', borderColor: 'border-green-400' },
    { id: 6, name: 'A+ (95-100)', min: 95, max: 100, color: 'bg-emerald-300', borderColor: 'border-emerald-500' },
  ];

  useEffect(() => {
    if (step === 'drag') {
      setNarratorText("巩固练习：期末考试成绩出来了！请你手动运用【桶排序】的原理，把企鹅们的成绩单拖到对应的等级区！");
    }
  }, [step]);

  const getBucketForScore = (score: number) => {
    return buckets.find(b => score >= b.min && score <= b.max)?.id || 0;
  };

  const handleDragEnd = (penguin: PenguinData, info: any) => {
    if (step !== 'drag') return;
    
    let bucketId: number | null = null;
    const zones = document.querySelectorAll('[data-bucket-id]');
    zones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      if (info.point.x >= rect.left && info.point.x <= rect.right &&
          info.point.y >= rect.top && info.point.y <= rect.bottom) {
        bucketId = parseInt(zone.getAttribute('data-bucket-id') || '0');
      }
    });
    
    if (bucketId !== null) {
      const correctBucketId = getBucketForScore(penguin.weight);
      
      if (bucketId === correctBucketId) {
        setPenguins(prev => {
          const next = prev.map(p => p.id === penguin.id ? { ...p, status: 'bucket', bucketIndex: bucketId } : p);
          if (next.every(p => p.status === 'bucket')) {
            setStep('sort');
            setNarratorText("太棒了！所有成绩都分好等级了！现在请点击每个等级区，让里面的成绩从大到小排好序！");
          } else {
            setNarratorText(`放对啦！${penguin.weight}分 属于 ${buckets[bucketId].name}。继续加油！`);
          }
          return next;
        });
      } else {
        setNarratorText(`放错啦！${penguin.weight}分 应该去 ${buckets[correctBucketId].name}！`);
      }
    }
  };

  const handleSortBucket = (bucketId: number) => {
    if (step !== 'sort' || calledBuckets.includes(bucketId)) return;
    
    setPenguins(prev => {
      const next = [...prev];
      const bucketPenguins = next.filter(p => p.bucketIndex === bucketId);
      // 桶内从大到小排序
      bucketPenguins.sort((a, b) => b.weight - a.weight);
      
      let i = 0;
      return next.map(p => {
        if (p.bucketIndex === bucketId) {
          return bucketPenguins[i++];
        }
        return p;
      });
    });

    setCalledBuckets(prev => {
      const next = [...prev, bucketId];
      if (next.length === buckets.length) {
        setStep('board');
        setCalledBuckets([]);
        setNarratorText("等级内排序完成！最后一步：请按成绩从高到低（从大到小），依次点击等级区，生成最终的成绩单！");
      } else {
        setNarratorText(`很好！${buckets[bucketId].name} 区的成绩已经排好序了。继续点击其他区！`);
      }
      return next;
    });
  };

  const handleBoardBucket = (bucketId: number) => {
    if (step !== 'board') return;
    
    // 从大到小，所以期望点击的是还没被叫到的、分数最高的桶（即索引最大的桶）
    const remainingBuckets = buckets.filter(b => !calledBuckets.includes(b.id));
    const expectedBucketId = remainingBuckets[remainingBuckets.length - 1].id;
    
    if (bucketId === expectedBucketId) {
      setCalledBuckets(prev => [...prev, bucketId]);
      setPenguins(prev => prev.map(p => p.bucketIndex === bucketId ? { ...p, status: 'queue' } : p));
      
      if (calledBuckets.length + 1 === buckets.length) {
        setStep('done');
        setNarratorText("恭喜你！你已经完全掌握了【桶排序】！不仅能分流企鹅，还能整理成绩单！");
      } else {
        setNarratorText(`很好！${buckets[bucketId].name} 的成绩已经加入成绩单。接下来该选哪个区？`);
      }
    } else {
      setNarratorText(`等一下！我们要从高分到低分排序，现在应该选 ${buckets[expectedBucketId].name} 哦！`);
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* 成绩单池 */}
      {step === 'drag' && (
        <div className="flex-1 relative p-8 pr-[340px] flex flex-wrap content-start gap-4 justify-center overflow-hidden pt-12">
          <AnimatePresence>
            {penguins.filter(p => p.status === 'pool').map(p => (
              <Penguin key={p.id} penguin={p} onDragEnd={handleDragEnd} draggable={true} unit="分" />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 动作按钮区 */}
      <div className={`absolute left-1/2 -translate-x-1/2 flex gap-4 z-50 transition-all duration-1000 ${step === 'drag' ? 'bottom-72' : 'bottom-12'}`}>
        {step === 'done' && (
          <button onClick={onComplete} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl flex items-center gap-2 transition-transform hover:scale-105 animate-bounce border-2 border-purple-400">
            进入最终测验 <ArrowRight />
          </button>
        )}
      </div>

      {/* 等级区 (Buckets) */}
      <div className={`absolute left-0 right-0 flex gap-1 px-2 transition-all duration-1000 ease-in-out
        ${step === 'drag' ? 'bottom-0 h-64 pb-4' : 'top-12 bottom-56'}
      `}>
        {buckets.map(bucket => {
          const bucketPenguins = penguins.filter(p => p.status === 'bucket' && p.bucketIndex === bucket.id);
          const isSorted = calledBuckets.includes(bucket.id);
          
          return (
            <div 
              key={bucket.id} 
              data-bucket-id={bucket.id}
              onClick={() => {
                if (step === 'sort') handleSortBucket(bucket.id);
                if (step === 'board') handleBoardBucket(bucket.id);
              }}
              className={`flex-1 border-4 flex flex-col items-center pt-8 relative transition-colors shadow-inner
                ${step === 'drag' ? 'rounded-t-3xl' : 'rounded-2xl cursor-pointer hover:brightness-95'}
                ${bucket.color} ${bucket.borderColor}
                ${(step === 'sort' && isSorted) ? 'opacity-50 grayscale' : ''}
                ${(step === 'board' && isSorted) ? 'opacity-0 pointer-events-none' : ''}
              `}
            >
              <div className="absolute -top-4 bg-white px-2 py-1 rounded-full font-bold text-xs shadow-md border-2 border-slate-200 text-slate-800 whitespace-nowrap">
                {bucket.name}
              </div>
              <div className="flex flex-wrap justify-center gap-1 content-start w-full h-full overflow-hidden px-1 pt-2">
                <AnimatePresence>
                  {bucketPenguins.map(p => (
                    <Penguin key={p.id} penguin={p} draggable={false} unit="分" />
                  ))}
                </AnimatePresence>
              </div>
              
              {step === 'sort' && !isSorted && (
                <div className="absolute bottom-4 bg-white/80 px-3 py-1 rounded-full text-sm font-bold text-slate-700 animate-pulse">
                  点击排序
                </div>
              )}
              {step === 'board' && !isSorted && (
                <div className="absolute bottom-4 bg-white/80 px-3 py-1 rounded-full text-sm font-bold text-slate-700 animate-pulse">
                  点击取出
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 最终成绩单 (Boarding & Done) */}
      <AnimatePresence>
        {(step === 'board' || step === 'done') && penguins.some(p => p.status === 'queue') && (
          <motion.div 
            initial={{ y: 250 }} animate={{ y: 0 }} exit={{ y: 250 }} transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-0 left-0 right-0 h-52 bg-slate-800 border-t-8 border-slate-700 flex items-center overflow-x-auto shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] rounded-t-2xl z-40 scroll-smooth"
            ref={queueRef}
          >
            <div className="text-white font-bold text-2xl px-8 whitespace-nowrap flex flex-col items-center sticky left-0 bg-slate-800 z-20 h-full justify-center border-r-4 border-slate-700 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
              <div className="w-4 h-16 bg-blue-500 rounded-full mb-2"></div>
              最终成绩单
            </div>
            <div className="flex gap-1 items-end h-full pb-4 px-8 min-w-max">
              {penguins.filter(p => p.status === 'queue').sort((a, b) => b.weight - a.weight).map(p => (
                <Penguin key={p.id} penguin={p} draggable={false} unit="分" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Level 4: 知识测验 ---
const questions = [
  { q: "桶排序的第一步通常是什么？", options: ["将所有数据直接进行比较", "根据数据的范围划分出多个“桶”", "把数据随机分发", "找出最大和最小的数据"], ans: 1, explanation: "桶排序的核心思想就是“分而治之”，第一步必须先建立好分类的标准，也就是划分出不同范围的“桶”。" },
  { q: "在企鹅滑雪场中，我们把企鹅按体重分到不同的候车区，这对应桶排序的哪一步？", options: ["合并结果", "桶内排序", "分发数据到桶中", "划分桶"], ans: 2, explanation: "候车区就是“桶”，把不同体重的企鹅引导过去，就是把数据分发到对应的桶里。" },
  { q: "桶排序中，每个“桶”内部的数据还需要排序吗？", options: ["不需要，分发完就排好序了", "需要，每个桶内部还要单独进行排序", "只有第一个桶需要", "视情况而定"], ans: 1, explanation: "分桶只是把大范围缩小了，桶内的数据依然是无序的，所以必须在每个小桶内部再进行一次排序。" },
  { q: "桶排序最后一步是什么？", options: ["把所有桶里的数据按顺序合并起来", "销毁所有的桶", "重新划分桶", "随机打乱数据"], ans: 0, explanation: "当每个小桶内部都排好序后，只要按照桶的顺序把数据依次拿出来合并，整体就完全排好序啦！" },
  { q: "为什么我们要使用桶排序而不是直接对所有数据进行冒泡排序？", options: ["因为桶排序名字好听", "因为当数据量很大时，直接排序非常慢，分桶可以提高效率", "因为桶排序不需要比较", "因为冒泡排序不能排数字"], ans: 1, explanation: "数据量越大，直接排序的计算量会呈指数级增长。分桶能把大问题拆成几个小问题，大大减少计算量。" },
  { q: "“将一个复杂的大问题，分解成几个相对简单的小问题来解决”，这种思想被称为什么？", options: ["冒泡思想", "随机思想", "分治思想", "贪心思想"], ans: 2, explanation: "分治，即“分而治之”。把大问题分解（分），然后分别解决（治）。" },
  { q: "桶排序是如何体现“分治思想”的？", options: ["它把所有数据放在一起处理", "它把大量数据分到不同的小桶里，化大为小，分别处理", "它只处理一部分数据，丢弃另一部分", "它把小问题合并成大问题"], ans: 1, explanation: "桶排序正是通过“划分桶”把大量数据拆分成小块，然后在小块内分别排序，完美体现了分治思想。" },
  { q: "下面哪个生活场景体现了“分治思想”？", options: ["一个人打扫整栋大楼", "把全班同学分成几个小组，每个小组负责打扫一个区域", "把所有垃圾都倒在一个垃圾桶里", "闭上眼睛不打扫"], ans: 1, explanation: "把大任务（打扫全班）拆分成小任务（小组打扫区域），这就是分治思想在生活中的应用。" },
  { q: "如果有1000份杂乱的考试试卷需要按分数排序，使用分治思想应该怎么做？", options: ["从第一张开始，一张张和后面的比较", "先按分数段分成几堆，每堆分别排好，再叠在一起", "随便乱放", "只排前10名"], ans: 1, explanation: "按分数段分堆就是“划分桶”，每堆分别排好就是“桶内排序”，最后叠在一起就是“合并结果”。" },
  { q: "桶排序中，如果所有的企鹅都挤到了同一个候车区（桶）里，会发生什么？", options: ["排序速度会变得非常快", "桶排序会退化，失去“分治”的优势，变得很慢", "企鹅会变得更重", "没有任何影响"], ans: 1, explanation: "如果全在一个桶里，就等于没有分桶，退化成了普通的直接排序，失去了分治的意义。" },
  { q: "为了让桶排序发挥最大威力，数据在各个桶里的分布最好是怎样的？", options: ["全部集中在一个桶里", "尽量均匀地分布在各个桶里", "一半在一个桶，一半在另一个桶", "随机分布，越乱越好"], ans: 1, explanation: "数据越均匀，每个桶里的工作量就越平均，分治的效果就越好！" },
  { q: "在第三关“成绩排序”中，我们把成绩分成了A, B, C, D等不同等级，这相当于桶排序中的什么？", options: ["划分桶", "桶内排序", "合并结果", "冒泡排序"], ans: 0, explanation: "成绩等级就是分类的标准，相当于划分出了一个个的“桶”。" },
  { q: "分治思想的“治”指的是什么？", options: ["划分问题", "解决分解后的小问题", "合并结果", "放弃问题"], ans: 1, explanation: "“分”是拆解问题，“治”就是逐个解决这些拆解出来的小问题。" },
  { q: "拼图游戏时，我们通常先拼好边框，再按颜色或图案分成几块小区域分别拼，最后拼在一起。这运用了什么思想？", options: ["顺序思想", "逆向思想", "分治思想", "随机思想"], ans: 2, explanation: "把大拼图分成小区域分别拼，正是典型的分治思想。" },
  { q: "学习了桶排序和分治思想，你觉得它最大的启示是什么？", options: ["遇到难题就放弃", "面对复杂庞大的任务，可以尝试把它拆解成小块，逐个击破", "所有问题都只能用一种方法解决", "计算机比人聪明"], ans: 1, explanation: "分治思想不仅是计算机算法的核心，也是我们解决生活中复杂问题的有效方法！" }
];

const Level4 = ({ setNarratorText, onComplete }: any) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [guessed, setGuessed] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    setNarratorText("最后，让我们来检验一下今天的学习成果！满分100分（共15题），全部答对即可解锁终极隐藏小游戏！");
  }, []);

  const handleSelect = (idx: number) => {
    if (isSolved || guessed.includes(idx)) return;
    
    const newGuessed = [...guessed, idx];
    setGuessed(newGuessed);
    
    if (idx === questions[currentQ].ans) {
      setIsSolved(true);
      if (newGuessed.length === 1) {
        setScore(s => s + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setGuessed([]);
      setIsSolved(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setGuessed([]);
    setIsSolved(false);
  };

  if (showResult) {
    const isPerfect = score === questions.length;
    return (
      <div className="flex flex-col items-center justify-center h-full z-10 relative">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border-4 border-blue-200 text-center max-w-2xl">
          <h2 className="text-4xl font-black text-blue-800 mb-6">测验结束！</h2>
          <div className="text-6xl font-black mb-8 text-orange-500">
            {Math.round((score / questions.length) * 100)} 分
          </div>
          <p className="text-xl text-slate-700 mb-8 font-medium">
            你答对了 {score} / {questions.length} 道题。
          </p>
          
          {isPerfect ? (
            <div>
              <p className="text-green-600 font-bold text-2xl mb-8 animate-bounce">🎉 满分！你已完全掌握分治思想！</p>
              <button 
                onClick={onComplete}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full font-bold text-2xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <Play /> 解锁隐藏小游戏
              </button>
            </div>
          ) : (
            <div>
              <p className="text-red-500 font-bold text-xl mb-8">哎呀，差一点点就满分了，只有满分才能解锁隐藏小游戏哦！</p>
              <button 
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <RefreshCw /> 重新挑战
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col items-center justify-center h-full z-10 relative px-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-blue-200 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4">
          <span className="text-blue-600 font-bold text-xl">知识测验</span>
          <span className="text-slate-500 font-bold text-lg">第 {currentQ + 1} / {questions.length} 题</span>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
          {q.q}
        </h3>
        
        <div className="flex flex-col gap-4">
          {q.options.map((opt, idx) => {
            let btnClass = "bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-700";
            
            if (guessed.includes(idx)) {
              if (idx === q.ans) {
                btnClass = "bg-green-100 border-green-500 text-green-800 shadow-md";
              } else {
                btnClass = "bg-red-50 border-red-300 text-red-500 opacity-60 line-through";
              }
            } else if (isSolved) {
              btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-40";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isSolved || guessed.includes(idx)}
                className={`text-left p-5 rounded-xl border-2 font-medium text-lg transition-all ${btnClass}`}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            );
          })}
        </div>

        {guessed.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-5 rounded-2xl border-2 ${isSolved ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className={`w-6 h-6 mt-1 flex-shrink-0 ${isSolved ? 'text-green-500' : 'text-orange-500'}`} />
              <div>
                <h4 className={`font-bold mb-1 ${isSolved ? 'text-green-800' : 'text-orange-800'}`}>
                  {isSolved ? '回答正确！' : '哎呀，选错了。再想想看？'}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  <span className="font-bold">解析：</span>{q.explanation}
                </p>
              </div>
            </div>
            
            {isSolved && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-md transition-transform hover:scale-105 flex items-center gap-2"
                >
                  {currentQ < questions.length - 1 ? '下一题' : '查看成绩'} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Mini Game: 分治猜数字 ---
const MiniGame = ({ setNarratorText }: any) => {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [guess, setGuess] = useState<string>('');
  const [history, setHistory] = useState<{g: number, res: string}[]>([]);
  const [won, setWon] = useState(false);

  useEffect(() => {
    setNarratorText("隐藏关卡：猜数字！系统在 1-100 之间想了一个数字。每次猜测，系统会告诉你猜大了还是猜小了。尝试用【分治思想】（每次猜中间数），看看你能多快猜中！");
  }, []);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(guess);
    if (isNaN(g) || g < min || g > max) return;

    if (g === target) {
      setHistory([{ g, res: '正确！' }, ...history]);
      setWon(true);
      setNarratorText(`太厉害了！你只用了 ${history.length + 1} 次就猜中了！每次折半，这就是分治思想的终极威力！课堂圆满结束！`);
    } else if (g < target) {
      setHistory([{ g, res: '太小了' }, ...history]);
      setMin(g + 1);
      setNarratorText(`猜小了！所以 ${min} 到 ${g} 都不可能了！问题规模缩小了一半！`);
    } else {
      setHistory([{ g, res: '太大了' }, ...history]);
      setMax(g - 1);
      setNarratorText(`猜大了！所以 ${g} 到 ${max} 都不可能了！问题规模缩小了一半！`);
    }
    setGuess('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full z-10 relative px-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-purple-200 w-full max-w-4xl flex flex-col items-center">
        <h2 className="text-3xl font-black text-purple-800 mb-2">终极挑战：分治猜数字</h2>
        <p className="text-slate-500 mb-8">目标数字在 1 到 100 之间</p>

        <div className="w-full h-16 bg-slate-100 rounded-full mb-8 relative overflow-hidden border-2 border-slate-200 flex">
          {/* Visualizer for 1-100 */}
          <div 
            className="absolute top-0 bottom-0 bg-slate-300 transition-all duration-500"
            style={{ left: 0, width: `${(min - 1)}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 bg-green-400 transition-all duration-500 flex items-center justify-center font-bold text-white shadow-inner"
            style={{ left: `${(min - 1)}%`, width: `${(max - min + 1)}%` }}
          >
            可能范围: {min} - {max}
          </div>
          <div 
            className="absolute top-0 bottom-0 bg-slate-300 transition-all duration-500"
            style={{ left: `${max}%`, right: 0 }}
          />
        </div>

        {!won ? (
          <form onSubmit={handleGuess} className="flex gap-4 mb-8">
            <input 
              type="number" 
              value={guess}
              onChange={e => setGuess(e.target.value)}
              min={min}
              max={max}
              className="border-4 border-purple-200 rounded-2xl px-6 py-4 text-2xl font-bold text-center w-48 focus:outline-none focus:border-purple-500"
              placeholder="输入数字"
              autoFocus
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-xl transition-transform hover:scale-105">
              猜！
            </button>
          </form>
        ) : (
          <div className="bg-green-100 text-green-800 px-8 py-4 rounded-2xl font-bold text-2xl mb-8 animate-bounce border-2 border-green-400">
            🎉 恭喜通关！目标数字就是 {target}！
          </div>
        )}

        <div className="w-full max-w-md bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 h-64 overflow-y-auto">
          <h4 className="font-bold text-slate-500 mb-4 border-b pb-2">猜测记录</h4>
          <div className="flex flex-col gap-2">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
                <span className="font-bold text-slate-700 text-lg">猜了: {h.g}</span>
                <span className={`font-bold ${h.res === '正确！' ? 'text-green-600' : 'text-orange-500'}`}>{h.res}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [level, setLevel] = useState(0);
  const [narratorText, setNarratorText] = useState("欢迎来到企鹅滑雪场！你可以把最轻的企鹅直接拖进缆车，也可以拖动相邻企鹅互相交换位置！你有3分钟！");
  const [showTestPanel, setShowTestPanel] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50 font-sans select-none">
      <Snowflakes />

      {/* 测试面板 (Debug Panel) */}
      <div className="fixed bottom-4 left-4 z-[9999]">
        <button 
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-bold opacity-30 hover:opacity-100 transition-opacity shadow-lg"
        >
          🔧 测试面板
        </button>
        
        {showTestPanel && (
          <div className="mt-2 bg-white/90 backdrop-blur p-4 rounded-xl shadow-2xl border-2 border-slate-200 flex flex-col gap-2 text-sm w-48">
            <div className="font-bold text-slate-700 mb-1 border-b pb-1">快速跳转关卡</div>
            <button onClick={() => setLevel(0)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">0. 开始界面</button>
            <button onClick={() => setLevel(1)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">1. 第一关 (大塞车)</button>
            <button onClick={() => setLevel(2)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">2. 第二关 (智能分流)</button>
            <button onClick={() => setLevel(3)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">3. 第三关 (成绩排序)</button>
            <button onClick={() => setLevel(4)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">4. 第四关 (知识测验)</button>
            <button onClick={() => setLevel(5)} className="bg-slate-100 hover:bg-blue-100 text-slate-700 px-3 py-1.5 rounded text-left transition-colors">5. 第五关 (隐藏游戏)</button>
          </div>
        )}
      </div>

      {level === 0 && <StartScreen onStart={() => setLevel(1)} />}

      {/* 顶部旁白 */}
      {level > 0 && level !== 2 && level !== 4 && (
        <div className="absolute top-6 right-6 flex flex-col gap-6 w-80 z-50 pointer-events-none">
          <div className="bg-white p-5 rounded-2xl shadow-2xl border-4 border-blue-200 relative pointer-events-auto">
            <div className="absolute -left-4 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-white border-b-[12px] border-b-transparent"></div>
            <div className="absolute -left-5 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-r-[16px] border-r-blue-200 border-b-[12px] border-b-transparent -z-10"></div>
            
            <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-slate-100">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">站长</div>
              <div className="font-black text-blue-900 text-lg">通讯录</div>
            </div>
            <p className="text-base text-slate-700 leading-relaxed font-medium">
              {narratorText}
            </p>
          </div>
        </div>
      )}

      {/* 关卡渲染 */}
      {level === 1 && <Level1 onComplete={() => setLevel(2)} setNarratorText={setNarratorText} />}
      {level === 2 && <Level2 onComplete={() => setLevel(3)} setNarratorText={setNarratorText} />}
      {level === 3 && <Level3 onComplete={() => setLevel(4)} setNarratorText={setNarratorText} />}
      {level === 4 && <Level4 onComplete={() => setLevel(5)} setNarratorText={setNarratorText} />}
      {level === 5 && <MiniGame setNarratorText={setNarratorText} />}
    </div>
  );
}
