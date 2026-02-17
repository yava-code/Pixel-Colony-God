export type Vector2 = { x: number; y: number };

export enum ElementType {
  EMPTY = 'EMPTY',
  SAND = 'SAND',
  WATER = 'WATER',
  FIRE = 'FIRE',
  ICE = 'ICE',
  STEAM = 'STEAM',
  LAVA = 'LAVA',
  STONE = 'STONE',
  WOOD = 'WOOD',
  PLANT = 'PLANT',
  ACID = 'ACID',
}

export interface Element {
  type: ElementType;
  color: string;
  temperature: number;
  age: number;
  velocity?: Vector2;
}

export enum BrushMode {
  POINT = 'POINT',
  LINE = 'LINE',
  CIRCLE = 'CIRCLE',
  SPRAY = 'SPRAY',
}

export enum ToolType {
  DRAW = 'DRAW',
  ERASE = 'ERASE',
  GRAB = 'GRAB',
  FOUNTAIN = 'FOUNTAIN',
}

export interface CanvasState {
  elements: (Element | null)[][];
  width: number;
  height: number;
}

export interface SandboxSettings {
  brushSize: number;
  brushMode: BrushMode;
  gravity: number;
  temperature: number;
  soundEnabled: boolean;
  particleQuality: 'low' | 'medium' | 'high';
}

export interface PeepState {
  IDLE: 'IDLE';
  WALKING: 'WALKING';
}

export interface Peep {
  id: string;
  pos: Vector2;
  vel: Vector2;
  age: number;
  color: string;
  state: keyof PeepState;
  stateTimer: number;
  size: number;
}

export enum QuestType {
  LOWER_POPULATION = 'LOWER_POPULATION',
  RAISE_POPULATION = 'RAISE_POPULATION',
  LOWER_AVG_AGE = 'LOWER_AVG_AGE',
  RAISE_AVG_AGE = 'RAISE_AVG_AGE',
  PURGE_ELDERS = 'PURGE_ELDERS',
}

export interface Quest {
  type: QuestType;
  target: number;
  description: string;
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

export interface UserProfile {
  id: string;
  username?: string;
  avatarColor: string;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface SavedCreation {
  id: string;
  title: string;
  description?: string;
  canvasData: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
}