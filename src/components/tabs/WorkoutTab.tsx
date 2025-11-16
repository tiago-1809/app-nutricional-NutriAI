'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import { Home, Dumbbell, CheckCircle2, Circle, Plus, Calendar, Search, Undo2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkoutPriority, WorkoutDay } from '@/lib/types';

const homeWorkouts = [
  {
    id: 'h1',
    name: 'Flexão de Braço',
    description: 'Exercício para peitoral, ombros e tríceps. Mantenha o corpo reto e desça até o peito quase tocar o chão.',
    sets: 3,
    reps: '12-15',
    category: 'home' as const,
    estimatedCalories: 50,
  },
  {
    id: 'h2',
    name: 'Agachamento Livre',
    description: 'Fortalece pernas e glúteos. Desça até as coxas ficarem paralelas ao chão.',
    sets: 4,
    reps: '15-20',
    category: 'home' as const,
    estimatedCalories: 80,
  },
  {
    id: 'h3',
    name: 'Prancha Abdominal',
    description: 'Fortalece o core e abdômen. Mantenha o corpo reto como uma prancha.',
    sets: 3,
    reps: '30-60s',
    category: 'home' as const,
    estimatedCalories: 40,
  },
  {
    id: 'h4',
    name: 'Burpee',
    description: 'Exercício completo de alta intensidade. Combina agachamento, prancha e salto.',
    sets: 3,
    reps: '10-12',
    category: 'home' as const,
    estimatedCalories: 100,
  },
  {
    id: 'h5',
    name: 'Mountain Climbers',
    description: 'Cardio e fortalecimento do core. Alterne as pernas rapidamente em posição de prancha.',
    sets: 3,
    reps: '20-30',
    category: 'home' as const,
    estimatedCalories: 70,
  },
];

const gymWorkouts = [
  {
    id: 'g1',
    name: 'Supino Reto',
    description: 'Desenvolvimento do peitoral. Use barra ou halteres, desça até o peito.',
    sets: 4,
    reps: '8-12',
    category: 'gym' as const,
    estimatedCalories: 90,
  },
  {
    id: 'g2',
    name: 'Agachamento com Barra',
    description: 'Exercício completo para pernas. Barra nas costas, desça controlado.',
    sets: 4,
    reps: '10-12',
    category: 'gym' as const,
    estimatedCalories: 120,
  },
  {
    id: 'g3',
    name: 'Levantamento Terra',
    description: 'Fortalece costas e posterior. Levante a barra mantendo as costas retas.',
    sets: 3,
    reps: '8-10',
    category: 'gym' as const,
    estimatedCalories: 130,
  },
  {
    id: 'g4',
    name: 'Desenvolvimento com Halteres',
    description: 'Trabalha ombros e tríceps. Empurre os halteres acima da cabeça.',
    sets: 3,
    reps: '10-12',
    category: 'gym' as const,
    estimatedCalories: 80,
  },
  {
    id: 'g5',
    name: 'Remada Curvada',
    description: 'Fortalece as costas. Puxe a barra em direção ao abdômen.',
    sets: 4,
    reps: '10-12',
    category: 'gym' as const,
    estimatedCalories: 85,
  },
  {
    id: 'g6',
    name: 'Rosca Direta',
    description: 'Desenvolvimento dos bíceps. Flexione os cotovelos mantendo-os fixos.',
    sets: 3,
    reps: '12-15',
    category: 'gym' as const,
    estimatedCalories: 60,
  },
];

const priorityNames: Record<WorkoutPriority, string> = {
  strength: 'Força',
  cardio: 'Cardio',
  flexibility: 'Flexibilidade',
  weight_loss: 'Perda de Peso',
  muscle_gain: 'Ganho de Massa',
};

const dayNames: Record<WorkoutDay, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export default function WorkoutTab() {
  const { workoutLogs, logWorkout, user, updateUser, actions, undoAction } = useNutriAI();
  const [selectedTab, setSelectedTab] = useState('workouts');
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customExercise, setCustomExercise] = useState({ name: '', description: '' });
  const [selectedPriorities, setSelectedPriorities] = useState<WorkoutPriority[]>(user?.workoutPriorities || []);
  const [showQuestionnaire, setShowQuestionnaire] = useState(!user?.workoutPriorities);

  const isCompleted = (exerciseId: string) => {
    return workoutLogs.some(log => {
      const logDate = new Date(log.date).toDateString();
      const today = new Date().toDateString();
      return log.exerciseId === exerciseId && logDate === today;
    });
  };

  const todayWorkouts = workoutLogs.filter(log => {
    const logDate = new Date(log.date).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });

  const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  const handleCustomExercise = async () => {
    if (!customExercise.name || !customExercise.description) return;

    // Simular estimativa de calorias por IA (em produção, chamaria API real)
    const estimatedCalories = Math.floor(Math.random() * 100) + 50; // 50-150 kcal

    logWorkout(customExercise.name, customExercise.description, estimatedCalories);
    setCustomExercise({ name: '', description: '' });
    setIsCustomDialogOpen(false);
  };

  const handleSavePriorities = () => {
    if (user) {
      updateUser({ workoutPriorities: selectedPriorities });
      setShowQuestionnaire(false);
    }
  };

  const togglePriority = (priority: WorkoutPriority) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const recentWorkoutActions = actions
    .filter(a => a.type === 'add_workout')
    .slice(-3)
    .reverse();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Treinos</h1>
        
        {/* Resumo do dia */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Treinos concluídos hoje</p>
              <p className="text-3xl font-bold text-purple-700">{todayWorkouts.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                {totalCaloriesBurned} kcal queimadas
              </p>
            </div>
            <Dumbbell className="w-12 h-12 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Questionário de Prioridades */}
      {showQuestionnaire && (
        <Card className="p-6 space-y-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="font-semibold text-gray-800">Quais são suas prioridades no treino?</h3>
          <p className="text-sm text-gray-600">Selecione uma ou mais opções:</p>
          <div className="space-y-3">
            {(Object.keys(priorityNames) as WorkoutPriority[]).map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={priority}
                  checked={selectedPriorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                />
                <Label htmlFor={priority} className="text-sm font-medium cursor-pointer">
                  {priorityNames[priority]}
                </Label>
              </div>
            ))}
          </div>
          <Button onClick={handleSavePriorities} className="w-full bg-sky-500 hover:bg-sky-600">
            Salvar Prioridades
          </Button>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Exercícios
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Planner
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar
          </TabsTrigger>
        </TabsList>

        {/* Exercícios Predefinidos */}
        <TabsContent value="workouts" className="space-y-4 mt-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedTab('workouts')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-1" />
              Em Casa
            </Button>
            <Button
              onClick={() => setSelectedTab('workouts')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Dumbbell className="w-4 h-4 mr-1" />
              Academia
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Treinos em Casa</h3>
            {homeWorkouts.map((exercise) => {
              const completed = isCompleted(exercise.id);
              
              return (
                <Card key={exercise.id} className={`p-4 ${completed ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                  <div className="flex items-start gap-4">
                    <Button
                      onClick={() => !completed && logWorkout(exercise.name, exercise.description, exercise.estimatedCalories)}
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto hover:bg-transparent"
                      disabled={completed}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${completed ? 'text-emerald-700' : 'text-gray-800'}`}>
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
                        </div>
                        {completed && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            Concluído
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold">{exercise.sets}</span>
                          <span>séries</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold">{exercise.reps}</span>
                          <span>reps</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600">
                          <span className="font-semibold">~{exercise.estimatedCalories}</span>
                          <span>kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <h3 className="font-semibold text-gray-700 pt-4">Treinos na Academia</h3>
            {gymWorkouts.map((exercise) => {
              const completed = isCompleted(exercise.id);
              
              return (
                <Card key={exercise.id} className={`p-4 ${completed ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                  <div className="flex items-start gap-4">
                    <Button
                      onClick={() => !completed && logWorkout(exercise.name, exercise.description, exercise.estimatedCalories)}
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto hover:bg-transparent"
                      disabled={completed}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${completed ? 'text-emerald-700' : 'text-gray-800'}`}>
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{exercise.description}</p>
                        </div>
                        {completed && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            Concluído
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold">{exercise.sets}</span>
                          <span>séries</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="font-semibold">{exercise.reps}</span>
                          <span>reps</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-600">
                          <span className="font-semibold">~{exercise.estimatedCalories}</span>
                          <span>kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Planner Semanal */}
        <TabsContent value="planner" className="space-y-4 mt-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Planner Semanal de Exercícios</h3>
            <p className="text-sm text-gray-600">
              Organize seus treinos ao longo da semana baseado em suas prioridades
            </p>
            
            {user?.workoutPriorities && user.workoutPriorities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.workoutPriorities.map(priority => (
                  <Badge key={priority} variant="secondary" className="bg-purple-100 text-purple-700">
                    {priorityNames[priority]}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-3 pt-4">
              {(Object.keys(dayNames) as WorkoutDay[]).map((day) => (
                <Card key={day} className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{dayNames[day]}</h4>
                      <p className="text-sm text-gray-500">Clique para adicionar exercícios</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-sky-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Adicionar Exercício Customizado */}
        <TabsContent value="custom" className="space-y-4 mt-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-3 rounded-full">
                <Search className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Adicionar Exercício Customizado</h3>
                <p className="text-sm text-gray-500">Descreva seu exercício e a IA calculará as calorias</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-name">Nome do Exercício</Label>
                <Input
                  id="exercise-name"
                  placeholder="Ex: Corrida na esteira"
                  value={customExercise.name}
                  onChange={(e) => setCustomExercise({ ...customExercise, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="exercise-description">Descrição Detalhada</Label>
                <Textarea
                  id="exercise-description"
                  placeholder="Ex: Corri 5km em 30 minutos na esteira com inclinação de 2%"
                  value={customExercise.description}
                  onChange={(e) => setCustomExercise({ ...customExercise, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleCustomExercise}
                className="w-full bg-sky-500 hover:bg-sky-600"
                disabled={!customExercise.name || !customExercise.description}
              >
                <Search className="w-4 h-4 mr-2" />
                Calcular Calorias e Adicionar
              </Button>
            </div>
          </Card>

          {/* Exercícios Recentes */}
          {recentWorkoutActions.length > 0 && (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-800">Exercícios Recentes</h3>
              <div className="space-y-2">
                {recentWorkoutActions.map((action) => {
                  const workout = action.data as any;
                  return (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{workout.exerciseName}</p>
                        <p className="text-xs text-gray-500">
                          {workout.caloriesBurned} kcal • {new Date(action.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button
                        onClick={() => undoAction(action.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
