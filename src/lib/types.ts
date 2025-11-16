// Tipos do NutriAI Brasil

export type UserGoal = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type WorkoutPriority = 'strength' | 'cardio' | 'flexibility' | 'weight_loss' | 'muscle_gain';
export type WorkoutDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type BiologicalSex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  biologicalSex: BiologicalSex; // Sexo biológico para cálculos
  gender?: string; // Gênero (opcional)
  weight: number; // kg
  height: number; // cm
  goal: UserGoal;
  activityLevel: ActivityLevel; // Nível de atividade física
  weightLossWeeks?: number; // Tempo desejado para emagrecer (em semanas)
  dailyCalories: number;
  dailyMacros: MacroNutrients; // Macros calculados automaticamente
  dailyWaterGoal: number; // litros
  targetWeight?: number; // kg - peso meta
  workoutPriorities?: WorkoutPriority[];
  createdAt: Date;
}

export interface MacroNutrients {
  carbs: number; // gramas
  protein: number; // gramas
  fat: number; // gramas
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  quantity: number;
  calories: number;
  macros: MacroNutrients;
  mealType: MealType; // Nova propriedade
  timestamp: Date;
}

export interface WaterLog {
  id: string;
  amount: number; // litros
  source?: string; // 'water' | 'juice' | 'other'
  timestamp: Date;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    macros: MacroNutrients;
    servings: number;
  };
  isFavorite: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets?: number;
  reps?: string;
  duration?: number; // minutos
  category: 'home' | 'gym' | 'custom';
  caloriesBurned?: number;
}

export interface WorkoutLog {
  id: string;
  exerciseId?: string;
  exerciseName: string;
  exerciseDescription?: string;
  caloriesBurned: number;
  completed: boolean;
  date: Date;
}

export interface WorkoutPlan {
  day: WorkoutDay;
  exercises: string[]; // IDs dos exercícios
}

export interface NutritionMyth {
  id: string;
  myth: string;
  explanation: string;
}

export interface NutritionTip {
  id: string;
  title: string;
  description: string;
  examples: string[];
}

export interface DailyProgress {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number; // Nova propriedade
  macros: MacroNutrients;
  waterConsumed: number;
  workoutsCompleted: number;
}

export interface WeightProgress {
  date: string;
  weight: number;
}

// Tipos para sistema de desfazer ações
export type ActionType = 'add_food' | 'add_water' | 'add_workout';

export interface Action {
  id: string;
  type: ActionType;
  data: FoodItem | WaterLog | WorkoutLog;
  timestamp: Date;
}
