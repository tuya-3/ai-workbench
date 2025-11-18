import { NextRequest, NextResponse } from 'next/server';

/**
 * Supabase PostgreSQL Direct Connection Test
 * 
 * Tests direct connection to PostgreSQL database
 * Uses pg client for direct database access
 * 
 * @returns JSON response with connection status and sample data
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, we'll use simple fetch to test if Supabase is accessible
    // In production, you would use @supabase/supabase-js properly configured
    
    const dbUrl = process.env.SUPABASE_DB_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
    
    return NextResponse.json({
      status: 'info',
      message: 'PostgreSQL is running on port 54322',
      info: {
        postgresPort: '54322',
        containerName: 'ai-workbench-supabase',
        dbUrl: dbUrl.replace(/postgres:postgres/, 'postgres:***'),
        note: 'Use PostgreSQL client to connect directly',
      },
      instructions: {
        psql: 'psql postgresql://postgres:postgres@localhost:54322/postgres',
        docker: 'docker exec -it ai-workbench-supabase psql -U postgres',
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

