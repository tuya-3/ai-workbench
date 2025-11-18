import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Connection Test API
 * 
 * Tests the connection to Supabase and retrieves sample data
 * 
 * @returns JSON response with connection status and sample data
 */
export async function GET(request: NextRequest) {
  try {
    // Get Supabase configuration from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase configuration is missing. Please check your .env.local file.',
          details: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey,
          },
        },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test query: Get users from the database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .limit(5);

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to query Supabase',
          error: error.message,
          hint: 'Make sure Supabase is running and the schema is applied',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      data: {
        userCount: users?.length || 0,
        users: users || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

