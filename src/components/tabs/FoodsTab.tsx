'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import { generateId, getMealName } from '@/lib/utils-nutriai';
import { FoodItem, MealType } from '@/lib/types';
import { Search, Plus, Trash2, Sparkles, Camera, Upload, Coffee, Utensils, Cookie, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipos de porções disponíveis
type PortionType = 'g' | 'ml' | 'unit' | 'tablespoon' | 'teaspoon' | 'cup' | 'glass' | 'slice' | 'piece';

interface PortionOption {
  value: PortionType;
  label: string;
  gramsEquivalent: number; // Equivalente em gramas para cálculo
}

const portionOptions: PortionOption[] = [
  { value: 'g', label: 'Gramas (g)', gramsEquivalent: 1 },
  { value: 'ml', label: 'Mililitros (ml)', gramsEquivalent: 1 },
  { value: 'unit', label: 'Unidade', gramsEquivalent: 100 },
  { value: 'tablespoon', label: 'Colher de sopa', gramsEquivalent: 15 },
  { value: 'teaspoon', label: 'Colher de chá', gramsEquivalent: 5 },
  { value: 'cup', label: 'Xícara', gramsEquivalent: 240 },
  { value: 'glass', label: 'Copo', gramsEquivalent: 200 },
  { value: 'slice', label: 'Fatia', gramsEquivalent: 30 },
  { value: 'piece', label: 'Pedaço', gramsEquivalent: 50 },
];

// Função auxiliar para garantir que um valor é um número válido
function ensureNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

export default function FoodsTab() {
  const { todayFoods, addFood, removeFood, getFoodsByMeal } = useNutriAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedFood, setAnalyzedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [portionType, setPortionType] = useState<PortionType>('g');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const analyzeFood = async () => {
    if (!searchQuery.trim() && !photoFile) return;
    
    setIsAnalyzing(true);
    
    // Simulação de análise com IA (em produção, chamaria API OpenAI Vision)
    setTimeout(() => {
      const mockAnalysis = {
        name: searchQuery || 'Alimento da foto',
        portion: '100g',
        calories: Math.floor(Math.random() * 300) + 50,
        macros: {
          carbs: Math.floor(Math.random() * 50) + 10,
          protein: Math.floor(Math.random() * 30) + 5,
          fat: Math.floor(Math.random() * 20) + 2,
        },
        alternatives: [
          { name: 'Opção integral', benefit: 'Mais fibras' },
          { name: 'Versão light', benefit: 'Menos calorias' },
        ],
      };
      setAnalyzedFood(mockAnalysis);
      setIsAnalyzing(false);
      setIsDialogOpen(true);
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Analisar automaticamente após upload
      setSearchQuery('');
      setTimeout(() => analyzeFood(), 500);
    }
  };

  const handleAddFood = () => {
    if (!analyzedFood) return;

    // Garantir que todos os valores são números válidos
    const qty = ensureNumber(parseFloat(quantity), 1);
    const selectedPortion = portionOptions.find(p => p.value === portionType);
    const gramsMultiplier = selectedPortion ? selectedPortion.gramsEquivalent / 100 : 1;
    const totalMultiplier = qty * gramsMultiplier;

    const portionLabel = `${qty} ${selectedPortion?.label.toLowerCase() || 'porção'}`;

    // Garantir que os valores base são números válidos
    const baseCalories = ensureNumber(analyzedFood.calories, 0);
    const baseCarbs = ensureNumber(analyzedFood.macros?.carbs, 0);
    const baseProtein = ensureNumber(analyzedFood.macros?.protein, 0);
    const baseFat = ensureNumber(analyzedFood.macros?.fat, 0);

    const food: FoodItem = {
      id: generateId(),
      name: analyzedFood.name || 'Alimento',
      portion: portionLabel,
      quantity: qty,
      calories: Math.round(baseCalories * totalMultiplier),
      macros: {
        carbs: Math.round(baseCarbs * totalMultiplier),
        protein: Math.round(baseProtein * totalMultiplier),
        fat: Math.round(baseFat * totalMultiplier),
      },
      mealType: selectedMeal,
      timestamp: new Date(),
    };

    addFood(food);
    setIsDialogOpen(false);
    setSearchQuery('');
    setAnalyzedFood(null);
    setQuantity('1');
    setPortionType('g');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const totalCalories = todayFoods.reduce((sum, f) => sum + ensureNumber(f.calories, 0), 0);

  const mealIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    snack: Cookie,
    dinner: Moon,
  };

  const renderMealSection = (mealType: MealType) => {
    const foods = getFoodsByMeal(mealType);
    const mealCalories = foods.reduce((sum, f) => sum + ensureNumber(f.calories, 0), 0);
    const Icon = mealIcons[mealType];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-gray-800">{getMealName(mealType)}</h3>
          </div>
          <span className="text-sm font-medium text-emerald-600">{mealCalories} kcal</span>
        </div>

        {foods.length === 0 ? (
          <Card className="p-4 text-center bg-gray-50">
            <p className="text-sm text-gray-500">Nenhum alimento registrado</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {foods.map((food) => (
              <Card key={food.id} className="p-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{food.name}</h4>
                    <p className="text-xs text-gray-500">
                      {food.portion}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      <span>C: {ensureNumber(food.macros?.carbs, 0)}g</span>
                      <span>P: {ensureNumber(food.macros?.protein, 0)}g</span>
                      <span>G: {ensureNumber(food.macros?.fat, 0)}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-base font-bold text-emerald-600">{ensureNumber(food.calories, 0)}</p>
                      <p className="text-xs text-gray-500">kcal</p>
                    </div>
                    <Button
                      onClick={() => removeFood(food.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Alimentos</h1>
        
        {/* Busca com IA */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Descreva o alimento (ex: 1 prato de arroz com feijão)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeFood()}
            className="pl-10 pr-12"
          />
          <Button
            onClick={analyzeFood}
            disabled={isAnalyzing || !searchQuery.trim()}
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isAnalyzing ? (
              <Sparkles className="w-4 h-4 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Upload de foto */}
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
            >
              <Camera className="w-4 h-4 mr-2" />
              Tirar Foto
            </Button>
          </label>
          
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => {
                const inputs = document.querySelectorAll('input[type="file"]');
                inputs[1]?.dispatchEvent(new MouseEvent('click'));
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </label>
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Descreva ou tire foto do alimento e a IA calculará as calorias
        </p>
      </div>

      {/* Total do dia */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total consumido hoje</p>
            <p className="text-2xl font-bold text-emerald-700">{totalCalories} kcal</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{todayFoods.length} itens</p>
          </div>
        </div>
      </Card>

      {/* Tabs por refeição */}
      <Tabs defaultValue="breakfast" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakfast" className="text-xs">
            <Coffee className="w-4 h-4 mr-1" />
            Café
          </TabsTrigger>
          <TabsTrigger value="lunch" className="text-xs">
            <Utensils className="w-4 h-4 mr-1" />
            Almoço
          </TabsTrigger>
          <TabsTrigger value="snack" className="text-xs">
            <Cookie className="w-4 h-4 mr-1" />
            Lanche
          </TabsTrigger>
          <TabsTrigger value="dinner" className="text-xs">
            <Moon className="w-4 h-4 mr-1" />
            Jantar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakfast" className="mt-4">
          {renderMealSection('breakfast')}
        </TabsContent>
        <TabsContent value="lunch" className="mt-4">
          {renderMealSection('lunch')}
        </TabsContent>
        <TabsContent value="snack" className="mt-4">
          {renderMealSection('snack')}
        </TabsContent>
        <TabsContent value="dinner" className="mt-4">
          {renderMealSection('dinner')}
        </TabsContent>
      </Tabs>

      {/* Dialog de análise */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informações Nutricionais</DialogTitle>
          </DialogHeader>
          
          {analyzedFood && (
            <div className="space-y-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Foto do alimento"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="font-semibold text-lg text-gray-800">{analyzedFood.name}</h3>
                <p className="text-sm text-gray-500">Valores por {analyzedFood.portion}</p>
              </div>

              <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calorias</p>
                    <p className="text-2xl font-bold text-emerald-700">{ensureNumber(analyzedFood.calories, 0)}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">Carboidratos: {ensureNumber(analyzedFood.macros?.carbs, 0)}g</p>
                    <p className="text-gray-600">Proteínas: {ensureNumber(analyzedFood.macros?.protein, 0)}g</p>
                    <p className="text-gray-600">Gorduras: {ensureNumber(analyzedFood.macros?.fat, 0)}g</p>
                  </div>
                </div>
              </Card>

              <div>
                <Label htmlFor="meal">Refeição</Label>
                <Select value={selectedMeal} onValueChange={(value) => setSelectedMeal(value as MealType)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Café da Manhã</SelectItem>
                    <SelectItem value="lunch">Almoço</SelectItem>
                    <SelectItem value="snack">Lanche</SelectItem>
                    <SelectItem value="dinner">Jantar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="portion">Porção</Label>
                  <Select value={portionType} onValueChange={(value) => setPortionType(value as PortionType)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Dica:</strong> Escolha a porção que melhor representa o que você consumiu. 
                  Os valores nutricionais serão calculados automaticamente.
                </p>
              </div>

              <Button
                onClick={handleAddFood}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao diário
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
