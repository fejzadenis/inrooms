import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  demoId: string
  userId: string
  duration?: number // in days
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { demoId, userId, duration = 30 }: RequestBody = await req.json()

    if (!demoId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Demo ID and user ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user has permission to feature this demo
    const { data: demo, error: demoError } = await supabaseClient
      .from('demos')
      .select('hostId')
      .eq('id', demoId)
      .single()

    if (demoError) {
      console.error('Error fetching demo:', demoError)
      return new Response(
        JSON.stringify({ error: 'Demo not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is the host or an admin
    if (demo.hostId !== userId) {
      // Check if user is admin
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userError || user.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Only the demo host or an admin can feature a demo' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Calculate expiry date
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + duration)

    // Update the demo to be featured
    const { error: updateError } = await supabaseClient
      .from('demos')
      .update({
        isFeatured: true,
        featuredUntil: expiryDate.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', demoId)

    if (updateError) {
      console.error('Error featuring demo:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to feature demo' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo featured successfully',
        featuredUntil: expiryDate.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error featuring demo:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})