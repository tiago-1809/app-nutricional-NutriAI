'use client';

import { useState } from 'react';
import { useNutriAI } from '@/contexts/NutriAIContext';
import OnboardingScreen from '@/components/OnboardingScreen';
import DashboardTab from '@/components/tabs/DashboardTab';
import FoodsTab from '@/components/tabs/FoodsTab';
import RecipesTab from '@/components/tabs/RecipesTab';
import WorkoutTab from '@/components/tabs/WorkoutTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import { Home, UtensilsCrossed, BookOpen, Dumbbell, User } from 'lucide-react';

type Tab = 'dashboard' | 'foods' | 'recipes' | 'workout' | 'profile';

export default function NutriAIApp() {
  const { isOnboarded } = useNutriAI();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Início', icon: Home },
    { id: 'foods' as Tab, label: 'Alimentos', icon: UtensilsCrossed },
    { id: 'recipes' as Tab, label: 'Receitas', icon: BookOpen },
    { id: 'workout' as Tab, label: 'Treino', icon: Dumbbell },
    { id: 'profile' as Tab, label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'foods' && <FoodsTab />}
        {activeTab === 'recipes' && <RecipesTab />}
        {activeTab === 'workout' && <WorkoutTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex justify-around items-center h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 w-12 h-1 bg-emerald-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
