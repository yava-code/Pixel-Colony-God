import { Peep, PeepState, Quest, QuestType, Vector2 } from '../types';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const SPEED = 2;

// Colors based on age groups
export const getPeepColor = (age: number): string => {
  if (age < 10) return '#A7F3D0'; // Baby green
  if (age < 25) return '#34D399'; // Young green
  if (age < 50) return '#60A5FA'; // Adult blue
  if (age < 75) return '#818CF8'; // Older indigo
  return '#F87171'; // Elderly red
};

export const createPeep = (x: number, y: number, ageOverride?: number): Peep => {
  const age = ageOverride ?? Math.floor(Math.random() * 60) + 5;
  return {
    id: Math.random().toString(36).substr(2, 9),
    pos: { x, y },
    vel: { x: 0, y: 0 },
    age,
    color: getPeepColor(age),
    state: PeepState.IDLE,
    stateTimer: Math.floor(Math.random() * 60) + 30,
    size: 16, // pixels
  };
};

export const updatePeep = (peep: Peep, bounds: { width: number; height: number }): Peep => {
  let { pos, vel, state, stateTimer, age } = peep;
  let newPos = { ...pos };
  let newVel = { ...vel };
  let newState = state;
  let newTimer = stateTimer - 1;

  // State Machine
  if (newTimer <= 0) {
    if (state === PeepState.IDLE) {
      newState = PeepState.WALKING;
      newTimer = Math.floor(Math.random() * 120) + 60;
      // Pick random direction
      const angle = Math.random() * Math.PI * 2;
      newVel = {
        x: Math.cos(angle) * SPEED,
        y: Math.sin(angle) * SPEED,
      };
    } else {
      newState = PeepState.IDLE;
      newTimer = Math.floor(Math.random() * 60) + 30;
      newVel = { x: 0, y: 0 };
    }
  }

  // Movement
  if (newState === PeepState.WALKING) {
    newPos.x += newVel.x;
    newPos.y += newVel.y;

    // Bounce off walls
    if (newPos.x < 0) { newPos.x = 0; newVel.x *= -1; }
    if (newPos.x > bounds.width - peep.size) { newPos.x = bounds.width - peep.size; newVel.x *= -1; }
    if (newPos.y < 0) { newPos.y = 0; newVel.y *= -1; }
    if (newPos.y > bounds.height - peep.size) { newPos.y = bounds.height - peep.size; newVel.y *= -1; }
  }

  // Very slow aging (1 year every ~600 frames/10 seconds at 60fps)
  // To make it noticeable in game, let's say 1 year every 5 seconds (300 frames)
  // We won't increment actual age property here continuously to avoid float issues, 
  // but we assume the game loop handles an "age ticker" externally or we just rely on tools.
  // For simplicity, let's keep age static unless modified by god tools.

  return {
    ...peep,
    pos: newPos,
    vel: newVel,
    state: newState,
    stateTimer: newTimer,
    color: getPeepColor(age), // Update color in case age changed
  };
};

export const generateQuest = (currentStats: { population: number, avgAge: number }): Quest => {
  const types = Object.values(QuestType);
  const type = types[Math.floor(Math.random() * types.length)];
  
  let target = 0;
  let description = '';

  switch (type) {
    case QuestType.LOWER_POPULATION:
      target = Math.max(0, currentStats.population - Math.floor(Math.random() * 5 + 3));
      description = `Снизить население до ${target}`;
      break;
    case QuestType.RAISE_POPULATION:
      target = currentStats.population + Math.floor(Math.random() * 5 + 3);
      description = `Поднять население до ${target}`;
      break;
    case QuestType.LOWER_AVG_AGE:
      target = Math.max(10, Math.floor(currentStats.avgAge - 5));
      description = `Средний возраст ниже ${target} лет`;
      break;
    case QuestType.RAISE_AVG_AGE:
      target = Math.min(90, Math.floor(currentStats.avgAge + 5));
      description = `Средний возраст выше ${target} лет`;
      break;
    case QuestType.PURGE_ELDERS:
      target = 60;
      description = `Убрать всех старше ${target} лет`;
      break;
  }

  return { type, target, description };
};

export const checkQuestCompletion = (quest: Quest, peeps: Peep[]): boolean => {
  if (peeps.length === 0) return false;

  const totalAge = peeps.reduce((sum, p) => sum + p.age, 0);
  const avgAge = totalAge / peeps.length;

  switch (quest.type) {
    case QuestType.LOWER_POPULATION:
      return peeps.length <= quest.target;
    case QuestType.RAISE_POPULATION:
      return peeps.length >= quest.target;
    case QuestType.LOWER_AVG_AGE:
      return avgAge < quest.target;
    case QuestType.RAISE_AVG_AGE:
      return avgAge > quest.target;
    case QuestType.PURGE_ELDERS:
      return !peeps.some(p => p.age > quest.target);
    default:
      return false;
  }
};
