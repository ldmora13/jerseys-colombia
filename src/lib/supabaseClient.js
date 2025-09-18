import { createClient } from '@supabase/supabase-js'
import {getAuth} from 'firebase/auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY


export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSupabaseClient() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const token = await user.getIdToken(true); // Token de Firebase

  // Esto establece el token en la sesión de Supabase
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token // Firebase no tiene refresh_token, pero Supabase lo requiere en el objeto
  });

  return supabase;
}