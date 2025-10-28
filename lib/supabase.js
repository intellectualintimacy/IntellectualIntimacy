import { createClient } from '@supabase/supabase-js'

// ✅ Replace these with your actual credentials from the Supabase project settings
const SUPABASE_URL = 'https://bfslxydsnahvaguiitay.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmc2x4eWRzbmFodmFndWlpdGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzM3MzksImV4cCI6MjA3NjY0OTczOX0.ChHNGus5oJJFlYinAzQBgNIrKqN3wOg25KwodTMxv00'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
