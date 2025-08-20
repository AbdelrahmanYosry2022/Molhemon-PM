// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import EnvGuard from './components/EnvGuard.jsx'
import ErrorOverlay from './components/ErrorOverlay.jsx'

// عقدة الجذر
const rootEl = document.getElementById('root')
const root = ReactDOM.createRoot(rootEl)

function renderError(err) {
  root.render(
    <React.StrictMode>
      <ErrorOverlay error={err} />
    </React.StrictMode>
  )
}

// التقاط أخطاء غير مُعالجة على مستوى النافذة
window.addEventListener('error', (e) => {
  renderError(e.error || e.message || 'Unknown error')
})
window.addEventListener('unhandledrejection', (e) => {
  renderError(e.reason || 'Unhandled promise rejection')
})

// تحميل التطبيق ديناميكيًا داخل try/catch
async function bootstrap() {
  try {
    const { default: App } = await import('./App.jsx')
    root.render(
      <React.StrictMode>
        <EnvGuard>
          <App />
        </EnvGuard>
      </React.StrictMode>
    )
  } catch (err) {
    renderError(err)
  }
}

bootstrap()
