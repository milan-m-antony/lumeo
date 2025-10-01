// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // This is needed to handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set for the function.');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { email, token, password } = await req.json();
    
    // --- REQUEST A PASSWORD RESET ---
    if (req.method === 'POST') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: corsHeaders });
      }

      // Send a password reset OTP. Supabase handles the token generation and sending.
      // This is the correct method.
      const { error: otpError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: '/reset-password-callback' // This is a placeholder, we are using a custom token flow.
      });

      if (otpError) {
        // Don't reveal if a user doesn't exist.
        console.warn(`Password reset attempt for ${email} resulted in error: ${otpError.message}`);
      }

      // Always return a generic success message to prevent user enumeration.
      return new Response(JSON.stringify({ message: 'If a user with this email exists, a reset code has been sent.' }), { status: 200, headers: corsHeaders });
    }

    // --- VERIFY TOKEN AND UPDATE PASSWORD ---
    if (req.method === 'PUT') {
      if (!email || !token || !password) {
        return new Response(JSON.stringify({ error: 'Email, token, and new password are required' }), { status: 400, headers: corsHeaders });
      }

      // 1. Verify the OTP
      const { data: { session }, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      
      if (verifyError || !session || !session.user) {
         return new Response(JSON.stringify({ error: 'Invalid or expired reset code' }), { status: 400, headers: corsHeaders });
      }

      // 2. Update the user's password using the admin client.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        session.user.id,
        { password: password }
      );
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({ message: 'Password updated successfully' }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });

  } catch (error) {
    console.error('Edge Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred' }), { status: 500, headers: corsHeaders });
  }
});
