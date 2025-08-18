import { createClient } from '@supabase/supabase-js'

// استبدل 'YOUR_SUPABASE_URL' بالرابط الخاص بمشروعك على Supabase
const supabaseUrl = 'https://zsshxpdgbnxfuszanaeo.supabase.co';

// استبدل 'YOUR_SUPABASE_ANON_KEY' بمفتاح Anon Key الخاص بمشروعك
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzc2h4cGRnYm54ZnVzemFuYWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDg5ODUsImV4cCI6MjA3MTA4NDk4NX0._g0c6zUR2PCJwMShgyANjWK_qAqKvs2y1qltHhL9x38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);