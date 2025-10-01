import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseWithAuth = (token) => {
  if (!token) {
    throw new Error('Supabase client with auth requires a JWT.');
  }

  // Create a new client instance with the user's auth token
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};


// Helper function for raw SQL, if needed for specific roles/queries
export async function supabaseAdminRpc(functionName, args) {
    const { data, error } = await supabase.rpc(functionName, args);
    if (error) {
        console.error(`Error calling RPC ${functionName}:`, error);
        throw error;
    }
    return data;
}
