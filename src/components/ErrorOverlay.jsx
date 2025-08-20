// src/components/ErrorOverlay.jsx
import React from "react";

export default function ErrorOverlay({ error }) {
  const message = error?.message || String(error);
  const stack = error?.stack || "";

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0b1020",
      color: "#f5f7ff",
      padding: 24,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial"
    }}>
      <div style={{
        width: "min(960px, 92vw)",
        background: "#121833",
        border: "1px solid #243056",
        borderRadius: 16,
        padding: 24
      }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Runtime error</h1>
        <p style={{ opacity: 0.9, lineHeight: 1.7 }}>
          حصل خطأ أثناء تحميل التطبيق. راجع الرسالة والـ stack عشان نحدده.
        </p>
        <div style={{
          background: "#1a2344",
          padding: 12,
          borderRadius: 12,
          marginTop: 8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}>
          <strong style={{ display: "block", marginBottom: 8 }}>Message:</strong>
          {message}
        </div>
        {stack && (
          <div style={{
            background: "#0e1430",
            padding: 12,
            borderRadius: 12,
            marginTop: 12,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
            maxHeight: "40vh"
          }}>
            <strong style={{ display: "block", marginBottom: 8 }}>Stack:</strong>
            {stack}
          </div>
        )}
        <p style={{ opacity: 0.8, marginTop: 16 }}>
          لو مش واضح، ابعتهالي زي ما هو.
        </p>
      </div>
    </div>
  );
}
