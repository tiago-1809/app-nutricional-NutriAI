'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, FoodItem, WaterLog, DailyProgress, WeightProgress, Recipe, WorkoutLog, Action, MealType } from '@/lib/types';
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateDailyWater, calculateDailyMacros, generateId } from '@/lib/utils-nutriai';

interface NutriAIContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  todayFoods: FoodItem[];
  addFood: (food: FoodItem) => void;
  removeFood: (id: string) => void;
  todayWater: WaterLog[];
  addWater: (amount: number, source?: string) => void;
  addWaterML: (ml: number, source?: string) => void;
  todayProgress: DailyProgress;
  weekProgress: DailyProgress[];
  weightHistory: WeightProgress[];
  addWeightEntry: (weight: number) => void;
  favoriteRecipes: Recipe[];
  toggleFavoriteRecipe: (recipeId: string) => void;
  workoutLogs: WorkoutLog[];
  logWorkout: (exerciseName: string, description: string, caloriesBurned: number) => void;
  logPredefinedWorkout: (exerciseId: string) => void;
  isOnboarded: boolean;
  actions: Action[];
  undoAction: (actionId: string) => void;
  getFoodsByMeal: (mealType: MealType) => FoodItem[];
}

const NutriAIContext = createContext<NutriAIContextType | undefined>(undefined);

export function NutriAIProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [todayFoods, setTodayFoods] = useState<FoodItem[]>([]);
  const [todayWater, setTodayWater] = useState<WaterLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightProgress[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('nutriai-user');
    const savedFoods = localStorage.getItem('nutriai-foods');
    const savedWater = localStorage.getItem('nutriai-water');
    const savedWeight = localStorage.getItem('nutriai-weight');
    const savedFavorites = localStorage.getItem('nutriai-favorites');
    const savedWorkouts = localStorage.getItem('nutriai-workouts');
    const savedActions = localStorage.getItem('nutriai-actions');

    if (savedUser) {
      setUserState(JSON.parse(savedUser));
      setIsOnboarded(true);
    }
    if (savedFoods) setTodayFoods(JSON.parse(savedFoods));
    if (savedWater) setTodayWater(JSON.parse(savedWater));
    if (savedWeight) setWeightHistory(JSON.parse(savedWeight));
    if (savedFavorites) setFavoriteRecipes(JSON.parse(savedFavorites));
    if (savedWorkouts) setWorkoutLogs(JSON.parse(savedWorkouts));
    if (savedActions) setActions(JSON.parse(savedActions));
  }, []);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    setIsOnboarded(true);
    localStorage.setItem('nutriai-user', JSON.stringify(newUser));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    
    // Recalcular calorias e macros se peso, objetivo ou nível de atividade mudaram
    if (updates.weight || updates.goal || updates.activityLevel) {
      const bmr = calculateBMR(
        updatedUser.weight, 
        updatedUser.height, 
        updatedUser.age, 
        updatedUser.biologicalSex
      );
      const tdee = calculateTDEE(bmr, updatedUser.activityLevel);
      updatedUser.dailyCalories = calculateDailyCalories(
        tdee, 
        updatedUser.goal, 
        updatedUser.weightLossWeeks
      );
      updatedUser.dailyMacros = calculateDailyMacros(
        updatedUser.dailyCalories,
        updatedUser.goal,
        updatedUser.weight
      );
      updatedUser.dailyWaterGoal = calculateDailyWater(
        updatedUser.weight, 
        updatedUser.activityLevel
      );
    }
    
    setUserState(updatedUser);
    localStorage.setItem('nutriai-user', JSON.stringify(updatedUser));
  };

  const addFood = (food: FoodItem) => {
    const updated = [...todayFoods, food];
    setTodayFoods(updated);
    localStorage.setItem('nutriai-foods', JSON.stringify(updated));
    
    // Adicionar à lista de ações
    const action: Action = {
      id: generateId(),
      type: 'add_food',
      data: food,
      timestamp: new Date(),
    };
    const updatedActions = [...actions, action];
    setActions(updatedActions);
    localStorage.setItem('nutriai-actions', JSON.stringify(updatedActions));
  };

  const removeFood = (id: string) => {
    const updated = todayFoods.filter(f => f.id !== id);
    setTodayFoods(updated);
    localStorage.setItem('nutriai-foods', JSON.stringify(updated));
  };

  const addWater = (amount: number, source: string = 'water') => {
    const log: WaterLog = {
      id: generateId(),
      amount,
      source,
      timestamp: new Date(),
    };
    const updated = [...todayWater, log];
    setTodayWater(updated);
    localStorage.setItem('nutriai-water', JSON.stringify(updated));
    
    // Adicionar à lista de ações
    const action: Action = {
      id: generateId(),
      type: 'add_water',
      data: log,
      timestamp: new Date(),
    };
    const updatedActions = [...actions, action];
    setActions(updatedActions);
    localStorage.setItem('nutriai-actions', JSON.stringify(updatedActions));
  };

  const addWaterML = (ml: number, source: string = 'water') => {
    addWater(ml / 1000, source);
  };

  const addWeightEntry = (weight: number) => {
    const entry: WeightProgress = {
      date: new Date().toISOString(),
      weight,
    };
    const updated = [...weightHistory, entry];
    setWeightHistory(updated);
    localStorage.setItem('nutriai-weight', JSON.stringify(updated));
    
    // Atualizar peso do usuário
    if (user) {
      updateUser({ weight });
    }
  };

  const toggleFavoriteRecipe = (recipeId: string) => {
    const updated = favoriteRecipes.map(r => 
      r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
    );
    setFavoriteRecipes(updated);
    localStorage.setItem('nutriai-favorites', JSON.stringify(updated));
  };

  const logWorkout = (exerciseName: string, description: string, caloriesBurned: number) => {
    const log: WorkoutLog = {
      id: generateId(),
      exerciseName,
      exerciseDescription: description,
      caloriesBurned,
      completed: true,
      date: new Date(),
    };
    const updated = [...workoutLogs, log];
    setWorkoutLogs(updated);
    localStorage.setItem('nutriai-workouts', JSON.stringify(updated));
    
    // Adicionar à lista de ações
    const action: Action = {
      id: generateId(),
      type: 'add_workout',
      data: log,
      timestamp: new Date(),
    };
    const updatedActions = [...actions, action];
    setActions(updatedActions);
    localStorage.setItem('nutriai-actions', JSON.stringify(updatedActions));
  };

  const logPredefinedWorkout = (exerciseId: string) => {
    const log: WorkoutLog = {
      id: generateId(),
      exerciseId,
      exerciseName: 'Exercício',
      caloriesBurned: 0,
      completed: true,
      date: new Date(),
    };
    const updated = [...workoutLogs, log];
    setWorkoutLogs(updated);
    localStorage.setItem('nutriai-workouts', JSON.stringify(updated));
  };

  const undoAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    switch (action.type) {
      case 'add_food':
        const food = action.data as FoodItem;
        removeFood(food.id);
        break;
      case 'add_water':
        const water = action.data as WaterLog;
        const updatedWater = todayWater.filter(w => w.id !== water.id);
        setTodayWater(updatedWater);
        localStorage.setItem('nutriai-water', JSON.stringify(updatedWater));
        break;
      case 'add_workout':
        const workout = action.data as WorkoutLog;
        const updatedWorkouts = workoutLogs.filter(w => w.id !== workout.id);
        setWorkoutLogs(updatedWorkouts);
        localStorage.setItem('nutriai-workouts', JSON.stringify(updatedWorkouts));
        break;
    }

    // Remover ação da lista
    const updatedActions = actions.filter(a => a.id !== actionId);
    setActions(updatedActions);
    localStorage.setItem('nutriai-actions', JSON.stringify(updatedActions));
  };

  const getFoodsByMeal = (mealType: MealType): FoodItem[] => {
    return todayFoods.filter(f => f.mealType === mealType);
  };

  // Calcular progresso do dia
  const totalWaterConsumed = todayWater.reduce((sum, w) => sum + w.amount, 0);
  const todayWorkoutsFiltered = workoutLogs.filter(w => {
    const logDate = new Date(w.date).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });
  const totalCaloriesBurned = todayWorkoutsFiltered.reduce((sum, w) => sum + w.caloriesBurned, 0);

  const todayProgress: DailyProgress = {
    date: new Date().toISOString(),
    caloriesConsumed: todayFoods.reduce((sum, f) => sum + f.calories, 0),
    caloriesBurned: totalCaloriesBurned,
    macros: {
      carbs: todayFoods.reduce((sum, f) => sum + f.macros.carbs, 0),
      protein: todayFoods.reduce((sum, f) => sum + f.macros.protein, 0),
      fat: todayFoods.reduce((sum, f) => sum + f.macros.fat, 0),
    },
    waterConsumed: totalWaterConsumed,
    workoutsCompleted: todayWorkoutsFiltered.length,
  };

  // Progresso semanal (mock - em produção viria do banco)
  const weekProgress: DailyProgress[] = [todayProgress];

  return (
    <NutriAIContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        todayFoods,
        addFood,
        removeFood,
        todayWater,
        addWater,
        addWaterML,
        todayProgress,
        weekProgress,
        weightHistory,
        addWeightEntry,
        favoriteRecipes,
        toggleFavoriteRecipe,
        workoutLogs,
        logWorkout,
        logPredefinedWorkout,
        isOnboarded,
        actions,
        undoAction,
        getFoodsByMeal,
      }}
    >
      {children}
    </NutriAIContext.Provider>
  );
}

export function useNutriAI() {
  const context = useContext(NutriAIContext);
  if (!context) {
    throw new Error('useNutriAI must be used within NutriAIProvider');
  }
  return context;
}
