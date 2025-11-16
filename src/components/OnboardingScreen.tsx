'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import { UserGoal, BiologicalSex, ActivityLevel } from '@/lib/types';
import { 
  calculateBMR, 
  calculateTDEE,
  calculateDailyCalories, 
  calculateDailyWater, 
  calculateDailyMacros,
  calculateTargetWeight,
  validateWeightLossWeeks,
  generateId 
} from '@/lib/utils-nutriai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Apple, Target, TrendingDown, TrendingUp, Minus, User, Activity, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OnboardingScreen() {
  const { setUser } = useNutriAI();
  const [step, setStep] = useState(1);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    biologicalSex: 'male' as BiologicalSex,
    gender: '',
    weight: '',
    height: '',
    goal: 'maintain' as UserGoal,
    activityLevel: 'moderate' as ActivityLevel,
    targetWeight: '',
    weightLossWeeks: '',
  });

  const handleSubmit = () => {
    // Validar antes de submeter se for objetivo de emagrecimento
    if (formData.goal === 'lose' && formData.targetWeight && formData.weightLossWeeks) {
      const currentWeight = parseFloat(formData.weight);
      const targetWeight = parseFloat(formData.targetWeight);
      const weeks = parseInt(formData.weightLossWeeks);

      const validation = validateWeightLossWeeks(currentWeight, targetWeight, weeks);
      
      if (!validation.isValid) {
        setValidationMessage(validation.message || '');
        return;
      }
    }

    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const targetWeight = formData.targetWeight ? parseFloat(formData.targetWeight) : undefined;
    const weightLossWeeks = formData.weightLossWeeks ? parseInt(formData.weightLossWeeks) : undefined;

    // Calcular TMB usando equação de Mifflin-St Jeor
    const bmr = calculateBMR(weight, height, age, formData.biologicalSex);
    
    // Calcular TDEE baseado no nível de atividade
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    
    // Calcular calorias diárias baseado no objetivo
    const dailyCalories = calculateDailyCalories(tdee, formData.goal, weightLossWeeks);
    
    // Calcular macronutrientes
    const dailyMacros = calculateDailyMacros(dailyCalories, formData.goal, weight);
    
    // Calcular meta de água
    const dailyWaterGoal = calculateDailyWater(weight, formData.activityLevel);

    setUser({
      id: generateId(),
      name: formData.name,
      age,
      biologicalSex: formData.biologicalSex,
      gender: formData.gender || undefined,
      weight,
      height,
      goal: formData.goal,
      activityLevel: formData.activityLevel,
      weightLossWeeks,
      dailyCalories,
      dailyMacros,
      dailyWaterGoal,
      targetWeight,
      createdAt: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Apple className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">NutriAI Brasil</h1>
          <p className="text-sm text-gray-500">versão beta</p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-emerald-500' : s < step ? 'w-2 bg-emerald-300' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Nome e Idade */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <User className="w-5 h-5" />
              <span className="font-semibold">Informações Básicas</span>
            </div>
            <div>
              <Label htmlFor="name" className="text-gray-700">Como você se chama?</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-gray-700">Qual sua idade?</Label>
              <Input
                id="age"
                type="number"
                placeholder="Ex: 25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.age}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Sexo Biológico e Gênero */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <User className="w-5 h-5" />
              <span className="font-semibold">Informações Pessoais</span>
            </div>
            <div>
              <Label className="text-gray-700">Sexo biológico (usado para cálculos)</Label>
              <RadioGroup
                value={formData.biologicalSex}
                onValueChange={(value) => setFormData({ ...formData, biologicalSex: value as BiologicalSex })}
                className="space-y-3 mt-2"
              >
                <label
                  htmlFor="male"
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.biologicalSex === 'male'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="male" id="male" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Masculino</div>
                  </div>
                </label>

                <label
                  htmlFor="female"
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.biologicalSex === 'female'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="female" id="female" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Feminino</div>
                  </div>
                </label>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="gender" className="text-gray-700">Gênero (opcional)</Label>
              <Input
                id="gender"
                placeholder="Como você se identifica"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Peso e Altura */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <Activity className="w-5 h-5" />
              <span className="font-semibold">Medidas Corporais</span>
            </div>
            <div>
              <Label htmlFor="weight" className="text-gray-700">Qual seu peso atual?</Label>
              <div className="relative mt-2">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
              </div>
            </div>
            <div>
              <Label htmlFor="height" className="text-gray-700">Qual sua altura?</Label>
              <div className="relative mt-2">
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 170"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">cm</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!formData.weight || !formData.height}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Objetivo */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Seu Objetivo</span>
            </div>
            <Label className="text-gray-700">Qual seu objetivo com o aplicativo?</Label>
            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => setFormData({ ...formData, goal: value as UserGoal })}
              className="space-y-3"
            >
              <label
                htmlFor="lose"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.goal === 'lose'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="lose" id="lose" />
                <TrendingDown className="w-6 h-6 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Emagrecer</div>
                  <div className="text-sm text-gray-500">Perder peso de forma saudável</div>
                </div>
              </label>

              <label
                htmlFor="maintain"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.goal === 'maintain'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="maintain" id="maintain" />
                <Minus className="w-6 h-6 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Manter peso</div>
                  <div className="text-sm text-gray-500">Manter peso atual</div>
                </div>
              </label>

              <label
                htmlFor="gain"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.goal === 'gain'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="gain" id="gain" />
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Ganhar peso</div>
                  <div className="text-sm text-gray-500">Ganhar massa muscular</div>
                </div>
              </label>
            </RadioGroup>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep(3)}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(5)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Nível de Atividade */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <Activity className="w-5 h-5" />
              <span className="font-semibold">Nível de Atividade</span>
            </div>
            <Label className="text-gray-700">Qual seu nível de atividade física?</Label>
            <RadioGroup
              value={formData.activityLevel}
              onValueChange={(value) => setFormData({ ...formData, activityLevel: value as ActivityLevel })}
              className="space-y-3"
            >
              <label
                htmlFor="sedentary"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.activityLevel === 'sedentary'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="sedentary" id="sedentary" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Sedentário</div>
                  <div className="text-sm text-gray-500">Pouco ou nenhum exercício</div>
                </div>
              </label>

              <label
                htmlFor="light"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.activityLevel === 'light'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="light" id="light" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Levemente ativo</div>
                  <div className="text-sm text-gray-500">Exercício leve 1-3 dias/semana</div>
                </div>
              </label>

              <label
                htmlFor="moderate"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.activityLevel === 'moderate'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="moderate" id="moderate" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Moderadamente ativo</div>
                  <div className="text-sm text-gray-500">Exercício moderado 3-5 dias/semana</div>
                </div>
              </label>

              <label
                htmlFor="active"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.activityLevel === 'active'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="active" id="active" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Muito ativo</div>
                  <div className="text-sm text-gray-500">Exercício intenso 6-7 dias/semana</div>
                </div>
              </label>

              <label
                htmlFor="very_active"
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.activityLevel === 'very_active'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="very_active" id="very_active" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Extremamente ativo</div>
                  <div className="text-sm text-gray-500">Exercício muito intenso, trabalho físico</div>
                </div>
              </label>
            </RadioGroup>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep(4)}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(6)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Meta de Peso e Tempo (apenas para emagrecimento) */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Definir Meta</span>
            </div>

            {formData.goal === 'lose' && (
              <>
                <div>
                  <Label htmlFor="targetWeight" className="text-gray-700">Qual seu peso meta?</Label>
                  <div className="relative mt-2">
                    <Input
                      id="targetWeight"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 65"
                      value={formData.targetWeight}
                      onChange={(e) => {
                        setFormData({ ...formData, targetWeight: e.target.value });
                        setValidationMessage('');
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">kg</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="weightLossWeeks" className="text-gray-700">
                    Em quanto tempo deseja atingir sua meta?
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="weightLossWeeks"
                      type="number"
                      placeholder="Ex: 12"
                      value={formData.weightLossWeeks}
                      onChange={(e) => {
                        setFormData({ ...formData, weightLossWeeks: e.target.value });
                        setValidationMessage('');
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">semanas</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recomendamos perder até 1,2 kg por semana para um emagrecimento saudável
                  </p>
                </div>

                {validationMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationMessage}</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {formData.goal !== 'lose' && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Suas metas serão calculadas automaticamente com base nas suas informações!
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep(5);
                  setValidationMessage('');
                }}
                variant="outline"
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={formData.goal === 'lose' && (!formData.targetWeight || !formData.weightLossWeeks)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Começar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
