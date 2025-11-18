/**
 * Dify API Integration Example
 * 
 * This file demonstrates how to call Dify Workflow/API from Next.js API routes.
 * Use this as a reference when implementing API endpoints in your application.
 * 
 * See Dify API docs: https://docs.dify.ai/api-reference
 */

import { DifyClient } from './client-example';

/**
 * Example: Dify Workflow API call
 * 
 * This function shows how to call a Dify workflow from a server-side API.
 * You would typically use this pattern in Next.js API routes (app/api/*/route.ts).
 */
export async function callDifyWorkflow(inputs: Record<string, any>, userId: string = 'default-user') {
  const apiUrl = process.env.NEXT_PUBLIC_DIFY_API_URL || '';
  const apiKey = process.env.DIFY_API_KEY || '';

  if (!apiUrl || !apiKey) {
    throw new Error('Dify API URL and API Key must be configured in environment variables');
  }

  const client = new DifyClient(apiUrl, apiKey);

  try {
    // Example: Call Dify workflow
    // Replace 'your-workflow-id' with your actual Dify workflow ID
    const response = await fetch(`${apiUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs,
        response_mode: 'blocking', // or 'streaming' for real-time responses
        user: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Dify workflow:', error);
    throw error;
  }
}

/**
 * Example: Dify Chat Message API call
 * 
 * This function shows how to send a chat message to Dify.
 */
export async function sendDifyChatMessage(
  query: string,
  userId: string = 'default-user',
  conversationId?: string
) {
  const apiUrl = process.env.NEXT_PUBLIC_DIFY_API_URL || '';
  const apiKey = process.env.DIFY_API_KEY || '';

  if (!apiUrl || !apiKey) {
    throw new Error('Dify API URL and API Key must be configured in environment variables');
  }

  try {
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: 'blocking',
        conversation_id: conversationId || '',
        user: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dify API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message to Dify:', error);
    throw error;
  }
}

/**
 * Example: Next.js API Route implementation pattern
 * 
 * This is how you would use the above functions in a Next.js API route:
 * 
 * ```typescript
 * // app/api/dify/route.ts
 * import { NextRequest, NextResponse } from 'next/server';
 * import { callDifyWorkflow } from '@/ai-stack/dify/api-example';
 * 
 * export async function POST(request: NextRequest) {
 *   try {
 *     const { inputs, userId } = await request.json();
 *     const result = await callDifyWorkflow(inputs, userId);
 *     return NextResponse.json(result);
 *   } catch (error) {
 *     return NextResponse.json(
 *       { error: error instanceof Error ? error.message : 'Unknown error' },
 *       { status: 500 }
 *     );
 *   }
 * }
 * ```
 */

/**
 * Example usage in a server component or server action
 * 
 * ```typescript
 * import { sendDifyChatMessage } from '@/ai-stack/dify/api-example';
 * 
 * export async function handleChat(query: string, userId: string) {
 *   try {
 *     const response = await sendDifyChatMessage(query, userId);
 *     return response.answer;
 *   } catch (error) {
 *     console.error('Chat error:', error);
 *     throw error;
 *   }
 * }
 * ```
 */


