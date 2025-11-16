'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import { getGreeting, formatNumber, calculatePercentage, calculateMacros } from '@/lib/utils-nutriai';
import { Flame, Droplet, Activity, TrendingUp, Plus, Coffee, UtensilsCrossed, Cookie, Moon, Undo2, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MealType } from '@/lib/types';

const mealIcons = {
  breakfast: Coffee,
  lunch: UtensilsCrossed,
  snack: Cookie,
  dinner: Moon,
};

const mealNames = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche da Tarde',
  dinner: 'Janta',
};

// Função auxiliar para garantir que um valor é um número válido
function ensureNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

// Componente de gráfico circular
function CircularProgress({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  // Garantir que value e max são números válidos
  const safeValue = ensureNumber(value, 0);
  const safeMax = ensureNumber(max, 1); // Evitar divisão por zero
  
  const percentage = Math.min((safeValue / safeMax) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  // Garantir que strokeDashoffset nunca seja NaN
  const strokeDashoffset = ensureNumber(circumference - (percentage / 100) * circumference, circumference);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="transform -rotate-90 w-28 h-28">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={String(strokeDashoffset)}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{Math.round(safeValue)}</span>
          <span className="text-xs text-gray-500">de {Math.round(safeMax)}g</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
    </div>
  );
}

export default function DashboardTab() {
  const { user, todayProgress, addWaterML, getFoodsByMeal, actions, undoAction } = useNutriAI();
  const [waterML, setWaterML] = useState('');
  const [isWaterDialogOpen, setIsWaterDialogOpen] = useState(false);

  if (!user) return null;

  const targetMacros = calculateMacros(user.dailyCalories, user.goal);
  const netCalories = todayProgress.caloriesConsumed - todayProgress.caloriesBurned;
  const caloriesPercent = calculatePercentage(netCalories, user.dailyCalories);
  const waterPercent = calculatePercentage(todayProgress.waterConsumed, user.dailyWaterGoal);

  const handleAddWaterML = () => {
    const ml = parseInt(waterML);
    if (ml > 0) {
      addWaterML(ml);
      setWaterML('');
      setIsWaterDialogOpen(false);
    }
  };

  const recentActions = actions.slice(-5).reverse();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
        <div className="space-y-1">
          <p className="text-emerald-100 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <span className="text-sm">Meta: {user.dailyCalories} kcal/dia</span>
        </div>
      </div>

      {/* Calorias Líquidas */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Calorias Líquidas</h3>
              <p className="text-sm text-gray-500">Consumidas - Queimadas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">{netCalories}</p>
            <p className="text-sm text-gray-500">de {user.dailyCalories} kcal</p>
          </div>
        </div>
        <Progress value={caloriesPercent} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Consumidas: {todayProgress.caloriesConsumed} kcal</span>
          <span>Queimadas: {todayProgress.caloriesBurned} kcal</span>
        </div>
      </Card>

      {/* Macronutrientes - Gráficos Circulares */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-center">Macronutrientes Diários</h3>
        <div className="flex justify-around items-center">
          <CircularProgress
            value={todayProgress.macros.protein}
            max={targetMacros.protein}
            label="Proteínas"
            color="text-red-500"
          />
          <CircularProgress
            value={todayProgress.macros.carbs}
            max={targetMacros.carbs}
            label="Carboidratos"
            color="text-blue-500"
          />
          <CircularProgress
            value={todayProgress.macros.fat}
            max={targetMacros.fat}
            label="Gorduras"
            color="text-yellow-500"
          />
        </div>
      </Card>

      {/* Refeições do Dia */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Refeições de Hoje</h3>
        {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((mealType) => {
          const foods = getFoodsByMeal(mealType);
          const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
          const Icon = mealIcons[mealType];

          return (
            <Card key={mealType} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-100 p-2 rounded-full">
                    <Icon className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{mealNames[mealType]}</h4>
                    <p className="text-sm text-gray-500">{foods.length} item(ns)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">{totalCalories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Hidratação */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Hidratação</h3>
              <p className="text-sm text-gray-500">Água e bebidas consumidas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              {formatNumber(todayProgress.waterConsumed)}L
            </p>
            <p className="text-sm text-gray-500">de {formatNumber(user.dailyWaterGoal)}L</p>
          </div>
        </div>
        <Progress value={waterPercent} className="h-3" />
        
        {/* Botões rápidos de água */}
        <div className="flex gap-2">
          <Button
            onClick={() => addWaterML(200)}
            variant="outline"
            size="sm"
            className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            200ml
          </Button>
          <Button
            onClick={() => addWaterML(500)}
            variant="outline"
            size="sm"
            className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            500ml
          </Button>
          <Dialog open={isWaterDialogOpen} onOpenChange={setIsWaterDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-sky-300 text-sky-700 hover:bg-sky-50"
              >
                <Search className="w-4 h-4 mr-1" />
                Outro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Água (ml)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  type="number"
                  placeholder="Digite a quantidade em ml"
                  value={waterML}
                  onChange={(e) => setWaterML(e.target.value)}
                  className="text-lg"
                />
                <Button onClick={handleAddWaterML} className="w-full bg-sky-500 hover:bg-sky-600">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Ações Recentes - Desfazer */}
      {recentActions.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Ações Recentes</h3>
          <div className="space-y-2">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {action.type === 'add_food' && 'Alimento adicionado'}
                    {action.type === 'add_water' && 'Água registrada'}
                    {action.type === 'add_workout' && 'Exercício registrado'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(action.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button
                  onClick={() => undoAction(action.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Desfazer
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumo Educativo */}
      <Card className="p-6 space-y-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <h3 className="font-semibold text-gray-800">💡 Dica do Dia</h3>
        <p className="text-sm text-gray-700">
          <strong>Ferro + Vitamina C:</strong> Combine feijão com suco de laranja para aumentar a absorção de ferro em até 3x!
        </p>
      </Card>

      <Card className="p-6 space-y-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <h3 className="font-semibold text-gray-800">🔍 Mito Desvendado</h3>
        <p className="text-sm text-gray-700">
          <strong>Carboidrato à noite engorda?</strong> Não! O que importa é o balanço calórico total do dia, não o horário das refeições.
        </p>
      </Card>
    </div>
  );
}
