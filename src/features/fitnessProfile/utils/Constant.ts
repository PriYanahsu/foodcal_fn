import { Goals, Stats } from "../type";

export const ACTIVITY_LEVELS = [
    'Sedentary',
    'Lightly Active',
    'Moderately Active',
    'Very Active',
  ] as const;
  
export const EMPTY_STATS: Stats = {
    gender: '',
    age: '',
    height: '',
    weight: '',
    activity_level: '',
  };
  
export const EMPTY_GOALS: Goals = {
    objective: '',
    target_weight: '',
    target_date: '',
  };
  