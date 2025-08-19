// src/components/HomePage.jsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar,
  Briefcase,
  Receipt,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const HomePage = ({ onNavigate, language = 'ar' }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const menuItems = language === 'ar' ? [
    {
      id: 'projects',
      title: 'إدارة المشاريع',
      subtitle: 'متابعة المشاريع والميزانيات',
      icon: LayoutDashboard,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      delay: 0.1
    },
    {
      id: 'clients',
      title: 'قاعدة بيانات العملاء',
      subtitle: 'إدارة بيانات وعقود العملاء',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      delay: 0.2
    },
    {
      id: 'documents',
      title: 'المستندات والعقود',
      subtitle: 'إدارة الملفات والوثائق',
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      delay: 0.3
    },
    {
      id: 'reports',
      title: 'التقارير والإحصائيات',
      subtitle: 'تحليلات مفصلة وتقارير',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      delay: 0.4
    },
    {
      id: 'calendar',
      title: 'التقويم والمواعيد',
      subtitle: 'جدولة المهام والاجتماعات',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      delay: 0.5
    },
    {
      id: 'invoices',
      title: 'الفواتير والمدفوعات',
      subtitle: 'متابعة المالية والفواتير',
      icon: Receipt,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      delay: 0.6
    }
  ] : [
    {
      id: 'projects',
      title: 'Project Management',
      subtitle: 'Track projects and budgets',
      icon: LayoutDashboard,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      delay: 0.1
    },
    {
      id: 'clients',
      title: 'Clients Database',
      subtitle: 'Manage client data and contracts',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      delay: 0.2
    },
    {
      id: 'documents',
      title: 'Documents & Contracts',
      subtitle: 'Manage files and documents',
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      delay: 0.3
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      subtitle: 'Detailed analysis and reports',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      delay: 0.4
    },
    {
      id: 'calendar',
      title: 'Calendar & Appointments',
      subtitle: 'Schedule tasks and meetings',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200',
      delay: 0.5
    },
    {
      id: 'invoices',
      title: 'Invoices & Payments',
      subtitle: 'Track finances and invoices',
      icon: Receipt,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      delay: 0.6
    }
  ];

  const welcomeText = language === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to Dashboard';
  const subtitleText = language === 'ar' ? 'اختر القسم الذي تريد إدارته' : 'Choose the section you want to manage';

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="text-white" size={24} />
              </div>
              <div className={`text-${language === 'ar' ? 'right' : 'left'}`}>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {welcomeText}
                </h1>
                <p className="text-gray-600 mt-1">{subtitleText}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="text-gray-600" size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>اختر القسم المطلوب للبدء</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            ما الذي تريد العمل عليه اليوم؟
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            اختر من الأقسام أدناه للوصول السريع إلى الأدوات والميزات التي تحتاجها
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="group relative"
              style={{
                animation: 'slideUp 0.5s ease-out forwards',
                animationDelay: `${item.delay}s`,
                opacity: 0
              }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div 
                className={`
                  relative overflow-hidden rounded-2xl border-2 ${item.borderColor}
                  ${item.bgColor} p-8 cursor-pointer
                  transition-all duration-300 hover:scale-105 hover:shadow-2xl
                  ${hoveredCard === item.id ? 'ring-4 ring-offset-2 ring-emerald-400/20' : ''}
                `}
                onClick={() => onNavigate(item.id)}
              >
                {/* Animated Background Gradient */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 
                    group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`
                    w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} 
                    flex items-center justify-center shadow-lg
                    group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                  `}>
                    <item.icon className="text-white" size={32} />
                  </div>
                  {hoveredCard === item.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:bg-clip-text transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.subtitle}
                </p>

                {/* Arrow Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">انقر للدخول</span>
                  <ArrowRight 
                    className={`
                      text-gray-400 group-hover:text-emerald-600 
                      transition-all duration-300 
                      ${hoveredCard === item.id ? 'translate-x-2' : ''}
                    `} 
                    size={20} 
                  />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'المشاريع النشطة', value: '12', trend: '+3' },
            { label: 'العملاء', value: '48', trend: '+5' },
            { label: 'المهام المنجزة', value: '234', trend: '+21' },
            { label: 'نسبة الإنجاز', value: '87%', trend: '+12%' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
              style={{
                animation: 'slideUp 0.5s ease-out forwards',
                animationDelay: `${0.7 + index * 0.1}s`,
                opacity: 0
              }}
            >
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
                <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;