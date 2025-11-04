/**
 * Dify Client Integration Example
 * 
 * This is a minimal example showing how to integrate Dify workflows.
 * Expand this implementation as your project grows.
 * 
 * See Dify API docs: https://docs.dify.ai/api-reference
 */

/**
 * Basic Dify client for chat interactions
 */
export class DifyClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Send a chat message to Dify workflow
   */
  async sendMessage(query: string, userId: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        user: userId,
        response_mode: 'blocking',
      }),
    });

    if (!response.ok) {
      throw new Error(`Dify API error: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Usage example
 */
export async function exampleUsage() {
  const client = new DifyClient(
    process.env.NEXT_PUBLIC_DIFY_API_URL || '',
    process.env.DIFY_API_KEY || ''
  );

  const response = await client.sendMessage('Hello!', 'user-123');
  console.log('AI Response:', response.answer);
}
