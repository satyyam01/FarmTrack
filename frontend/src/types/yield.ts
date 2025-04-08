export type YieldType = 'Cow' | 'Goat' | 'Hen';
export type YieldPeriod = 'day' | 'week' | 'month';
export type UnitType = 'milk' | 'egg';

export interface Yield {
  id: number;
  animal_id: number;
  date: string;
  quantity: number;
  unit_type: UnitType;
  created_at: string;
  updated_at: string;
  animal?: {
    id: number;
    name: string;
    tag_number: string;
    type: YieldType;
  };
}

export interface YieldFormData {
  animal_id: number;
  quantity: number;
  date: string;
  unit_type: UnitType;
}

export interface YieldStats {
  total: number;
  average: number;
  animalCount: number;
  yields: Yield[];
  animals: Array<{
    id: number;
    name: string;
    tag_number: string;
    type: YieldType;
    todayYield: number;
    averageYield: number;
  }>;
  animalsByType: {
    Cow: number;
    Goat: number;
    Hen: number;
  };
}

export interface YieldOverview {
  daily: YieldStats;
  weekly: YieldStats;
  monthly: YieldStats;
  animals: Array<{
    id: number;
    name: string;
    tag_number: string;
    type: YieldType;
    todayYield: number;
    averageYield: number;
  }>;
} 