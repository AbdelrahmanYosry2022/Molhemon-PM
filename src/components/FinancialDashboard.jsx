// src/components/FinancialDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Receipt, 
  PiggyBank, 
  Calculator,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Download,
  Upload,
  ArrowRightLeft,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const FinancialDashboard = ({ onBack, language = 'ar' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading data
    setInvoices([
      { id: 1, number: 'INV-001', client: 'شركة التقنية المتقدمة', amount: 15000, issued: '2024-01-15', due: '2024-02-15', status: 'sent' },
      { id: 2, number: 'INV-002', client: 'مؤسسة الإبداع', amount: 8000, issued: '2024-01-20', due: '2024-02-20', status: 'paid' },
      { id: 3, number: 'INV-003', client: 'شركة المستقبل', amount: 12000, issued: '2024-01-10', due: '2024-01-25', status: 'overdue' }
    ]);

    setExpenses([
      { id: 1, date: '2024-01-25', description: 'رواتب الموظفين', category: 'رواتب', amount: 5000, paymentMethod: 'تحويل بنكي' },
      { id: 2, date: '2024-01-20', description: 'اشتراك برامج', category: 'اشتراكات', amount: 300, paymentMethod: 'بطاقة ائتمان' },
      { id: 3, date: '2024-01-15', description: 'إيجار المكتب', category: 'إيجار', amount: 2000, paymentMethod: 'تحويل بنكي' }
    ]);

    setAccounts([
      { id: 1, name: 'حساب بنك CIB', type: 'بنك', balance: 25000, currency: 'EGP' },
      { id: 2, name: 'حساب PayPal', type: 'محفظة رقمية', balance: 5000, currency: 'USD' },
      { id: 3, name: 'خزينة نقدية', type: 'نقدي', balance: 3000, currency: 'EGP' }
    ]);

    setTransfers([
      { id: 1, from: 'PayPal', to: 'حساب بنك CIB', amount: 2000, date: '2024-01-20', currency: 'EGP' },
      { id: 2, from: 'خزينة نقدية', to: 'حساب بنك CIB', amount: 1000, date: '2024-01-18', currency: 'EGP' }
    ]);
  }, []);

  // Calculate summary data
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview', icon: TrendingUp },
    { id: 'invoices', label: language === 'ar' ? 'الفواتير والإيرادات' : 'Invoices & Income', icon: FileText },
    { id: 'expenses', label: language === 'ar' ? 'المصروفات' : 'Expenses', icon: Receipt },
    { id: 'treasury', label: language === 'ar' ? 'الخزينة' : 'Treasury', icon: PiggyBank },
    { id: 'forecaster', label: language === 'ar' ? 'الحاسبة التوقعية' : 'Financial Forecaster', icon: Calculator }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: language === 'ar' ? 'مسودة' : 'Draft', variant: 'secondary' },
      sent: { label: language === 'ar' ? 'مرسلة' : 'Sent', variant: 'default' },
      paid: { label: language === 'ar' ? 'مدفوعة' : 'Paid', variant: 'default' },
      overdue: { label: language === 'ar' ? 'متأخرة' : 'Overdue', variant: 'destructive' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'رواتب': 'bg-blue-100 text-blue-800',
      'اشتراكات': 'bg-purple-100 text-purple-800',
      'إيجار': 'bg-green-100 text-green-800',
      'تسويق': 'bg-yellow-100 text-yellow-800',
      'معدات': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-y-auto ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'ar' ? 'الحسابات المالية' : 'Financial Accounts'}
              </h1>
              <p className="text-gray-600">
                {language === 'ar' ? 'إدارة شاملة للأمور المالية' : 'Comprehensive financial management'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalRevenue.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'هذا الشهر' : 'This month'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {totalExpenses.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="text-red-600" size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'هذا الشهر' : 'This month'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'صافي الربح' : 'Net Profit'}
                    </p>
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netProfit.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'هذا الشهر' : 'This month'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'فواتير مستحقة' : 'Pending Invoices'}
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {totalPending.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FileText className="text-orange-600" size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'في انتظار الدفع' : 'Awaiting payment'}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'رصيد الخزينة' : 'Treasury Balance'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalBalance.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <PiggyBank className="text-blue-600" size={24} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ar' ? 'إجمالي الأرصدة' : 'Total balances'}
                </p>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'تدفق الإيرادات مقابل المصروفات' : 'Revenue vs Expenses Flow'}
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  {language === 'ar' ? 'رسم بياني يوضح تدفق الإيرادات مقابل المصروفات خلال آخر 6 أشهر' : 'Chart showing revenue vs expenses flow over last 6 months'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'إدارة الفواتير' : 'Invoice Management'}
              </h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                {language === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث باسم العميل أو رقم الفاتورة...' : 'Search by client name or invoice number...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                <option value="sent">{language === 'ar' ? 'مرسلة' : 'Sent'}</option>
                <option value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</option>
                <option value="overdue">{language === 'ar' ? 'متأخرة' : 'Overdue'}</option>
              </select>
            </div>

            {/* Invoices Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'العميل' : 'Client'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'المبلغ' : 'Amount'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'تاريخ الإصدار' : 'Issued'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ar' ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.amount.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.issued}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.due}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit size={16} />
                            </button>
                            <button className="text-orange-600 hover:text-orange-900">
                              <Send size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'إدارة المصروفات' : 'Expense Management'}
              </h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                {language === 'ar' ? 'إضافة مصروف جديد' : 'Add New Expense'}
              </button>
            </div>

            {/* Expenses Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'التاريخ' : 'Date'}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'الوصف' : 'Description'}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'التصنيف' : 'Category'}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'المبلغ' : 'Amount'}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.amount.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {expense.paymentMethod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Category Distribution Chart */}
              <div>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'ar' ? 'توزيع المصروفات' : 'Expense Distribution'}
                  </h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      {language === 'ar' ? 'رسم بياني دائري يوضح توزيع المصروفات حسب التصنيف' : 'Pie chart showing expense distribution by category'}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Treasury Tab */}
        {activeTab === 'treasury' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'إدارة الخزينة' : 'Treasury Management'}
              </h2>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  {language === 'ar' ? 'إضافة حساب جديد' : 'Add New Account'}
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <ArrowRightLeft size={16} />
                  {language === 'ar' ? 'تسجيل تحويل' : 'Record Transfer'}
                </button>
              </div>
            </div>

            {/* Total Balance */}
            <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ar' ? 'إجمالي الأرصدة' : 'Total Balance'}
                </h3>
                <p className="text-4xl font-bold">
                  {totalBalance.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                </p>
              </div>
            </Card>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <Card key={account.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {account.type === 'بنك' ? (
                          <CreditCard className="text-blue-600" size={20} />
                        ) : account.type === 'محفظة رقمية' ? (
                          <Wallet className="text-green-600" size={20} />
                        ) : (
                          <DollarSign className="text-yellow-600" size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-500">{account.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {account.balance.toLocaleString()} {account.currency}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Transfers History */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'سجل التحويلات' : 'Transfer History'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'ar' ? 'من' : 'From'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'ar' ? 'إلى' : 'To'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'ar' ? 'المبلغ' : 'Amount'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === 'ar' ? 'التاريخ' : 'Date'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.from}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.to}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.amount.toLocaleString()} {transfer.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transfer.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Financial Forecaster Tab */}
        {activeTab === 'forecaster' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ar' ? 'الحاسبة التوقعية' : 'Financial Forecaster'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Balance */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {totalBalance.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {language === 'ar' ? 'من تبويب الخزينة' : 'From Treasury tab'}
                  </p>
                </div>
              </Card>

              {/* Expected Revenue */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'الإيرادات المتوقعة' : 'Expected Revenue'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الفواتير المستحقة' : 'Pending Invoices'}
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {totalPending.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'إيرادات أخرى متوقعة' : 'Other Expected Revenue'}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </Card>

              {/* Expected Expenses */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ar' ? 'المصروفات المتوقعة' : 'Expected Expenses'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'مصروفات ثابتة' : 'Fixed Expenses'}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'مصروفات أخرى متوقعة' : 'Other Expected Expenses'}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </Card>

              {/* Projected Balance */}
              <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'الرصيد المتوقع' : 'Projected Balance'}
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {totalBalance.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                  <p className="text-sm mt-2 opacity-90">
                    {language === 'ar' ? 'في نهاية الشهر' : 'End of month'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'ملخص التوقعات' : 'Forecast Summary'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'إجمالي الإيرادات المتوقعة' : 'Total Expected Revenue'}
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {totalPending.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'إجمالي المصروفات المتوقعة' : 'Total Expected Expenses'}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    0 {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'صافي التدفق' : 'Net Flow'}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {totalPending.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
