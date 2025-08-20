// src/components/Timeline.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, TimerReset } from "lucide-react";
import { colors } from "../utils/colors";
import { parseDate, pctFromDate, dateFromPct, toISO, monthTicks, clamp, daysBetween } from "../utils/helpers";
import Pill from "./ui/Pill"; // Assuming Pill is in ui/

function Timeline({ startDate, endDate, milestones, onMove }) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const wrapRef = useRef(null);
    const [drag, setDrag] = useState(null);

    const totalDays = (start && end) ? Math.max(1, daysBetween(start, end)) : 0;
    const items = (milestones || []).map((m, i) => {
        const d = parseDate(m.date);
        let pct = 0;
        if (start && end && d) pct = pctFromDate(start, end, d);
        return { ...m, pct, key: m.id || i };
    });

    const today = new Date();
    const todayPct = start && end ? pctFromDate(start, end, today) : null;
    const ticks = useMemo(() => monthTicks(start, end), [start, end]);

    useEffect(() => {
        function onMoveInternal(e) {
            if (drag == null || !wrapRef.current) return;
            const rect = wrapRef.current.getBoundingClientRect();
            const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
            let pct = x * 100;
            if (drag.snap && start && end && ticks.length) {
                let nearest = ticks[0];
                let minDiff = Infinity;
                for (const t of ticks) {
                    const p = pctFromDate(start, end, t.date);
                    const diff = Math.abs(p - pct);
                    if (diff < minDiff) { minDiff = diff; nearest = t; }
                }
                pct = pctFromDate(start, end, nearest.date);
            }
            setDrag((d) => ({ ...d, pct }));
        }
        function onUp() {
            if (drag != null && start && end && onMove) {
                const newDate = dateFromPct(start, end, drag.pct);
                onMove(drag.id, { date: toISO(newDate) });
            }
            setDrag(null);
        }
        window.addEventListener("mousemove", onMoveInternal);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMoveInternal);
            window.removeEventListener("mouseup", onUp);
        };
    }, [drag, start, end, onMove, ticks]);

    return (
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <Pill icon={Calendar}>من {start ? start.toLocaleDateString() : "—"} إلى {end ? end.toLocaleDateString() : "—"}</Pill>
            <div className="flex items-center gap-2">
              {todayPct != null && (<Pill icon={TimerReset}>اليوم عند {Math.round(todayPct)}%</Pill>)}
              <Pill icon={TimerReset}>{totalDays ? `${totalDays} يوم` : "حدد المدة"}</Pill>
            </div>
          </div>
    
          <div ref={wrapRef} className={`relative h-40 rounded-lg bg-[${colors.surface}] border border-[${colors.border}] overflow-hidden`}>
            {todayPct != null && (
              <div className={`absolute inset-y-0 left-0 bg-[${colors.primaryMuted}]`} style={{ width: `${todayPct}%` }} />
            )}
            <div className={`absolute left-6 right-6 top-4 flex justify-between text-[10px] text-[${colors.textSubtle}] pointer-events-none`}>
              {ticks.map((t, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-px h-3 bg-[${colors.divider}]`} />
                  <div className="translate-x-[-50%] mt-2">{t.label}</div>
                </div>
              ))}
            </div>
            <div className={`absolute left-6 right-6 top-1/2 -translate-y-1/2 h-2 rounded-full bg-[${colors.border}]`} />
            {todayPct != null && (
              <div className={`absolute top-6 bottom-6 w-px bg-[${colors.info}]`} style={{ left: `calc(${todayPct}%)` }} />
            )}
            {items.map((m) => {
              const pct = drag && drag.id === m.id ? drag.pct : m.pct;
              return (
                <div key={m.key} className="absolute" style={{ left: `calc(${pct}% - 12px)`, top: "30px" }}>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                    <button
                      className={`w-6 h-6 rounded-full ring-4 cursor-grab active:cursor-grabbing transition-transform hover:scale-110 ${m.status === "done" ? `bg-[${colors.primary}] ring-[${colors.primaryMuted}]` : m.status === "at-risk" ? `bg-[${colors.warning}] ring-[${colors.warningMuted}]` : `bg-[${colors.info}] ring-[${colors.infoMuted}]`}`}
                      title={`${m.title} • ${m.date || "—"}`}
                      onMouseDown={(e) => {
                        if (!wrapRef.current) return;
                        const rect = wrapRef.current.getBoundingClientRect();
                        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
                        setDrag({ id: m.id, pct: x * 100, snap: e.shiftKey });
                      }}
                      onMouseMove={(e) => {
                        if (drag && drag.id === m.id) setDrag(d => d ? { ...d, snap: e.shiftKey } : d);
                      }}
                    />
                  </motion.div>
                  <div className={`absolute -left-28 w-56 text-center text-xs mt-2 text-[${colors.textPrimary}]`}>
                    <div className="truncate font-medium">{m.title || "معلم"}</div>
                    <div className={`opacity-70 text-[${colors.textSubtle}]`}>{m.date || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-2 text-[11px] text-[${colors.textSubtle}]`}>💡 اضغط مع السحب مع زر <b>Shift</b> للـ Snap لأقرب بداية شهر.</div>
        </div>
      );
}

export default Timeline;