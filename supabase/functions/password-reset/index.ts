import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-control-Allow-Methods': 'POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a new Supabase client with the service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to generate a random 6-digit code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to hash the OTP
async function hashToken(token: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, token, password } = await req.json();
    
    // --- REQUEST A PASSWORD RESET ---
    if (req.method === 'POST') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: corsHeaders });
      }

      // 1. Get the user by email
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (userError || !user) {
        // Don't reveal if user exists or not for security reasons
        console.warn(`Password reset attempt for non-existent user: ${email}`);
        return new Response(JSON.stringify({ message: 'If a user with this email exists, a reset code has been sent.' }), { status: 200, headers: corsHeaders });
      }

      // 2. Generate and hash the OTP
      const otp = generateOTP();
      const tokenHash = await hashToken(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      // 3. Upsert the token into the database
      const { error: upsertError } = await supabaseAdmin
        .from('password_reset_tokens')
        .upsert({ user_id: user.user.id, token_hash: tokenHash, expires_at: expiresAt.toISOString() }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      // 4. Send the OTP via email using Supabase's built-in mailer
       const { error: mailerError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
            otp_code: otp
        }
      });
      // NOTE: For this to work, you need to customize your "Magic Link" email template in Supabase
      // to display the `{{ .Data.otp_code }}` variable.

      if (mailerError) throw mailerError;

      return new Response(JSON.stringify({ message: 'Password reset code sent.' }), { status: 200, headers: corsHeaders });
    }

    // --- VERIFY TOKEN AND UPDATE PASSWORD ---
    if (req.method === 'PUT') {
      if (!email || !token || !password) {
        return new Response(JSON.stringify({ error: 'Email, token, and new password are required' }), { status: 400, headers: corsHeaders });
      }

      // 1. Get the user
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid email or token' }), { status: 400, headers: corsHeaders });
      }

      // 2. Find the stored token
      const { data: storedToken, error: tokenError } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('token_hash, expires_at')
        .eq('user_id', user.user.id)
        .single();
      
      if (tokenError || !storedToken) {
        return new Response(JSON.stringify({ error: 'Invalid or expired reset code' }), { status: 400, headers: corsHeaders });
      }

      // 3. Verify the token and check expiry
      const tokenHash = await hashToken(token);
      if (tokenHash !== storedToken.token_hash) {
        return new Response(JSON.stringify({ error: 'Invalid or expired reset code' }), { status: 400, headers: corsHeaders });
      }
      if (new Date(storedToken.expires_at) < new Date()) {
        await supabaseAdmin.from('password_reset_tokens').delete().eq('user_id', user.user.id);
        return new Response(JSON.stringify({ error: 'Reset code has expired' }), { status: 400, headers: corsHeaders });
      }

      // 4. Update the user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.user.id,
        { password: password }
      );
      if (updateError) throw updateError;
      
      // 5. Invalidate the token by deleting it
      await supabaseAdmin.from('password_reset_tokens').delete().eq('user_id', user.user.id);

      return new Response(JSON.stringify({ message: 'Password updated successfully' }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred' }), { status: 500, headers: corsHeaders });
  }
});
