// src/components/AppSidebar.jsx
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Plus, Trash2, ChevronsLeft, ChevronsRight, LayoutDashboard, MoreVertical, Edit } from "lucide-react";
import { colors } from '../utils/colors';

function AppSidebar({ projects, activeId, setActiveId, addProject, deleteProject, activeProject, sidebarOpen, setSidebarOpen, openEditModal, openConfirmDelete }) {
  const [menuOpen, setMenuOpen] = useState(null);

  const toggleMenu = (projectId) => {
    setMenuOpen(menuOpen === projectId ? null : projectId);
  };

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
                  <div key={p.id} className="relative">
                    <button 
                        onClick={() => setActiveId(p.id)}
                        className={`w-full text-right p-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeId === p.id ? `bg-[${colors.primaryMuted}] text-[${colors.primary}]` : `hover:bg-[${colors.border}]`}`}
                    >
                        <img src={p.image_url || 'https://placehold.co/32x32/e2e8f0/e2e8f0'} alt={p.name} className="w-8 h-8 rounded-full" />
                        {sidebarOpen && <span className="flex-grow">{p.name}</span>}
                        {sidebarOpen && (
                          <button onClick={(e) => { e.stopPropagation(); toggleMenu(p.id); }} className="p-1 rounded-md hover:bg-gray-200">
                            <MoreVertical size={16} />
                          </button>
                        )}
                    </button>
                    {menuOpen === p.id && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        <button onClick={() => { openEditModal(p); setMenuOpen(null); }} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <Edit size={14} />
                          تعديل بيانات المشروع
                        </button>
                        <button onClick={() => { openConfirmDelete?.(p); setMenuOpen(null); }} className="w-full text-right px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 size={14} />
                          حذف المشروع
                        </button>
                      </div>
                    )}
                  </div>
              ))}
          </div>
      </div>
      <div className="p-4 border-t border-[${colors.border}] space-y-2">
          <button onClick={addProject} className={`w-full px-4 py-2.5 rounded-md bg-[${colors.primary}] text-white hover:bg-[${colors.primaryHover}] inline-flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
            <Plus size={16} /> {sidebarOpen && 'مشروع جديد'}
          </button>
      </div>
    </aside>
  );
}

export default AppSidebar;