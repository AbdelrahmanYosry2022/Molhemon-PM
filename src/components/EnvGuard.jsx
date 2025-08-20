// src/components/EnvGuard.jsx
import React from "react";

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

function validateEnv() {
  const missing = required.filter((k) => !import.meta.env[k]);
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const looksLikeUrl = /^https?:\/\/.+/i.test(url);
  return {
    ok: missing.length === 0 && looksLikeUrl,
    missing,
    looksLikeUrl,
  };
}

export default function EnvGuard({ children }) {
  const { ok, missing, looksLikeUrl } = validateEnv();

  if (!ok) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b1020",
        color: "#f5f7ff",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial"
      }}>
        <div style={{
          maxWidth: 720,
          width: "100%",
          background: "#121833",
          border: "1px solid #243056",
          borderRadius: 16,
          padding: 24
        }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Environment check failed</h1>
          <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            التطبيق مش قادر يقرأ متغيرات البيئة المطلوبة لتشغيل Supabase.
          </p>
          {missing.length > 0 && (
            <div style={{ background: "#1a2344", padding: 12, borderRadius: 12, marginBottom: 12 }}>
              <strong>المتغيّرات الناقصة:</strong>
              <ul style={{ marginTop: 8 }}>
                {missing.map((m) => <li key={m}><code>{m}</code></li>)}
              </ul>
            </div>
          )}
          {!looksLikeUrl && (
            <div style={{ background: "#1a2344", padding: 12, borderRadius: 12, marginBottom: 12 }}>
              <strong>صيغة عنوان Supabase غير صحيحة:</strong>
              <div style={{ marginTop: 6 }}>
                <code>VITE_SUPABASE_URL</code> لازم يبدأ بـ <code>https://</code>
              </div>
            </div>
          )}
          <ol style={{ lineHeight: 1.8 }}>
            <li>ملف <code>.env</code> في جذر المشروع.</li>
            <li>الأسماء بالضبط:
              <pre style={{ marginTop: 8, background: "#0e1430", padding: 12, borderRadius: 10 }}>
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
              </pre>
            </li>
            <li>بدون علامات اقتباس للقيم.</li>
            <li>أعد تشغيل السيرفر: <code>npm run dev</code></li>
          </ol>
        </div>
      </div>
    );
  }

  return children;
}
