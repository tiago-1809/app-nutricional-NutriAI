'use client';

import { useState } from 'react';
import { Heart, Clock, Users, ChefHat, Flame, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Receitas expandidas com mais opções saudáveis
const mockRecipes = [
  {
    id: '1',
    title: 'Frango Grelhado com Legumes',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    prepTime: '30 min',
    servings: 2,
    difficulty: 'Fácil',
    tags: ['Alto em Proteína', 'Baixo Carb'],
    nutrition: {
      calories: 350,
      macros: { carbs: 25, protein: 45, fat: 8 },
      servings: 2,
    },
    ingredients: [
      '2 filés de frango (300g)',
      '1 abobrinha média',
      '1 cenoura grande',
      '1 brócolis pequeno',
      '2 colheres de azeite',
      'Sal, alho e limão a gosto',
    ],
    instructions: [
      'Tempere o frango com sal, alho e limão por 15 minutos',
      'Grelhe o frango em fogo médio por 6-8 minutos de cada lado',
      'Corte os legumes em pedaços médios',
      'Refogue os legumes no azeite até ficarem macios (8-10 min)',
      'Sirva o frango com os legumes',
    ],
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Salada de Quinoa com Grão-de-Bico',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop',
    prepTime: '20 min',
    servings: 3,
    difficulty: 'Fácil',
    tags: ['Vegetariano', 'Rico em Fibras'],
    nutrition: {
      calories: 280,
      macros: { carbs: 38, protein: 12, fat: 9 },
      servings: 3,
    },
    ingredients: [
      '1 xícara de quinoa cozida',
      '1 lata de grão-de-bico (400g)',
      '200g de tomate cereja',
      '1 pepino médio',
      '3 colheres de azeite',
      'Suco de 1 limão',
      'Sal e pimenta a gosto',
    ],
    instructions: [
      'Cozinhe a quinoa conforme instruções da embalagem',
      'Escorra e lave o grão-de-bico',
      'Corte os tomates ao meio e o pepino em cubos',
      'Misture todos os ingredientes em uma tigela',
      'Tempere com azeite, limão, sal e pimenta',
    ],
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Omelete de Claras com Espinafre',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop',
    prepTime: '15 min',
    servings: 1,
    difficulty: 'Fácil',
    tags: ['Alto em Proteína', 'Baixa Caloria'],
    nutrition: {
      calories: 180,
      macros: { carbs: 8, protein: 28, fat: 4 },
      servings: 1,
    },
    ingredients: [
      '4 claras de ovo',
      '1 xícara de espinafre fresco',
      '1 tomate médio picado',
      '1/4 de cebola',
      'Sal e pimenta a gosto',
    ],
    instructions: [
      'Bata as claras levemente com um garfo',
      'Refogue o espinafre e cebola em uma frigideira antiaderente',
      'Despeje as claras na frigideira',
      'Adicione o espinafre e tomate por cima',
      'Dobre ao meio quando as bordas estiverem firmes e sirva',
    ],
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Bowl de Açaí Proteico',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
    prepTime: '10 min',
    servings: 1,
    difficulty: 'Muito Fácil',
    tags: ['Pós-Treino', 'Energético'],
    nutrition: {
      calories: 320,
      macros: { carbs: 42, protein: 18, fat: 12 },
      servings: 1,
    },
    ingredients: [
      '200g de açaí puro',
      '1 banana congelada',
      '1 scoop de whey protein (30g)',
      '3 colheres de granola',
      'Frutas variadas (morango, kiwi)',
    ],
    instructions: [
      'Bata o açaí com banana e whey no liquidificador',
      'Coloque em uma tigela',
      'Decore com granola e frutas frescas',
      'Sirva imediatamente',
    ],
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Salmão Assado com Batata Doce',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    prepTime: '35 min',
    servings: 2,
    difficulty: 'Médio',
    tags: ['Ômega-3', 'Anti-inflamatório'],
    nutrition: {
      calories: 420,
      macros: { carbs: 35, protein: 38, fat: 16 },
      servings: 2,
    },
    ingredients: [
      '2 filés de salmão (300g)',
      '2 batatas doces médias',
      '2 colheres de azeite',
      'Limão, alho e ervas',
      'Sal e pimenta',
    ],
    instructions: [
      'Pré-aqueça o forno a 200°C',
      'Corte as batatas doces em rodelas e tempere com azeite',
      'Asse as batatas por 20 minutos',
      'Tempere o salmão com limão, alho e ervas',
      'Adicione o salmão ao forno e asse por mais 15 minutos',
    ],
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Wrap de Frango com Abacate',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    prepTime: '20 min',
    servings: 2,
    difficulty: 'Fácil',
    tags: ['Prático', 'Balanceado'],
    nutrition: {
      calories: 380,
      macros: { carbs: 32, protein: 35, fat: 14 },
      servings: 2,
    },
    ingredients: [
      '2 tortilhas integrais',
      '200g de frango desfiado',
      '1 abacate maduro',
      'Alface e tomate',
      'Iogurte natural',
      'Temperos a gosto',
    ],
    instructions: [
      'Amasse o abacate e misture com iogurte',
      'Aqueça as tortilhas levemente',
      'Espalhe o creme de abacate',
      'Adicione frango, alface e tomate',
      'Enrole e corte ao meio',
    ],
    isFavorite: false,
  },
  {
    id: '7',
    title: 'Smoothie Verde Detox',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop',
    prepTime: '5 min',
    servings: 1,
    difficulty: 'Muito Fácil',
    tags: ['Detox', 'Vitaminas'],
    nutrition: {
      calories: 150,
      macros: { carbs: 28, protein: 6, fat: 3 },
      servings: 1,
    },
    ingredients: [
      '1 xícara de espinafre',
      '1 banana',
      '1/2 maçã verde',
      '200ml de água de coco',
      '1 colher de chia',
      'Gengibre a gosto',
    ],
    instructions: [
      'Coloque todos os ingredientes no liquidificador',
      'Bata até ficar homogêneo',
      'Adicione gelo se preferir',
      'Sirva imediatamente',
    ],
    isFavorite: false,
  },
  {
    id: '8',
    title: 'Panqueca de Aveia e Banana',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=300&fit=crop',
    prepTime: '15 min',
    servings: 2,
    difficulty: 'Fácil',
    tags: ['Café da Manhã', 'Sem Glúten'],
    nutrition: {
      calories: 220,
      macros: { carbs: 35, protein: 10, fat: 5 },
      servings: 2,
    },
    ingredients: [
      '2 bananas maduras',
      '1 xícara de aveia',
      '2 ovos',
      '1 colher de canela',
      'Mel para servir',
    ],
    instructions: [
      'Amasse as bananas em uma tigela',
      'Adicione ovos, aveia e canela',
      'Misture bem até formar uma massa',
      'Aqueça uma frigideira antiaderente',
      'Faça as panquecas e sirva com mel',
    ],
    isFavorite: false,
  },
];

export default function RecipesTab() {
  const [recipes, setRecipes] = useState(mockRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  const openRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsDialogOpen(true);
  };

  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags)));
  const filteredRecipes = filterTag 
    ? recipes.filter(r => r.tags.includes(filterTag))
    : recipes;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Receitas Saudáveis</h1>
        <p className="text-sm text-gray-500">{filteredRecipes.length} receitas nutritivas e deliciosas</p>
      </div>

      {/* Filtros por tag */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterTag === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterTag(null)}
          className={filterTag === null ? 'bg-emerald-600' : ''}
        >
          Todas
        </Button>
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={filterTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterTag(tag)}
            className={filterTag === tag ? 'bg-emerald-600' : ''}
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Grid de receitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-40 object-cover"
              />
              <Button
                onClick={() => toggleFavorite(recipe.id)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                <Heart
                  className={`w-5 h-5 ${
                    recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`}
                />
              </Button>
              <Badge className="absolute bottom-2 left-2 bg-emerald-600">
                {recipe.difficulty}
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 line-clamp-2">{recipe.title}</h3>

              <div className="flex flex-wrap gap-1">
                {recipe.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.prepTime}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings} porções
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <p className="text-sm text-gray-500">Por porção</p>
                  <p className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {recipe.nutrition.calories} kcal
                  </p>
                </div>
                <Button
                  onClick={() => openRecipe(recipe)}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Ver receita
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de receita */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
              </DialogHeader>

              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-full h-64 object-cover rounded-xl"
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.tags.map((tag: string) => (
                  <Badge key={tag} className="bg-emerald-100 text-emerald-700">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Info nutricional */}
              <Card className="p-4 bg-emerald-50 border-emerald-200">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {selectedRecipe.nutrition.calories}
                    </p>
                    <p className="text-xs text-gray-600">kcal</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedRecipe.nutrition.macros.carbs}g
                    </p>
                    <p className="text-xs text-gray-600">Carbs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {selectedRecipe.nutrition.macros.protein}g
                    </p>
                    <p className="text-xs text-gray-600">Proteína</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {selectedRecipe.nutrition.macros.fat}g
                    </p>
                    <p className="text-xs text-gray-600">Gordura</p>
                  </div>
                </div>
              </Card>

              {/* Info adicional */}
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedRecipe.prepTime}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedRecipe.servings} porções
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  {selectedRecipe.difficulty}
                </div>
              </div>

              {/* Ingredientes */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Ingredientes
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-emerald-600 mt-1">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modo de preparo */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-emerald-600" />
                  Modo de Preparo
                </h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
