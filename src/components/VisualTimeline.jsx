import React, { useMemo, useState, useRef, useEffect } from 'react';
import { CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { fmtCurrency } from '../utils/helpers';

const STATUS = {
  done: { color: 'bg-emerald-500 text-white', icon: CheckCircle2, label: 'منجز' },
  'in-progress': { color: 'bg-sky-500 text-white', icon: RefreshCw, label: 'قيد التنفيذ' },
  'at-risk': { color: 'bg-rose-500 text-white', icon: Clock, label: 'خطر' },
  upcoming: { color: 'bg-gray-300 text-gray-700', icon: Clock, label: 'قادم' },
};

export default function VisualTimeline({ items = [], deliverables = [], currency = 'EGP' }) {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const sorted = useMemo(() => {
    return [...(items || [])].sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [items]);

  useEffect(() => {
    // reset hover when items change
    setHovered(null);
  }, [items]);

  const onEnter = (e, item) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setPos({ left: rect.left - (containerRect?.left || 0) + rect.width / 2, top: rect.top - (containerRect?.top || 0) });
    setHovered(item.id || item.title);
  };
  const onLeave = () => setHovered(null);

  const renderIcon = (status) => {
    const st = STATUS[status] || STATUS['upcoming'];
    const Icon = st.icon || Clock;
    return <Icon size={18} />;
  };

  return (
    <div className="relative">
      <div ref={containerRef} className="overflow-x-auto py-4">
        <div className="min-w-full px-4">
          <div className="relative">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-8 py-6 px-2">
              {sorted.map((it, idx) => {
                const st = STATUS[it.status] || (it.status === 'in-progress' ? STATUS['in-progress'] : STATUS['upcoming']);
                const isDone = it.status === 'done';
                const nodeKey = it.id || idx;
                const deliverableCount = (it.deliverable_ids || []).length;
                return (
                  <div key={nodeKey} className="flex flex-col items-center min-w-[140px]">
                    <div
                      onMouseEnter={(e) => onEnter(e, it)}
                      onMouseLeave={onLeave}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border ${st.color} shadow-sm cursor-pointer`}
                      title={it.title}
                    >
                      {renderIcon(it.status)}
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-800 text-center">{it.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{it.date || '-'}</div>
                    <div className="text-xs text-gray-400 mt-1">{deliverableCount ? `${deliverableCount} مخرج` : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* tooltip */}
      {hovered && (() => {
        const item = sorted.find(it => (it.id || it.title) === hovered);
        if (!item) return null;
        return (
          <div style={{ left: pos.left }} className="absolute z-50 -translate-x-1/2 mt-2 w-64 bg-white border rounded-lg p-3 shadow-lg">
            <div className="text-sm font-semibold text-gray-800">{item.title}</div>
            <div className="text-xs text-gray-500 mt-1">{item.date || '—'}</div>
            {item.note ? <div className="text-xs text-gray-600 mt-2">{item.note}</div> : null}
            {item.budget ? <div className="text-xs text-gray-500 mt-2">الميزانية: {fmtCurrency(item.budget, currency)}</div> : null}
          </div>
        );
      })()}
    </div>
  );
}
