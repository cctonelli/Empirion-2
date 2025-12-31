
import React from 'react';
import { Branch, ChampionshipTemplate } from './types';

export const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const BRANCH_CONFIGS: Record<Branch, { label: string; icon: string; description: string }> = {
  industrial: { label: 'Industrial', icon: '🏭', description: 'Focus on production, CapEx, and supply chain.' },
  commercial: { label: 'Commercial', icon: '🏪', description: 'Retail management, inventory turnover, and pricing.' },
  services: { label: 'Services', icon: '🤝', description: 'Human capital, project delivery, and customer LTV.' },
  agribusiness: { label: 'Agribusiness', icon: '🌱', description: 'Climate impact, biological assets, and global commodities.' }
};

export const CHAMPIONSHIP_TEMPLATES: ChampionshipTemplate[] = [
  {
    id: 't1',
    name: 'Café Premium Híbrido',
    branch: 'agribusiness',
    description: 'High-quality coffee production with both local and international sales.',
    config: { regionsCount: 9, initialStock: 50000, initialPrice: 450, currency: 'BRL' }
  },
  {
    id: 't2',
    name: 'Varejo de Moda Urbana',
    branch: 'commercial',
    description: 'Fast-paced fashion retail in major Brazilian urban centers.',
    config: { regionsCount: 5, initialStock: 20000, initialPrice: 120, currency: 'BRL' }
  },
  {
    id: 't3',
    name: 'Tech Hardware Startup',
    branch: 'industrial',
    description: 'Electronics manufacturing scaling from local to global.',
    config: { regionsCount: 9, initialStock: 30000, initialPrice: 340, currency: 'BRL' }
  }
];

export const MOCK_CHAMPIONSHIPS = [
  {
    id: 'c1',
    name: 'Tech Frontier 2025',
    description: 'A high-stakes industrial simulation for electronics manufacturing.',
    branch: 'industrial' as Branch,
    salesMode: 'hybrid',
    scenarioType: 'simulated',
    currency: 'BRL',
    currentRound: 2,
    totalRounds: 12,
    status: 'active',
    startDate: '2025-01-01',
    teamFee: 250,
    transparencyLevel: 'medium',
    regionsCount: 9
  },
  {
    id: 'c2',
    name: 'AgroBoost Global',
    description: 'Sustainable agribusiness management in the Brazilian interior.',
    branch: 'agribusiness' as Branch,
    salesMode: 'external',
    scenarioType: 'real',
    currency: 'USD',
    currentRound: 0,
    totalRounds: 8,
    status: 'draft',
    startDate: '2025-02-15',
    teamFee: 500,
    transparencyLevel: 'low',
    regionsCount: 4
  }
];
