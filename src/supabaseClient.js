// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ناخد القيم من .env (Vite بيحمّلها تلقائيًا مع البادئة VITE_)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let _client = null;

// هاننشئ العميل أول مرة فقط وقت الاستخدام
function getClient() {
  if (!_client) {
    if (!/^https?:\/\//i.test(SUPABASE_URL)) {
      throw new Error('VITE_SUPABASE_URL غير مضبوط أو لا يبدأ بـ https://');
    }
    if (!SUPABASE_KEY) {
      throw new Error('VITE_SUPABASE_ANON_KEY غير مضبوط.');
    }
    _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _client;
}

// Proxy يخلي أي نداء لـ supabase.* يروح للعميل الحقيقي بعد التأكد من المتغيرات
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getClient();
      const value = client[prop];
      // لو الخاصية دالة، نربط this علشان ما يبوظش
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
    // دعم النداء كمُستدعى لو حد كتب supabase() بالغلط
    apply(_target, _thisArg, args) {
      const client = getClient();
      return client.apply(client, args);
    },
  }
);

// في حالة احتجت تستدعيه يدويًا
export function getSupabase() {
  return getClient();
}
