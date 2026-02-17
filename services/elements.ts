import { ElementType, Element, Vector2 } from '../types';

export const ELEMENT_COLORS: Record<ElementType, string> = {
  [ElementType.EMPTY]: 'rgba(0, 0, 0, 0)',
  [ElementType.SAND]: '#E8D4B8',
  [ElementType.WATER]: '#3B82F6',
  [ElementType.FIRE]: '#F97316',
  [ElementType.ICE]: '#E0F2FE',
  [ElementType.STEAM]: '#F0F9FF',
  [ElementType.LAVA]: '#DC2626',
  [ElementType.STONE]: '#71717A',
  [ElementType.WOOD]: '#92400E',
  [ElementType.PLANT]: '#22C55E',
  [ElementType.ACID]: '#A3E635',
};

export const createElement = (type: ElementType, temperature: number = 20): Element => {
  return {
    type,
    color: ELEMENT_COLORS[type],
    temperature,
    age: 0,
    velocity: { x: 0, y: 0 },
  };
};

export const updateElement = (element: Element | null, x: number, y: number, grid: (Element | null)[][], gravity: number): Element | null => {
  if (!element || element.type === ElementType.EMPTY) return null;

  const newElement = { ...element };
  newElement.age += 1;
  newElement.temperature *= 0.98;

  if (newElement.temperature < 0) newElement.temperature = 0;
  if (newElement.temperature > 1000) newElement.temperature = 1000;

  const width = grid[0]?.length || 0;
  const height = grid.length || 0;

  switch (element.type) {
    case ElementType.SAND:
      return updateSand(newElement, x, y, grid, gravity);
    case ElementType.WATER:
      return updateWater(newElement, x, y, grid, gravity);
    case ElementType.FIRE:
      return updateFire(newElement, x, y, grid);
    case ElementType.ICE:
      return updateIce(newElement, x, y, grid);
    case ElementType.STEAM:
      return updateSteam(newElement, x, y, grid);
    case ElementType.LAVA:
      return updateLava(newElement, x, y, grid, gravity);
    case ElementType.ACID:
      return updateAcid(newElement, x, y, grid, gravity);
    default:
      return newElement;
  }
};

const updateSand = (element: Element, x: number, y: number, grid: (Element | null)[][], gravity: number): Element => {
  const below = grid[y + 1]?.[x];
  if (y + 1 < grid.length && (!below || below.type === ElementType.EMPTY || below.type === ElementType.WATER)) {
    return element;
  }

  const diagonalLeft = grid[y + 1]?.[x - 1];
  const diagonalRight = grid[y + 1]?.[x + 1];

  if (x - 1 >= 0 && diagonalLeft && diagonalLeft.type === ElementType.EMPTY) {
    return element;
  }
  if (x + 1 < grid[0].length && diagonalRight && diagonalRight.type === ElementType.EMPTY) {
    return element;
  }

  return element;
};

const updateWater = (element: Element, x: number, y: number, grid: (Element | null)[][], gravity: number): Element => {
  const below = grid[y + 1]?.[x];
  if (y + 1 < grid.length && (!below || below.type === ElementType.EMPTY)) {
    return element;
  }

  if (element.temperature > 100) {
    return { ...element, type: ElementType.STEAM };
  }

  return element;
};

const updateFire = (element: Element, x: number, y: number, grid: (Element | null)[][]): Element | null => {
  element.temperature -= 20;

  if (element.temperature <= 0) {
    return null;
  }

  const neighbors = [
    grid[y - 1]?.[x],
    grid[y + 1]?.[x],
    grid[y]?.[x - 1],
    grid[y]?.[x + 1],
  ];

  for (const neighbor of neighbors) {
    if (neighbor?.type === ElementType.WOOD || neighbor?.type === ElementType.PLANT) {
      neighbor.temperature = Math.min(1000, neighbor.temperature + 100);
    }
  }

  return element;
};

const updateIce = (element: Element, x: number, y: number, grid: (Element | null)[][]): Element => {
  if (element.temperature > 0) {
    return { ...element, type: ElementType.WATER };
  }
  return element;
};

const updateSteam = (element: Element, x: number, y: number, grid: (Element | null)[][]): Element | null => {
  if (element.temperature < 100) {
    return { ...element, type: ElementType.WATER };
  }
  element.temperature -= 5;
  return element.age > 100 ? null : element;
};

const updateLava = (element: Element, x: number, y: number, grid: (Element | null)[][], gravity: number): Element => {
  if (element.temperature < 700) {
    return { ...element, type: ElementType.STONE };
  }

  const below = grid[y + 1]?.[x];
  if (y + 1 < grid.length && (!below || below.type === ElementType.EMPTY || below.type === ElementType.WATER)) {
    return element;
  }

  return element;
};

const updateAcid = (element: Element, x: number, y: number, grid: (Element | null)[][], gravity: number): Element => {
  const neighbors = [
    { el: grid[y - 1]?.[x], x, y: y - 1 },
    { el: grid[y + 1]?.[x], x, y: y + 1 },
    { el: grid[y]?.[x - 1], x: x - 1, y },
    { el: grid[y]?.[x + 1], x: x + 1, y },
  ];

  for (const { el } of neighbors) {
    if (el && el.type !== ElementType.EMPTY && el.type !== ElementType.ACID) {
      return element;
    }
  }

  return element;
};

export const getElementTemperatureColor = (element: Element): string => {
  if (element.temperature < 40) return element.color;

  const hue = Math.max(0, 60 - (element.temperature / 1000) * 60);
  const saturation = Math.min(100, (element.temperature / 300) * 100);
  const lightness = Math.max(30, 70 - (element.temperature / 500) * 40);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
