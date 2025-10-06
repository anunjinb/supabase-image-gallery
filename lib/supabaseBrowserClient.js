import { createClient } from "@supabase/supabase-js";

// Vite exposes only VITE_* vars to the browser
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
