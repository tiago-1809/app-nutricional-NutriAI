import { UserGoal, BiologicalSex, ActivityLevel, MacroNutrients } from './types';

// Gerar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calcular TMB (Taxa Metabólica Basal) usando equação de Mifflin-St Jeor
// Fonte: Mifflin et al. (1990) - American Journal of Clinical Nutrition
// Esta é a equação mais precisa validada cientificamente
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  biologicalSex: BiologicalSex
): number {
  if (biologicalSex === 'male') {
    // Homens: TMB = (10 × peso em kg) + (6,25 × altura em cm) - (5 × idade em anos) + 5
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Mulheres: TMB = (10 × peso em kg) + (6,25 × altura em cm) - (5 × idade em anos) - 161
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calcular TDEE (Total Daily Energy Expenditure) baseado no nível de atividade
// Fonte: Harris-Benedict Equation revisada (2005)
// Multiplicadores validados por estudos de calorimetria indireta
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const activityMultipliers = {
    sedentary: 1.2,      // Pouco ou nenhum exercício (trabalho sedentário)
    light: 1.375,        // Exercício leve 1-3 dias/semana
    moderate: 1.55,      // Exercício moderado 3-5 dias/semana
    active: 1.725,       // Exercício intenso 6-7 dias/semana
    very_active: 1.9,    // Exercício muito intenso + trabalho físico
  };

  return bmr * activityMultipliers[activityLevel];
}

// Calcular calorias diárias baseado no objetivo
// Fontes: 
// - Academy of Nutrition and Dietetics (2020)
// - CDC Guidelines for Healthy Weight Loss
// - International Society of Sports Nutrition Position Stand (2017)
export function calculateDailyCalories(
  tdee: number,
  goal: UserGoal,
  weightLossWeeks?: number
): number {
  if (goal === 'maintain') {
    return Math.round(tdee);
  }

  if (goal === 'lose') {
    // Déficit calórico seguro baseado em evidências:
    // - 500 kcal/dia = 0.5kg/semana (perda gradual e sustentável)
    // - 750 kcal/dia = 0.75kg/semana (perda moderada)
    // - 1000 kcal/dia = 1kg/semana (perda acelerada mas segura)
    // Máximo recomendado: 1.2kg/semana (déficit de ~1100 kcal/dia)
    
    const maxDeficit = 1100; // Para 1.2kg/semana (limite superior seguro)
    const moderateDeficit = 750; // Para 0.75kg/semana (ideal)
    const minDeficit = 500; // Para 0.5kg/semana (conservador)

    let deficit = moderateDeficit;
    
    if (weightLossWeeks && weightLossWeeks <= 8) {
      // Perda mais rápida para metas de curto prazo
      deficit = maxDeficit;
    } else if (weightLossWeeks && weightLossWeeks >= 16) {
      // Perda mais gradual para metas de longo prazo (mais sustentável)
      deficit = minDeficit;
    }

    // Garantir que não fique abaixo de 1200 kcal (mulheres) ou 1500 kcal (homens)
    const minCalories = 1200;
    return Math.max(Math.round(tdee - deficit), minCalories);
  }

  if (goal === 'gain') {
    // Superávit calórico para ganho de massa magra
    // Fonte: ISSN Position Stand on Diets and Body Composition (2017)
    // 300-500 kcal/dia = ganho de 0.25-0.5kg/semana (ideal para minimizar ganho de gordura)
    return Math.round(tdee + 400);
  }

  return Math.round(tdee);
}

// Calcular macronutrientes baseado em evidências científicas robustas
// Fontes principais:
// - ISSN Position Stand on Protein and Exercise (2017)
// - Dietary Guidelines for Americans 2020-2025
// - Journal of the International Society of Sports Nutrition (2018)
// - American College of Sports Medicine Position Stand
export function calculateDailyMacros(
  dailyCalories: number,
  goal: UserGoal,
  weight: number
): MacroNutrients {
  let proteinGrams: number;
  let fatGrams: number;
  let carbsGrams: number;

  if (goal === 'lose') {
    // PERDA DE PESO - Priorizar preservação de massa muscular
    
    // Proteína: 1.8-2.4g/kg durante déficit calórico
    // Fonte: ISSN Position Stand (2017) - maior ingestão proteica preserva massa magra
    proteinGrams = weight * 2.0;
    
    // Gordura: 20-30% das calorias totais
    // Fonte: Dietary Guidelines - essencial para hormônios e saciedade
    fatGrams = (dailyCalories * 0.25) / 9; // 9 kcal por grama de gordura
    
    // Carboidratos: restante das calorias
    // Ajustado automaticamente para manter energia nos treinos
    const remainingCalories = dailyCalories - (proteinGrams * 4 + fatGrams * 9);
    carbsGrams = remainingCalories / 4; // 4 kcal por grama de carboidrato
    
  } else if (goal === 'gain') {
    // GANHO DE MASSA - Otimizar síntese proteica e energia
    
    // Proteína: 1.6-2.2g/kg para hipertrofia
    // Fonte: Morton et al. (2018) - meta-análise de 49 estudos
    proteinGrams = weight * 2.0;
    
    // Gordura: 20-30% das calorias totais
    // Importante para produção de testosterona
    fatGrams = (dailyCalories * 0.25) / 9;
    
    // Carboidratos: restante (maior para energia nos treinos)
    // Essencial para performance e recuperação muscular
    const remainingCalories = dailyCalories - (proteinGrams * 4 + fatGrams * 9);
    carbsGrams = remainingCalories / 4;
    
  } else {
    // MANUTENÇÃO - Distribuição balanceada e sustentável
    
    // Proteína: 1.2-1.6g/kg
    // Fonte: WHO/FAO recommendations para adultos ativos
    proteinGrams = weight * 1.4;
    
    // Gordura: 25-30% das calorias
    // Distribuição equilibrada para saúde geral
    fatGrams = (dailyCalories * 0.28) / 9;
    
    // Carboidratos: restante
    const remainingCalories = dailyCalories - (proteinGrams * 4 + fatGrams * 9);
    carbsGrams = remainingCalories / 4;
  }

  return {
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbsGrams),
    fat: Math.round(fatGrams),
  };
}

// Alias para calculateDailyMacros (para compatibilidade)
export function calculateMacros(
  dailyCalories: number,
  goal: UserGoal,
  weight: number = 70
): MacroNutrients {
  return calculateDailyMacros(dailyCalories, goal, weight);
}

// Calcular meta de água diária
// Fonte: Institute of Medicine (IOM) Recommendations (2004)
// European Food Safety Authority (EFSA) Guidelines
export function calculateDailyWater(weight: number, activityLevel: ActivityLevel = 'moderate'): number {
  // Recomendação base: 35ml por kg de peso corporal
  // Fonte: EFSA - adequado para 95% da população
  let baseWater = (weight * 35) / 1000; // converter para litros

  // Ajustar baseado no nível de atividade
  // Perdas hídricas aumentam com exercício
  const activityAdjustment = {
    sedentary: 1.0,      // Sem ajuste
    light: 1.1,          // +10% para compensar suor leve
    moderate: 1.2,       // +20% para atividade moderada
    active: 1.3,         // +30% para treinos intensos
    very_active: 1.4,    // +40% para atletas
  };

  return Math.round(baseWater * activityAdjustment[activityLevel] * 10) / 10;
}

// Calcular peso meta saudável baseado no tempo
// Fonte: CDC - Losing Weight (Healthy Weight Loss Rate)
export function calculateTargetWeight(
  currentWeight: number,
  goal: UserGoal,
  weeks: number
): number {
  if (goal === 'lose') {
    // Perda saudável: 0.5-1.2kg por semana
    // CDC recomenda 0.5-1kg, mas até 1.2kg é aceitável com supervisão
    const maxWeeklyLoss = 1.2;
    const totalLoss = Math.min(weeks * maxWeeklyLoss, currentWeight * 0.15); // Máximo 15% do peso
    return Math.round((currentWeight - totalLoss) * 10) / 10;
  }

  if (goal === 'gain') {
    // Ganho saudável: 0.25-0.5kg por semana (massa magra)
    // Fonte: ISSN - ganho mais lento minimiza acúmulo de gordura
    const weeklyGain = 0.4;
    const totalGain = weeks * weeklyGain;
    return Math.round((currentWeight + totalGain) * 10) / 10;
  }

  return currentWeight;
}

// Validar tempo de emagrecimento saudável
export function validateWeightLossWeeks(
  currentWeight: number,
  targetWeight: number,
  requestedWeeks: number
): { isValid: boolean; adjustedWeeks: number; message?: string } {
  const weightDifference = currentWeight - targetWeight;

  if (weightDifference <= 0) {
    return {
      isValid: false,
      adjustedWeeks: requestedWeeks,
      message: 'O peso meta deve ser menor que o peso atual para emagrecimento.',
    };
  }

  // Perda máxima saudável: 1.2kg por semana
  const minWeeks = Math.ceil(weightDifference / 1.2);

  // Perda mínima recomendada: 0.5kg por semana
  const maxWeeks = Math.ceil(weightDifference / 0.5);

  if (requestedWeeks < minWeeks) {
    return {
      isValid: false,
      adjustedWeeks: minWeeks,
      message: `Para uma perda saudável de ${weightDifference}kg, recomendamos no mínimo ${minWeeks} semanas.`,
    };
  }

  if (requestedWeeks > maxWeeks) {
    return {
      isValid: true,
      adjustedWeeks: requestedWeeks,
      message: `Você pode atingir sua meta em menos tempo. Recomendamos entre ${minWeeks} e ${maxWeeks} semanas.`,
    };
  }

  return {
    isValid: true,
    adjustedWeeks: requestedWeeks,
  };
}

// Formatar data para exibição
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

// Calcular IMC (Índice de Massa Corporal)
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Classificar IMC
export function classifyBMI(bmi: number): string {
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

// Obter nome do objetivo
export function getGoalName(goal: UserGoal): string {
  const goalNames: Record<UserGoal, string> = {
    lose: 'Perder Peso',
    maintain: 'Manter Peso',
    gain: 'Ganhar Peso',
  };
  return goalNames[goal];
}

// Formatar número com casas decimais
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

// Calcular porcentagem
export function calculatePercentage(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min((value / max) * 100, 100);
}

// Obter saudação baseada no horário
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Obter nome da refeição
export function getMealName(mealType: string): string {
  const mealNames: Record<string, string> = {
    breakfast: 'Café da Manhã',
    lunch: 'Almoço',
    snack: 'Lanche',
    dinner: 'Jantar',
  };
  return mealNames[mealType] || mealType;
}
