import { createClient } from '@supabase/supabase-js';


// Initialize the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://myjnrwiprelkondwjitf.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15am5yd2lwcmVsa29uZHdqaXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTQyNDQsImV4cCI6MjA2MDA3MDI0NH0.o26Idc8A0nRUxwzTN_F4bN--5rbJitx9eBDOTRAdjco"
);