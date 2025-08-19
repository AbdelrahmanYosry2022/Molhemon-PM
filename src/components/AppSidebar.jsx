// src/components/AppSidebar.jsx
import React from 'react';
import { motion } from "framer-motion";
import { Plus, Trash2, ChevronsLeft, ChevronsRight, LayoutDashboard } from "lucide-react";
import { colors } from '../utils/colors';

function AppSidebar({ projects, activeId, setActiveId, addProject, deleteProject, activeProject, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`bg-[${colors.sidebar}] border-l border-[${colors.border}] transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-72' : 'w-20'}`}>
      <div className={`p-4 border-b border-[${colors.border}] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`flex items-center gap-2 overflow-hidden transition-opacity ${!sidebarOpen && 'opacity-0 w-0 h-0'}`}>
              <LayoutDashboard style={{ color: colors.primary }} />
              <h1 className="text-lg font-bold">لوحة التحكم</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1.5 rounded-md text-[${colors.primary}] hover:bg-[${colors.primaryMuted}]`}>
              {sidebarOpen ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
          <h2 className={`text-sm font-semibold text-[${colors.textSecondary}] mb-3 transition-all ${!sidebarOpen && 'text-center'}`}>{sidebarOpen ? 'المشاريع' : ' '}</h2>
          <div className="space-y-2">
              {projects.map(p => (
                  <button 
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      className={`w-full text-right p-2.5 rounded-md text-sm font-medium transition-colors ${activeId === p.id ? `bg-[${colors.primaryMuted}] text-[${colors.primary}]` : `hover:bg-[${colors.border}]`}`}
                  >
                      {sidebarOpen ? p.name : <span className="flex items-center justify-center font-bold">{p.name.charAt(0).toUpperCase()}</span>}
                  </button>
              ))}
          </div>
      </div>
      <div className="p-4 border-t border-[${colors.border}] space-y-2">
          <button onClick={addProject} className={`w-full px-4 py-2.5 rounded-md bg-[${colors.primary}] text-white hover:bg-[${colors.primaryHover}] inline-flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
            <Plus size={16} /> {sidebarOpen && 'مشروع جديد'}
          </button>
          <button onClick={deleteProject} disabled={!activeProject} className={`w-full px-4 py-2.5 rounded-md bg-[${colors.destructiveMuted}] text-[${colors.destructive}] hover:bg-[${colors.destructiveMuted}]/60 inline-flex items-center gap-2 disabled:opacity-50 ${!sidebarOpen && 'justify-center'}`}>
            <Trash2 size={16} /> {sidebarOpen && 'حذف المشروع'}
          </button>
      </div>
    </aside>
  );
}

export default AppSidebar;