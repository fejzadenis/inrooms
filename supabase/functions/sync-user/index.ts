import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UserData {
  id: string;
  email: string;
  name: string; 
  role: 'user' | 'admin';
  photo_url?: string;
  avatar_url?: string;
  subscription_status: string;
  subscription_trial_ends_at?: Date;
  subscription_events_quota: number;
  subscription_events_used: number;
  profile_title?: string;
  profile_company?: string;
  profile_location?: string;
  profile_about?: string;
  profile_phone?: string;
  profile_website?: string;
  profile_linkedin?: string;
  profile_skills?: string[];
  profile_points?: number;
  connections?: string[];
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  stripe_current_period_end?: Date;
  is_founder?: boolean;
  founder_status?: string;
  company_stage?: string;
  looking_for?: string[];
  social_links?: Record<string, string>;
  bio?: string;
  interests?: string[];
  email_verified?: boolean;
  email_verified_at?: Date;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userData: UserData = await req.json();

    // Validate required fields
    if (!userData.id || !userData.email || !userData.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, email, name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare data for Supabase users table
    const supabaseUserData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      photo_url: userData.photo_url || null,
      avatar_url: userData.avatar_url || userData.photo_url || null,
      subscription_status: userData.subscription_status,
      subscription_trial_ends_at: userData.subscription_trial_ends_at || null,
      subscription_events_quota: userData.subscription_events_quota,
      subscription_events_used: userData.subscription_events_used,
      profile_title: userData.profile_title || null,
      profile_company: userData.profile_company || null,
      profile_location: userData.profile_location || null,
      profile_about: userData.profile_about || null,
      profile_phone: userData.profile_phone || null,
      profile_website: userData.profile_website || null,
      profile_linkedin: userData.profile_linkedin || null,
      profile_skills: userData.profile_skills || [],
      profile_points: userData.profile_points || 0,
      connections: userData.connections || [],
      stripe_customer_id: userData.stripe_customer_id || null,
      stripe_subscription_id: userData.stripe_subscription_id || null,
      stripe_subscription_status: userData.stripe_subscription_status || null,
      stripe_current_period_end: userData.stripe_current_period_end || null,
      is_founder: userData.is_founder || false,
      founder_status: userData.founder_status || null,
      company_stage: userData.company_stage || null,
      looking_for: userData.looking_for || [],
      social_links: userData.social_links || {},
      bio: userData.bio || null,
      interests: userData.interests || [],
      email_verified: userData.email_verified || false,
      email_verified_at: userData.email_verified_at || null,
      updated_at: new Date().toISOString(),
    };

    // Upsert user data (insert or update if exists)
    const { error } = await supabaseClient
      .from('users')
      .upsert(supabaseUserData, {
        onConflict: 'id', 
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Supabase upsert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to sync user data', details: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User data synced successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Sync user function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});