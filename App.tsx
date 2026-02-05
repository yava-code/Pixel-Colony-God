import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peep, Tool, Quest, GameStats, Vector2, QuestType, Particle, HighScore } from './types';
import { 
  createPeep, 
  updatePeep, 
  generateQuest, 
  checkQuestCompletion, 
  getPeepColor, 
  createExplosion, 
  updateParticle 
} from './services/gameLogic';
import { 
  Skull, 
  PlusCircle, 
  MinusCircle, 
  UserPlus, 
  MousePointer2, 
  Trophy,
  Users,
  Activity,
  HeartPulse,
  Save,
  X
} from 'lucide-react';

const FPS = 60;
const INITIAL_POPULATION = 10;
const STORAGE_KEY = 'pixel_colony_leaderboard';

const App: React.FC = () => {
  // Game State
  const [peeps, setPeeps] = useState<Peep[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tool.SELECT);
  const [hoveredPeepId, setHoveredPeepId] = useState<string | null>(null);
  
  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Refs for loop
  const peepsRef = useRef<Peep[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef(0);

  // Initialize
  useEffect(() => {
    const initialPeeps = Array.from({ length: INITIAL_POPULATION }).map(() => 
      createPeep(
        Math.random() * (window.innerWidth - 100), 
        Math.random() * (window.innerHeight - 200)
      )
    );
    peepsRef.current = initialPeeps;
    setPeeps(initialPeeps);
    
    // Initial Quest
    const initialStats = calculateStats(initialPeeps);
    setQuest(generateQuest(initialStats));
    
    // Load Leaderboard
    const savedScores = localStorage.getItem(STORAGE_KEY);
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Helper to sync ref and state for rendering
  const calculateStats = (currentPeeps: Peep[]): GameStats => {
    if (currentPeeps.length === 0) return { population: 0, avgAge: 0, maxAge: 0 };
    const totalAge = currentPeeps.reduce((acc, p) => acc + p.age, 0);
    const maxAge = Math.max(...currentPeeps.map(p => p.age));
    return {
      population: currentPeeps.length,
      avgAge: Math.floor(totalAge / currentPeeps.length),
      maxAge
    };
  };

  const stats = calculateStats(peeps);

  const saveScore = () => {
    const newScore: HighScore = {
      date: Date.now(),
      score: scoreRef.current,
      population: peepsRef.current.length
    };
    const newScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10
    
    setHighScores(newScores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
  };

  // Game Loop
  const animate = useCallback(() => {
    const bounds = {
      width: containerRef.current?.clientWidth || window.innerWidth,
      height: containerRef.current?.clientHeight || window.innerHeight,
    };

    // Update Particles
    particlesRef.current = particlesRef.current
      .map(updateParticle)
      .filter(p => p.life > 0);
    setParticles([...particlesRef.current]);

    // Update Peeps
    // Pass true for isPaused if the peep is currently hovered
    peepsRef.current = peepsRef.current.map(p => 
      updatePeep(p, bounds, p.id === hoveredPeepId)
    );
    setPeeps([...peepsRef.current]); 

    // Check Quest
    setQuest(prevQuest => {
      if (prevQuest && checkQuestCompletion(prevQuest, peepsRef.current)) {
        scoreRef.current += 100;
        setScore(scoreRef.current);
        
        // Spawn confetti particles from center
        particlesRef.current.push(
          ...createExplosion(bounds.width/2, bounds.height/2, '#FBBF24', 20)
        );

        // Generate new quest
        const currentStats = calculateStats(peepsRef.current);
        return generateQuest(currentStats);
      }
      return prevQuest;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, [hoveredPeepId]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // Interaction
  const handleInteraction = (x: number, y: number) => {
    const clickRadius = 30;
    
    // Find peep under cursor
    const clickedPeepIndex = peepsRef.current.findIndex(p => {
      const dx = (p.pos.x + p.size/2) - x;
      const dy = (p.pos.y + p.size/2) - y;
      return Math.sqrt(dx*dx + dy*dy) < clickRadius;
    });

    let newPeeps = [...peepsRef.current];
    let actionTriggered = false;
    let particleColor = '#ffffff';

    if (selectedTool === Tool.SPAWN) {
       newPeeps.push(createPeep(x - 8, y - 8, 18));
       actionTriggered = true;
       particleColor = '#34D399'; // Green
    } else if (clickedPeepIndex !== -1) {
      const target = newPeeps[clickedPeepIndex];
      
      switch (selectedTool) {
        case Tool.KILL:
          newPeeps.splice(clickedPeepIndex, 1);
          actionTriggered = true;
          particleColor = '#EF4444'; // Red blood
          break;
        case Tool.AGE_UP:
          target.age = Math.min(100, target.age + 5);
          target.color = getPeepColor(target.age);
          actionTriggered = true;
          particleColor = '#FBBF24'; // Gold
          break;
        case Tool.AGE_DOWN:
          target.age = Math.max(0, target.age - 5);
          target.color = getPeepColor(target.age);
          actionTriggered = true;
          particleColor = '#60A5FA'; // Blue magic
          break;
        case Tool.SELECT:
          // Just visual feedback
          actionTriggered = true;
          particleColor = '#ffffff';
          break;
      }
    }

    if (actionTriggered) {
      peepsRef.current = newPeeps;
      setPeeps(newPeeps);
      
      // Spawn particles
      const newParticles = createExplosion(x, y, particleColor);
      particlesRef.current.push(...newParticles);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleInteraction(x, y);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 text-white overflow-hidden select-none">
      
      {/* Game Field */}
      <div 
        ref={containerRef}
        className={`w-full h-full cursor-${selectedTool === Tool.SELECT ? 'default' : 'crosshair'} relative`}
        onClick={handleContainerClick}
      >
        {peeps.map(peep => (
          <div
            key={peep.id}
            onMouseEnter={() => setHoveredPeepId(peep.id)}
            onMouseLeave={() => setHoveredPeepId(null)}
            style={{
              transform: `translate(${peep.pos.x}px, ${peep.pos.y}px)`,
              width: `${peep.size}px`,
              height: `${peep.size}px`,
              backgroundColor: peep.color,
            }}
            className={`
              absolute border-2 border-black shadow-sm transition-transform duration-75 will-change-transform group
              ${peep.id === hoveredPeepId ? 'z-10 scale-110 border-white' : ''}
            `}
          >
            {/* Simple face */}
            <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-black opacity-60"></div>
            <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-black opacity-60"></div>
            <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[10%] bg-black opacity-60"></div>
            
            {/* Age indicator */}
            <div className={`
              absolute -top-6 left-1/2 -translate-x-1/2 
              text-[8px] text-white whitespace-nowrap bg-black/70 px-1 py-0.5 rounded pointer-events-none
              transition-opacity duration-200 z-20
              ${peep.id === hoveredPeepId || selectedTool === Tool.SELECT ? 'opacity-100' : 'opacity-0'}
            `}>
              {peep.age} лет
            </div>
          </div>
        ))}
        
        {/* Particles Layer */}
        {particles.map(p => (
           <div
             key={p.id}
             style={{
               transform: `translate(${p.pos.x}px, ${p.pos.y}px)`,
               width: `${p.size}px`,
               height: `${p.size}px`,
               backgroundColor: p.color,
               opacity: p.life
             }}
             className="absolute pointer-events-none rounded-full"
           />
        ))}
      </div>

      {/* Left UI: Stats */}
      <div className="absolute top-4 left-4 bg-gray-800 border-4 border-gray-600 p-4 rounded-sm shadow-xl w-64 pointer-events-none">
        <h2 className="text-yellow-400 text-xs mb-4 uppercase tracking-widest border-b-2 border-gray-600 pb-2 flex items-center gap-2">
          <Activity size={14} /> Колония
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-400"><Users size={12}/> Жители:</span>
            <span className="text-green-400">{stats.population}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-400"><HeartPulse size={12}/> Ср. возраст:</span>
            <span className="text-blue-400">{stats.avgAge}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-400"><Skull size={12}/> Макс. возраст:</span>
            <span className="text-red-400">{stats.maxAge}</span>
          </div>
        </div>
      </div>

      {/* Right UI: Quests & Score */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="bg-gray-800 border-4 border-yellow-600 p-4 rounded-sm shadow-xl w-64">
           <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-600 pb-2">
             <h2 className="text-yellow-400 text-xs uppercase tracking-widest flex items-center gap-2">
               <Trophy size={14} /> Задания
             </h2>
             <button 
               onClick={() => setShowLeaderboard(true)}
               className="text-[10px] bg-yellow-900 hover:bg-yellow-700 text-yellow-200 px-2 py-1 rounded border border-yellow-500 uppercase"
               title="Лидерборд"
             >
               Топ
             </button>
           </div>
          <div className="mb-4">
             <div className="text-xs text-gray-300 leading-5 mb-2 min-h-[40px]">
               {quest ? quest.description : "Загрузка..."}
             </div>
             <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
               <div className="bg-yellow-500 h-full w-full animate-pulse"></div>
             </div>
          </div>
          <div className="text-right text-yellow-500 text-sm font-bold">
            Счет: {score}
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border-4 border-yellow-500 p-6 rounded-sm w-full max-w-md relative">
             <button 
               onClick={() => setShowLeaderboard(false)}
               className="absolute top-2 right-2 text-gray-400 hover:text-white"
             >
               <X size={24} />
             </button>
             
             <h2 className="text-xl text-yellow-400 mb-6 text-center font-bold uppercase tracking-widest flex justify-center items-center gap-3">
               <Trophy size={24} /> Зал Славы
             </h2>

             <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {highScores.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs py-4">Нет сохраненных рекордов</div>
                ) : (
                  highScores.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-700/50 p-2 rounded border border-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-600 font-bold text-sm w-4">#{idx + 1}</span>
                        <div className="flex flex-col">
                           <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                           <span className="text-[10px] text-gray-500">Поп: {entry.population}</span>
                        </div>
                      </div>
                      <span className="text-yellow-400 font-bold">{entry.score}</span>
                    </div>
                  ))
                )}
             </div>

             <div className="flex justify-center border-t border-gray-600 pt-4">
               <button 
                 onClick={saveScore}
                 className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-sm border-2 border-green-500 text-xs uppercase transition-colors"
               >
                 <Save size={16} /> Сохранить текущий результат
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Bottom UI: Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border-4 border-gray-600 p-2 rounded-sm shadow-xl flex gap-2">
        <ToolButton 
          active={selectedTool === Tool.SELECT} 
          onClick={() => setSelectedTool(Tool.SELECT)}
          icon={<MousePointer2 size={20} />}
          label="Курсор"
          color="gray"
        />
        <ToolButton 
          active={selectedTool === Tool.SPAWN} 
          onClick={() => setSelectedTool(Tool.SPAWN)}
          icon={<Users size={20} />}
          label="Родить"
          color="green"
        />
        <ToolButton 
          active={selectedTool === Tool.AGE_DOWN} 
          onClick={() => setSelectedTool(Tool.AGE_DOWN)}
          icon={<MinusCircle size={20} />}
          label="- Возраст"
          color="blue"
        />
        <ToolButton 
          active={selectedTool === Tool.AGE_UP} 
          onClick={() => setSelectedTool(Tool.AGE_UP)}
          icon={<PlusCircle size={20} />}
          label="+ Возраст"
          color="purple"
        />
        <ToolButton 
          active={selectedTool === Tool.KILL} 
          onClick={() => setSelectedTool(Tool.KILL)}
          icon={<Skull size={20} />}
          label="Убить"
          color="red"
        />
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-2 right-4 text-[8px] text-gray-500">
        Кликните на поле или фигуру для действия
      </div>
    </div>
  );
};

interface ToolButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ active, onClick, icon, label, color }) => {
  const getColorClass = (c: string, isActive: boolean) => {
    if (!isActive) return 'text-gray-400 hover:text-white hover:bg-gray-700 border-transparent';
    switch(c) {
      case 'red': return 'text-red-400 bg-red-900/30 border-red-500';
      case 'green': return 'text-green-400 bg-green-900/30 border-green-500';
      case 'blue': return 'text-blue-400 bg-blue-900/30 border-blue-500';
      case 'purple': return 'text-purple-400 bg-purple-900/30 border-purple-500';
      default: return 'text-white bg-gray-700 border-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-3 w-20 h-20 
        border-2 transition-all duration-100 rounded-sm
        ${getColorClass(color, active)}
      `}
      title={label}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-[8px] uppercase tracking-tighter">{label}</span>
    </button>
  );
};

export default App;