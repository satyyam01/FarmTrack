export type AnimalType = 'Cow' | 'Goat' | 'Hen';

export interface Animal {
  _id: string;
  name: string;
  tagNumber: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  lastPregnancyDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalFormData {
  name: string;
  tagNumber: string;
  age: number;
  gender: 'Male' | 'Female';
  type: AnimalType;
  lastPregnancyDate?: string;
}
