import { NextResponse } from 'next/server';

/**
 * Health Check API
 * 
 * Simple endpoint to verify the API is running
 * 
 * @returns JSON response with status and timestamp
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Workbench API is running',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
}

