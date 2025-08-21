import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function for raw SQL, if needed for specific roles/queries
export async function supabaseAdminRpc(functionName, args) {
    const { data, error } = await supabase.rpc(functionName, args);
    if (error) {
        console.error(`Error calling RPC ${functionName}:`, error);
        throw error;
    }
    return data;
}

// SQL function to get DB size. You need to add this in the Supabase SQL Editor.
/*
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS BIGINT AS $$
  SELECT sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::BIGINT 
  FROM pg_tables 
  WHERE schemaname = 'public';
$$ LANGUAGE SQL;
*/
