// src/components/HomePage.jsx
import React, { useState } from 'react';
import {
  Folders, // Icon for Portfolio
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Briefcase,
  Receipt,
  HardDrive, // Icon for Assets
  ArrowRight, // Keep existing ArrowRight
  Sparkles,
  Users2
} from 'lucide-react';
import { Badge } from './ui/badge';

const ICON_PALETTE = {
  projects: 'text-emerald-600',
  team: 'text-indigo-600',
  clients: 'text-blue-600',
  documents: 'text-purple-600',
  reports: 'text-orange-600',
  calendar: 'text-cyan-600',
  invoices: 'text-green-600',
  financials: 'text-pink-600', // Added the missing comma here
  portfolio: 'text-blue-600', // Add color for Portfolio
  services: 'text-yellow-600', // Add color for Services
  assets: 'text-red-600' // Add color for Assets
};

const HomePage = ({ onNavigate, language = 'ar' }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Menu items with two-line subtitles (kept concise to exactly two visual lines)
  const menuItems = language === 'ar' ? [
    {
      id: 'projects',
      title: 'إدارة المشاريع',
      subtitle: 'تنظيم وتنفيذ المشاريع من البداية إلى النهاية. متابعة المهام، المواعيد، والميزانيات بدقة.',
      icon: LayoutDashboard,
      delay: 0.05,
      status: 'new'
    },
    {
      id: 'team',
      title: 'إدارة فريق العمل',
      subtitle: 'إدارة أعضاء الفريق وتوزيع المهام وتتبع الأداء.',
      icon: Users2,
      delay: 0.1,
      status: 'new'
    },
    {
      id: 'clients',
      title: 'قاعدة بيانات العملاء',
      subtitle: 'تخزين ومتابعة معلومات العملاء والعقود. سجل تواصل وسجل تعاملات كامل.',
      icon: Users,
      delay: 0.15,
      status: 'soon'
    },
    {
      id: 'financials',
      title: 'الحسابات المالية',
      subtitle: 'إدارة الأمور المالية المتعلقة بالمشاريع والعملاء.',
      icon: Briefcase,
      delay: 0.2,
      status: 'soon'
    },
    {
      id: 'documents',
      title: 'المستندات والعقود',
      subtitle: 'رفع وتنظيم المستندات والقوالب. إدارة صلاحيات الوصول والبحث السريع.',
      icon: FileText,
      delay: 0.25,
      status: 'soon'
    },
    {
      id: 'reports',
      title: 'التقارير والإحصائيات',
      subtitle: 'تقارير مفصلة ومرئية عن الأداء والميزانيات. أدوات تصدير ومشاركة مبسطة.',
      icon: BarChart3,
      delay: 0.3,
      status: 'soon'
    },
    {
      id: 'portfolio',
      title: 'حافظة الأعمال',
      subtitle: 'عرض وتنظيم مشاريعك المكتملة والحالية في مكان واحد.',
      icon: Folders, // Icon for Portfolio
      delay: 0.35,
      status: 'soon'
    },
    {
      id: 'services',
      title: 'إدارة الخدمات',
      subtitle: 'تحديد وإدارة قائمة الخدمات التي تقدمها لعملائك.',
      icon: Sparkles, // Using Sparkles for services
      delay: 0.4,
      status: 'soon'
    },
    {
      id: 'assets',
      title: 'إدارة الأصول',
      subtitle: 'تتبع وإدارة الأصول المادية والرقمية لمشروعك.',
      icon: HardDrive, // Icon for Assets
      delay: 0.45,
      status: 'soon'
    },
  ] : [
    {
      id: 'projects',
      title: 'Project Management',
      subtitle: 'Plan and execute projects from start to finish. Track tasks, timelines, and budgets.',
      icon: LayoutDashboard,
      delay: 0.05,
      status: 'new'
    },
    {
      id: 'team',
      title: 'Team Management',
      subtitle: 'Manage team members, assign tasks, and track performance.',
      icon: Users2,
      delay: 0.1,
      status: 'new'
    },
    {
      id: 'clients',
      title: 'Clients Database',
      subtitle: 'Store and manage client records and contracts. Centralized contact and activity log.',
      icon: Users,
      delay: 0.15,
      status: 'soon'
    },
    {
      id: 'financials',
      title: 'Financial Accounts',
      subtitle: 'Manage financials related to projects and clients.',
      icon: Briefcase,
      delay: 0.2,
      status: 'soon'
    },
    {
      id: 'documents',
      title: 'Documents & Contracts',
      subtitle: 'Upload and organize files and templates. Manage access and quick search.',
      icon: FileText,
      delay: 0.25,
      status: 'soon'
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      subtitle: 'Detailed visual reports on performance and budgets. Easy export and sharing.',
      icon: BarChart3,
      delay: 0.3,
      status: 'soon'
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      subtitle: 'Showcase and organize your completed and current projects in one place.',
      icon: Folders, // Icon for Portfolio
      delay: 0.35,
      status: 'soon'
    },
    {
      id: 'services',
      title: 'Services Management',
      subtitle: 'Define and manage the list of services you offer to clients.',
      icon: Sparkles, // Icon for Services
      delay: 0.4,
      status: 'soon'
    },
    {
      id: 'assets',
      title: 'Assets Management',
      subtitle: 'Track and manage the physical and digital assets for your project.',
      icon: HardDrive, // Icon for Assets
      delay: 0.45,
      status: 'soon'
    },
  ];

  const welcomeText = language === 'ar' ? 'مرحبًا بك في لوحة التحكم' : 'Welcome to the Dashboard';
  const subtitleText = language === 'ar' ? 'اختر القسم الذي تريد إدارته' : 'Choose a section to manage';

  return (
    <div className={`h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-y-auto flex items-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        {/* Restored subtle emerald artistic blob in center (reduced size) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '4s', width: '28rem', height: '28rem', opacity: 0.10 }}></div>
      </div>

      {/* Main centered area: occupy 60% width, centered */}
      <main className="relative z-10 mx-auto flex flex-col items-center justify-center" style={{ width: '60vw', maxWidth: '1200px', minWidth: '760px', minHeight: '50vh' }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>{language === 'ar' ? 'اختر القسم المطلوب للبدء' : 'Pick a section to get started'}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{language === 'ar' ? 'ما الذي تريد العمل عليه اليوم؟' : "What would you like to work on today?"}</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">{language === 'ar' ? 'اختر من البطاقات أدناه للوصول السريع إلى أدوات وإعدادات كل قسم' : 'Select a card below to quickly access the tools and settings for each section'}</p>
        </div>

        {/* 2x3 Grid - fixed card heights and unified design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const iconColor = ICON_PALETTE[item.id] || 'text-slate-600';
            return (
              <div key={item.id}
                style={{ animation: 'slideUp 0.9s ease-out forwards', animationDelay: `${item.delay}s`, opacity: 0 }}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group"
              >
                <div
                  onClick={() => onNavigate && onNavigate(item.id)}
                  className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer bg-white border border-gray-100 text-gray-800 transition-transform ${hoveredCard === item.id ? 'scale-105 shadow-lg' : 'shadow-sm'} flex flex-col justify-between`}
                  style={{ height: '170px', transitionDuration: '400ms' }}
                >
                  <div className="absolute top-3 left-3">
                    <Badge variant={item.status === 'new' ? 'secondary' : 'default'}>
                      {language === 'ar' ? (item.status === 'new' ? 'جديد' : 'قريباً') : (item.status === 'new' ? 'New' : 'Soon')}
                    </Badge>
                  </div>

                  <div className="flex items-start pt-5">
                    <div style={{ width: 60 }} className="flex-shrink-0">
                      {/* Icon rendering: default gray, color on hover */}
                      <Icon
                        className={`transition-colors duration-300 ${hoveredCard === item.id ? iconColor : 'text-gray-400'}`}
                        size={28}
                      />

                    </div>

                    <div className="flex-1 pl-4 pr-2">
                      <h3 className="text-lg font-semibold text-gray-800 truncate whitespace-nowrap">{item.title}</h3>
                      <p className="text-sm text-gray-700 mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.25rem', maxHeight: '2.6rem' }}>{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex justify-end items-end">
                    <ArrowRight className="text-gray-400" size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* keep hover/click animations subtle */
        .scale-105 { transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default HomePage;
