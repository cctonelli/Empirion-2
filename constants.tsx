
import React from 'react';

export const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  accent: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const BRANCH_LABELS: Record<string, string> = {
  industrial: 'Industrial',
  commercial: 'Commercial',
  services: 'Services',
  agribusiness: 'Agribusiness'
};

export const MOCK_CHAMPIONSHIPS = [
  {
    id: 'c1',
    name: 'Tech Frontier 2025',
    description: 'A high-stakes industrial simulation for electronics manufacturing.',
    branch: 'industrial',
    salesMode: 'hybrid',
    scenarioType: 'simulated',
    currency: 'BRL',
    currentRound: 2,
    totalRounds: 12,
    status: 'active',
    startDate: '2025-01-01',
    teamFee: 250
  },
  {
    id: 'c2',
    name: 'AgroBoost Global',
    description: 'Sustainable agribusiness management in the Brazilian interior.',
    branch: 'agribusiness',
    salesMode: 'external',
    scenarioType: 'real',
    currency: 'USD',
    currentRound: 0,
    totalRounds: 8,
    status: 'draft',
    startDate: '2025-02-15',
    teamFee: 500
  }
];
