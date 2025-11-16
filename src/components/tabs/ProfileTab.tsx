'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import { getGoalName, formatNumber, calculateBMR, calculateDailyCalories, calculateDailyWater } from '@/lib/utils-nutriai';
import { User, Target, Scale, TrendingUp, BookOpen, Lightbulb, Edit, ChevronRight, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserGoal } from '@/lib/types';

const nutritionMyths = [
  {
    id: '1',
    myth: 'Carboidrato à noite engorda',
    explanation: 'Não há evidências científicas de que comer carboidratos à noite cause ganho de peso. O que importa é o balanço calórico total do dia. Estudos mostram que o horário da refeição tem impacto mínimo comparado à quantidade total de calorias consumidas.',
  },
  {
    id: '2',
    myth: 'Pular o café da manhã faz engordar',
    explanation: 'O jejum intermitente, que inclui pular o café da manhã, pode até auxiliar na perda de peso para algumas pessoas. O importante é a qualidade e quantidade total de alimentos consumidos ao longo do dia, não necessariamente fazer todas as refeições.',
  },
  {
    id: '3',
    myth: 'Gordura faz mal e deve ser evitada',
    explanation: 'Gorduras saudáveis (como ômega-3, azeite, abacate) são essenciais para absorção de vitaminas, produção hormonal e saúde cerebral. O problema são as gorduras trans e o excesso de gorduras saturadas, não as gorduras em si.',
  },
  {
    id: '4',
    myth: 'Suco detox elimina toxinas',
    explanation: 'Nosso corpo já possui sistemas eficientes de desintoxicação (fígado e rins). Sucos podem ser nutritivos, mas não têm poder "detox" especial. Uma alimentação equilibrada e hidratação adequada são mais eficazes.',
  },
  {
    id: '5',
    myth: 'Proteína em excesso vira gordura',
    explanation: 'Embora o excesso calórico de qualquer macronutriente possa ser armazenado como gordura, a proteína tem o maior efeito térmico (gasta mais energia para ser digerida) e promove maior saciedade, sendo menos provável de ser armazenada como gordura.',
  },
];

const nutritionTips = [
  {
    id: '1',
    title: 'Ferro + Vitamina C',
    description: 'A vitamina C aumenta significativamente a absorção de ferro não-heme (de origem vegetal).',
    examples: [
      'Feijão com suco de laranja',
      'Espinafre com limão',
      'Lentilha com pimentão',
    ],
  },
  {
    id: '2',
    title: 'Cálcio + Vitamina D',
    description: 'A vitamina D é essencial para a absorção adequada de cálcio no intestino.',
    examples: [
      'Leite fortificado com vitamina D',
      'Iogurte + exposição solar',
      'Queijo + cogumelos',
    ],
  },
  {
    id: '3',
    title: 'Gordura + Vitaminas Lipossolúveis',
    description: 'Vitaminas A, D, E e K precisam de gordura para serem absorvidas.',
    examples: [
      'Salada com azeite',
      'Cenoura com abacate',
      'Vegetais refogados em óleo',
    ],
  },
  {
    id: '4',
    title: 'Probióticos + Prebióticos',
    description: 'Prebióticos (fibras) alimentam os probióticos (bactérias boas), melhorando a saúde intestinal.',
    examples: [
      'Iogurte com aveia',
      'Kefir com banana',
      'Kombucha com frutas',
    ],
  },
];

const goalNames: Record<UserGoal, string> = {
  lose: 'Perder Peso',
  maintain: 'Manter Peso',
  gain: 'Ganhar Peso',
};

export default function ProfileTab() {
  const { user, weightHistory, updateUser, addWeightEntry } = useNutriAI();
  const [selectedSection, setSelectedSection] = useState<'myths' | 'tips' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [editedUser, setEditedUser] = useState(user);

  if (!user) return null;

  const currentWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight 
    : user.weight;

  const weightProgress = user.targetWeight 
    ? ((user.weight - currentWeight) / (user.weight - user.targetWeight)) * 100
    : 0;

  const openSection = (section: 'myths' | 'tips') => {
    setSelectedSection(section);
    setIsDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (editedUser) {
      // Recalcular metas automaticamente
      const bmr = calculateBMR(editedUser.weight, editedUser.height, editedUser.age, 'male');
      const dailyCalories = calculateDailyCalories(bmr, editedUser.goal);
      const dailyWaterGoal = calculateDailyWater(editedUser.weight);

      updateUser({
        ...editedUser,
        dailyCalories,
        dailyWaterGoal,
      });
      setIsEditingProfile(false);
    }
  };

  const handleUpdateWeight = () => {
    const weight = parseFloat(newWeight);
    if (weight > 0) {
      addWeightEntry(weight);
      setNewWeight('');
      setIsEditingWeight(false);
    }
  };

  const handleResetGoals = () => {
    if (user) {
      const bmr = calculateBMR(user.weight, user.height, user.age, 'male');
      const dailyCalories = calculateDailyCalories(bmr, user.goal);
      const dailyWaterGoal = calculateDailyWater(user.weight);
      
      updateUser({
        dailyCalories,
        dailyWaterGoal,
      });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header do perfil */}
      <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-emerald-100 text-sm">{user.age} anos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              <span>{getGoalName(user.goal)}</span>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditedUser(user);
              setIsEditingProfile(true);
            }}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Peso Atual</p>
              <p className="text-2xl font-bold text-gray-800">{formatNumber(currentWeight, 1)} kg</p>
            </div>
            <Button
              onClick={() => setIsEditingWeight(true)}
              variant="ghost"
              size="sm"
              className="text-sky-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Altura</p>
              <p className="text-2xl font-bold text-gray-800">{user.height} cm</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Peso Meta e Progresso */}
      {user.targetWeight && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Progresso de Peso</h3>
              <p className="text-sm text-gray-500">Meta: {user.targetWeight} kg</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                {Math.abs(currentWeight - user.targetWeight).toFixed(1)} kg
              </p>
              <p className="text-xs text-gray-500">
                {currentWeight > user.targetWeight ? 'restantes' : 'acima da meta'}
              </p>
            </div>
          </div>
          <Progress value={Math.min(Math.abs(weightProgress), 100)} className="h-3" />
        </Card>
      )}

      {/* Gráfico de Evolução */}
      {weightHistory.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Evolução de Peso</h3>
          <div className="space-y-2">
            {weightHistory.slice(-5).reverse().map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm font-semibold text-gray-800">{entry.weight} kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meta calórica */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Meta Calórica Diária</h3>
            <p className="text-sm text-gray-500">Calculada automaticamente</p>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{user.dailyCalories}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Meta de água</span>
            <span className="font-medium text-gray-800">{formatNumber(user.dailyWaterGoal)} L/dia</span>
          </div>
        </div>
        <Button
          onClick={handleResetGoals}
          variant="outline"
          size="sm"
          className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
        >
          Recalcular Metas
        </Button>
      </Card>

      {/* Seções educativas */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Aprenda Mais</h3>

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openSection('myths')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Desmitificando Nutrição</h4>
                <p className="text-sm text-gray-500">Verdades sobre mitos populares</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openSection('tips')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Aprenda sobre Alimentação</h4>
                <p className="text-sm text-gray-500">Combinações que potencializam nutrientes</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Dialog de edição de perfil */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Dados Pessoais</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editedUser?.name || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={editedUser?.age || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, age: parseInt(e.target.value) } : null)}
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={editedUser?.height || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, height: parseInt(e.target.value) } : null)}
              />
            </div>
            <div>
              <Label htmlFor="goal">Objetivo</Label>
              <Select
                value={editedUser?.goal}
                onValueChange={(value: UserGoal) => setEditedUser(prev => prev ? { ...prev, goal: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Perder Peso</SelectItem>
                  <SelectItem value="maintain">Manter Peso</SelectItem>
                  <SelectItem value="gain">Ganhar Peso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetWeight">Peso Meta (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={editedUser?.targetWeight || ''}
                onChange={(e) => setEditedUser(prev => prev ? { ...prev, targetWeight: parseFloat(e.target.value) } : null)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="flex-1 bg-sky-500 hover:bg-sky-600">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de atualização de peso */}
      <Dialog open={isEditingWeight} onOpenChange={setIsEditingWeight}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Atualizar Peso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="newWeight">Novo Peso (kg)</Label>
              <Input
                id="newWeight"
                type="number"
                step="0.1"
                placeholder="Ex: 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateWeight} className="flex-1 bg-sky-500 hover:bg-sky-600">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={() => setIsEditingWeight(false)} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de conteúdo educativo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSection === 'myths' ? (
                <>
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  Desmitificando Nutrição
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Aprenda sobre Alimentação
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSection === 'myths' && (
            <Accordion type="single" collapsible className="w-full">
              {nutritionMyths.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-gray-800">{item.myth}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <p className="text-sm text-gray-700 leading-relaxed">{item.explanation}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {selectedSection === 'tips' && (
            <div className="space-y-6">
              {nutritionTips.map((tip) => (
                <Card key={tip.id} className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tip.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Exemplos:</p>
                    <ul className="space-y-1">
                      {tip.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-emerald-600 mt-0.5">✓</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
