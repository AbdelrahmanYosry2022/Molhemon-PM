import React, { useState } from 'react';
import { LayoutDashboard, Receipt, BarChart2, Banknote, TrendingUp, ArrowRight } from 'lucide-react';

const FinancialsDashboard = ({ onBack, language = 'ar' }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'invoices', 'expenses', 'treasury', 'forecaster'

  const t = {
    ar: {
      backToHome: "العودة للرئيسية",
      overview: "نظرة عامة",
      invoices: "الفواتير والإيرادات",
      expenses: "المصروفات",
      treasury: "الخزينة",
      forecaster: "الحاسبة التوقعية",
      // Add more Arabic translations as needed for content
    },
    en: {
      backToHome: "Back to Home",
      overview: "Overview",
      invoices: "Invoices & Income",
      expenses: "Expenses",
      treasury: "Treasury",
      forecaster: "Financial Forecaster",
      // Add more English translations as needed for content
    }
  }[language];

  const tabs = [
    { id: 'overview', label: t.overview, icon: LayoutDashboard },
    { id: 'invoices', label: t.invoices, icon: Receipt },
    { id: 'expenses', label: t.expenses, icon: BarChart2 },
    { id: 'treasury', label: t.treasury, icon: Banknote },
    { id: 'forecaster', label: t.forecaster, icon: TrendingUp },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.overview} Content</h3>
          <p>ملخصك المالي اليومي. يعطيك صورة سريعة عن صحة العمل المالية بمجرد فتح القسم.</p>
          {/* Placeholder for Overview Summary Cards and Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg shadow">إجمالي الإيرادات (هذا الشهر)</div>
            <div className="bg-white p-4 rounded-lg shadow">إجمالي المصروفات (هذا الشهر)</div>
            <div className="bg-white p-4 rounded-lg shadow">صافي الربح (هذا الشهر)</div>
            <div className="bg-white p-4 rounded-lg shadow">فواتير مستحقة</div>
            <div className="bg-white p-4 rounded-lg shadow">رصيد الخزينة الحالي</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow mt-6" style={{ height: '200px' }}>رسم بياني تدفق الإيرادات مقابل المصروفات</div>
        </div>;
      case 'invoices':
        return <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.invoices} Content</h3>
          <p>قائمة بجميع الفواتير والإجراءات المتعلقة بها.</p>
          {/* Placeholder for Invoices List, Create Button, Filters */}
        </div>;
      case 'expenses':
        return <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.expenses} Content</h3>
          <p>تسجيل وتصنيف كل النفقات المتعلقة بالعمل.</p>
          {/* Placeholder for Expenses List, Add Button, Chart */}
        </div>;
      case 'treasury':
        return <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.treasury} Content</h3>
          <p>إدارة السيولة النقدية الفعلية.</p>
          {/* Placeholder for Accounts List, Total Balance, Transfer Log */}
        </div>;
      case 'forecaster':
        return <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{t.forecaster} Content</h3>
          <p>حاسبة توقيعة للتخطيط المسبق.</p>
          {/* Placeholder for Forecaster Interface */}
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header and Back Button */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-100 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-gray-700"
        >
          <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t.backToHome}</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{language === 'ar' ? 'الحسابات المالية' : 'Financial Accounts'}</h1>
        <div></div> {/* Spacer for symmetry */}
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-gray-50 border-b border-gray-200 px-4">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-6 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <TabIcon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto bg-gray-50">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FinancialsDashboard;
