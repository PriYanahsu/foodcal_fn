export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'abs'
  | 'glutes'
  | 'traps'
  | 'lats'
  | 'cardio'
  | 'full_body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  steps: string[];
  tips?: string[];
  image?: string;
}
