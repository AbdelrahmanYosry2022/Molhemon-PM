// src/components/ProjectDashboard.jsx
import React from 'react';
import { DollarSign } from 'lucide-react';
import StatCard from './ui/StatCard';
import ProjectDetailsForm from './sections/ProjectDetailsForm';
import SpendingBreakdownChart from './sections/SpendingBreakdownChart';
import BudgetCategoriesSection from './sections/BudgetCategoriesSection';
import PaymentsSection from './sections/PaymentsSection';
import MilestonesSection from './sections/MilestonesSection';
import Timeline from './Timeline';
import { fmtCurrency } from '../utils/helpers';
import { colors } from '../utils/colors';

function ProjectDashboard({ 
    project, paid, remaining, paidPct, currency, updateProject,
    categories, addCategory, removeCategory, updateCategory,
    payments, addPayment, removePayment, updatePayment,
    milestones, addMilestone, removeMilestone, updateMilestone
}) {
  return (
    <div className="space-y-6">
        <header>
            <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>{project.name}</h1>
            <p className={`text-[${colors.textSecondary}]`}>مرحباً بك، قم بإدارة ميزانية وجداول مشروعك من هنا.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="الميزانية الكلية" value={fmtCurrency(project.total, currency)} icon={DollarSign} />
            <StatCard title="المدفوع" value={fmtCurrency(paid, currency)} icon={DollarSign} />
            <StatCard title="المتبقي" value={fmtCurrency(remaining, currency)} icon={DollarSign} />
            <StatCard title="نسبة الإنفاق" value={`${paidPct}%`} icon={DollarSign} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProjectDetailsForm project={project} updateProject={updateProject} currency={currency} />
            <SpendingBreakdownChart paid={paid} remaining={remaining} paidPct={paidPct} currency={currency} />
        </div>

        <BudgetCategoriesSection 
            categories={categories} 
            addCategory={addCategory} 
            removeCategory={removeCategory} 
            updateCategory={updateCategory} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentsSection 
                payments={payments} 
                categories={categories} // For category dropdown
                addPayment={addPayment} 
                removePayment={removePayment} 
                updatePayment={updatePayment} 
            />
            <MilestonesSection 
                milestones={milestones} 
                addMilestone={addMilestone} 
                removeMilestone={removeMilestone} 
                updateMilestone={updateMilestone} 
            />
        </div>

        <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
            <h3 className="text-lg font-semibold mb-3">الجدول الزمني البصري</h3>
            <Timeline startDate={project.start} endDate={project.end} milestones={milestones} onMove={updateMilestone} />
        </div>
    </div>
  );
}

export default ProjectDashboard;