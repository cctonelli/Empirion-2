
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Trophy, Settings, User, LogOut, 
  X, Menu, Shield, TrendingUp, FileText, BookOpen, 
  ChevronRight, PenTool, Globe, Server, Workflow
} from 'lucide-react';
import GlobalChat from './GlobalChat';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onLogout: () => void;
  activeView: string;
  onNavigate: (v: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, activeView }) => {
  const { t } = useTranslation('common');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'championships', label: t('championships'), icon: Trophy },
    { id: 'intelligence', label: 'Intelligence Hub', icon: Workflow }, // Nova Aba Opal
    { id: 'business-planner', label: t('businessPlanner'), icon: PenTool },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'market', label: t('market'), icon: TrendingUp },
    { id: 'admin', label: t('admin'), icon: Shield, roles: ['admin', 'tutor'] },
    { id: 'guides', label: t('guides'), icon: BookOpen },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];
// ... rest of the file stays same
