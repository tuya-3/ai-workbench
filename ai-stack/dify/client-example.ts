/**
 * Dify Client Integration Example
 * 
 * This example demonstrates how to integrate Dify workflows in your Next.js application.
 * You can use this as a starting point for your AI features.
 */

// Types for Dify API
interface DifyConfig {
  apiUrl: string;
  apiKey: string;
}

interface ChatMessage {
  query: string;
  inputs?: Record<string, any>;
  response_mode?: 'streaming' | 'blocking';
  conversation_id?: string;
  user: string;
}

interface DifyResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  created_at: number;
}

/**
 * Dify Client Class
 */
export class DifyClient {
  private config: DifyConfig;

  constructor(config: DifyConfig) {
    this.config = config;
  }

  /**
   * Send a chat message to Dify workflow
   */
  async sendMessage(message: ChatMessage): Promise<DifyResponse> {
    const response = await fetch(`${this.config.apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message.inputs || {},
        query: message.query,
        response_mode: message.response_mode || 'blocking',
        conversation_id: message.conversation_id || '',
        user: message.user,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stream a chat message response
   */
  async streamMessage(
    message: ChatMessage,
    onChunk: (chunk: string) => void,
    onComplete: (response: DifyResponse) => void
  ): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: message.inputs || {},
        query: message.query,
        response_mode: 'streaming',
        conversation_id: message.conversation_id || '',
        user: message.user,
      }),
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    let fullResponse: DifyResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.event === 'message') {
            onChunk(data.answer);
          } else if (data.event === 'message_end') {
            fullResponse = data;
          }
        }
      }
    }

    if (fullResponse) {
      onComplete(fullResponse);
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(
    conversationId: string,
    user: string
  ): Promise<any[]> {
    const response = await fetch(
      `${this.config.apiUrl}/messages?conversation_id=${conversationId}&user=${user}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}

/**
 * Example usage in a Next.js API route or Server Component
 */
export async function exampleUsage() {
  // Initialize client
  const client = new DifyClient({
    apiUrl: process.env.NEXT_PUBLIC_DIFY_API_URL || '',
    apiKey: process.env.DIFY_API_KEY || '',
  });

  // Send a blocking message
  try {
    const response = await client.sendMessage({
      query: 'What is the weather like today?',
      user: 'user-123',
    });
    
    console.log('Response:', response.answer);
    console.log('Conversation ID:', response.conversation_id);
  } catch (error) {
    console.error('Error:', error);
  }

  // Stream a message
  try {
    await client.streamMessage(
      {
        query: 'Tell me a story',
        user: 'user-123',
      },
      (chunk) => {
        // Handle streaming chunks
        process.stdout.write(chunk);
      },
      (response) => {
        // Handle completion
        console.log('\nComplete response:', response);
      }
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export configured client instance
export function createDifyClient(): DifyClient {
  return new DifyClient({
    apiUrl: process.env.NEXT_PUBLIC_DIFY_API_URL || '',
    apiKey: process.env.DIFY_API_KEY || '',
  });
}
