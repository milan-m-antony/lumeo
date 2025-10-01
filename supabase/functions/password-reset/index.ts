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

      // This is the correct method. It sends an email with a reset token/link.
      // Make sure your "Reset password" email template in Supabase is configured.
      const { error: otpError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: '/reset-password-callback' // This is a placeholder and not used in our OTP flow.
      });

      if (otpError) {
        // Do not reveal if a user doesn't exist.
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

      // 1. Verify the OTP sent to the user's email.
      const { data: { session }, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      
      if (verifyError || !session || !session.user) {
         return new Response(JSON.stringify({ error: 'Invalid or expired reset code' }), { status: 400, headers: corsHeaders });
      }

      // 2. Use the admin client to update the user's password. This requires the user's ID.
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
