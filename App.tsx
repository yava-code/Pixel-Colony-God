import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Peep, Tool, Quest, GameStats, Vector2, QuestType } from './types';
import { createPeep, updatePeep, generateQuest, checkQuestCompletion, getPeepColor } from './services/gameLogic';
import { 
  Skull, 
  PlusCircle, 
  MinusCircle, 
  UserPlus, 
  MousePointer2, 
  Trophy,
  Users,
  Activity,
  HeartPulse
} from 'lucide-react';

const FPS = 60;
const INITIAL_POPULATION = 10;

const App: React.FC = () => {
  // Game State
  const [peeps, setPeeps] = useState<Peep[]>([]);
  const [score, setScore] = useState(0);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>(Tool.SELECT);
  const [lastActionTime, setLastActionTime] = useState(0);

  // Refs for loop
  const peepsRef = useRef<Peep[]>([]);
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
  }, []);

  // Helper to sync ref and state for rendering (throttled if needed, but 60fps React state is usually okay for < 100 elements)
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

  // Game Loop
  const animate = useCallback(() => {
    const bounds = {
      width: containerRef.current?.clientWidth || window.innerWidth,
      height: containerRef.current?.clientHeight || window.innerHeight,
    };

    peepsRef.current = peepsRef.current.map(p => updatePeep(p, bounds));
    setPeeps([...peepsRef.current]); // Trigger re-render

    // Check Quest
    setQuest(prevQuest => {
      if (prevQuest && checkQuestCompletion(prevQuest, peepsRef.current)) {
        scoreRef.current += 100;
        setScore(scoreRef.current);
        // Generate new quest based on NEW stats
        const currentStats = calculateStats(peepsRef.current);
        return generateQuest(currentStats);
      }
      return prevQuest;
    });

    requestRef.current = requestAnimationFrame(animate);
  }, []);

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

    if (selectedTool === Tool.SPAWN) {
       // Spawn tool doesn't need a target
       newPeeps.push(createPeep(x - 8, y - 8, 18)); // Spawn 18 year olds
       actionTriggered = true;
    } else if (clickedPeepIndex !== -1) {
      const target = newPeeps[clickedPeepIndex];
      
      switch (selectedTool) {
        case Tool.KILL:
          newPeeps.splice(clickedPeepIndex, 1);
          actionTriggered = true;
          break;
        case Tool.AGE_UP:
          target.age = Math.min(100, target.age + 5);
          target.color = getPeepColor(target.age);
          actionTriggered = true;
          break;
        case Tool.AGE_DOWN:
          target.age = Math.max(0, target.age - 5);
          target.color = getPeepColor(target.age);
          actionTriggered = true;
          break;
        case Tool.SELECT:
          // Just visual feedback maybe?
          break;
      }
    }

    if (actionTriggered) {
      peepsRef.current = newPeeps;
      setPeeps(newPeeps); // Instant update for feedback
      setLastActionTime(Date.now());
      
      // Feedback effect could be added here
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
        className={`w-full h-full cursor-${selectedTool === Tool.SELECT ? 'default' : 'crosshair'}`}
        onClick={handleContainerClick}
      >
        {peeps.map(peep => (
          <div
            key={peep.id}
            style={{
              transform: `translate(${peep.pos.x}px, ${peep.pos.y}px)`,
              width: `${peep.size}px`,
              height: `${peep.size}px`,
              backgroundColor: peep.color,
            }}
            className="absolute border-2 border-black shadow-sm transition-transform duration-75 will-change-transform group"
          >
            {/* Simple face */}
            <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-black opacity-60"></div>
            <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-black opacity-60"></div>
            <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[10%] bg-black opacity-60"></div>
            
            {/* Age indicator on hover or if Select tool is active */}
            <div className={`
              absolute -top-4 left-1/2 -translate-x-1/2 
              text-[8px] text-white whitespace-nowrap bg-black/50 px-1 rounded pointer-events-none
              transition-opacity duration-200
              ${selectedTool === Tool.SELECT ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
              {peep.age} лет
            </div>
          </div>
        ))}
      </div>

      {/* Left UI: Stats */}
      <div className="absolute top-4 left-4 bg-gray-800 border-4 border-gray-600 p-4 rounded-sm shadow-xl w-64">
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

      {/* Right UI: Quests */}
      <div className="absolute top-4 right-4 bg-gray-800 border-4 border-yellow-600 p-4 rounded-sm shadow-xl w-64">
         <h2 className="text-yellow-400 text-xs mb-4 uppercase tracking-widest border-b-2 border-yellow-600 pb-2 flex items-center gap-2">
          <Trophy size={14} /> Задания
        </h2>
        <div className="mb-4">
           <div className="text-xs text-gray-300 leading-5 mb-2 min-h-[40px]">
             {quest ? quest.description : "Загрузка..."}
           </div>
           <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
             <div className="bg-yellow-500 h-full w-full animate-pulse"></div>
           </div>
        </div>
        <div className="text-right text-yellow-500 text-sm">
          Счет: {score}
        </div>
      </div>

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
  // Map simple color names to tailwind classes roughly
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
    >
      <div className="mb-2">{icon}</div>
      <span className="text-[8px] uppercase tracking-tighter">{label}</span>
    </button>
  );
};

export default App;