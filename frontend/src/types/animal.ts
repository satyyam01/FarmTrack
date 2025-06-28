export type AnimalType = 'Cow' | 'Goat' | 'Hen' | 'Horse' | 'Sheep';

export interface Animal {
  id?: number;
  _id?: string;
  name: string;
  tag_number: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  is_producing_yield: boolean | null;
  under_treatment: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnimalFormData {
  name: string;
  tag_number: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  is_producing_yield?: boolean;
  under_treatment?: boolean;
}
