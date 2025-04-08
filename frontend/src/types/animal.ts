export type AnimalType = 'Cow' | 'Goat' | 'Hen';

export interface Animal {
  id: number;
  name: string;
  tag_number: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  is_producing_yield: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalFormData {
  name: string;
  tag_number: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  is_producing_yield?: boolean;
}
