export type Vector2 = { x: number; y: number };

export enum PeepState {
  IDLE = 'IDLE',
  WALKING = 'WALKING',
}

export interface Peep {
  id: string;
  pos: Vector2;
  vel: Vector2;
  age: number;
  color: string;
  state: PeepState;
  stateTimer: number; // Frames until next state change
  size: number;
}

export enum QuestType {
  LOWER_POPULATION = 'LOWER_POPULATION',
  RAISE_POPULATION = 'RAISE_POPULATION',
  LOWER_AVG_AGE = 'LOWER_AVG_AGE',
  RAISE_AVG_AGE = 'RAISE_AVG_AGE',
  PURGE_ELDERS = 'PURGE_ELDERS', // No one over X age
}

export interface Quest {
  type: QuestType;
  target: number;
  description: string;
}

export enum Tool {
  SELECT = 'select',
  KILL = 'kill',
  AGE_UP = 'age_up',
  AGE_DOWN = 'age_down',
  SPAWN = 'spawn',
}

export interface GameStats {
  population: number;
  avgAge: number;
  maxAge: number;
}

export interface Particle {
  id: string;
  pos: Vector2;
  vel: Vector2;
  color: string;
  life: number;
  size: number;
}

export interface HighScore {
  date: number;
  score: number;
  population: number;
}