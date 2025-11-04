/**
 * Supabase Client Integration Example
 * 
 * This example demonstrates how to integrate Supabase in your Next.js application.
 * It includes database queries, real-time subscriptions, and authentication.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types for our database schema
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  dify_conversation_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  user_id: string;
  conversation_id?: string;
  workflow_name: string;
  workflow_id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output: Record<string, any>;
  error?: string;
  duration_ms?: number;
  created_at: string;
  completed_at?: string;
}

/**
 * Create a Supabase client for client-side use
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Create a Supabase client for server-side use (with service role)
 */
export function createSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Example: Authentication operations
 */
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }
}

/**
 * Example: Profile operations
 */
export class ProfileService {
  constructor(private supabase: SupabaseClient) {}

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }
}

/**
 * Example: Conversation operations
 */
export class ConversationService {
  constructor(private supabase: SupabaseClient) {}

  async createConversation(
    userId: string,
    title: string,
    difyConversationId?: string
  ): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        dify_conversation_id: difyConversationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  }

  async deleteConversation(conversationId: string) {
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    return { error };
  }

  /**
   * Subscribe to new conversations
   */
  subscribeToConversations(
    userId: string,
    callback: (conversation: Conversation) => void
  ) {
    return this.supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Conversation);
        }
      )
      .subscribe();
  }
}

/**
 * Example: Message operations
 */
export class MessageService {
  constructor(private supabase: SupabaseClient) {}

  async addMessage(
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<Message | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return data;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data;
  }

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }
}

/**
 * Example: Workflow run operations
 */
export class WorkflowRunService {
  constructor(private supabase: SupabaseClient) {}

  async createWorkflowRun(
    userId: string,
    workflowName: string,
    input: Record<string, any>,
    conversationId?: string
  ): Promise<WorkflowRun | null> {
    const { data, error } = await this.supabase
      .from('workflow_runs')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        workflow_name: workflowName,
        status: 'pending',
        input,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow run:', error);
      return null;
    }

    return data;
  }

  async updateWorkflowRun(
    runId: string,
    updates: Partial<WorkflowRun>
  ) {
    const { data, error } = await this.supabase
      .from('workflow_runs')
      .update(updates)
      .eq('id', runId)
      .select()
      .single();

    return { data, error };
  }

  async getWorkflowRuns(userId: string): Promise<WorkflowRun[]> {
    const { data, error } = await this.supabase
      .from('workflow_runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow runs:', error);
      return [];
    }

    return data;
  }
}

/**
 * Example usage
 */
export async function exampleUsage() {
  const supabase = createSupabaseClient();
  
  // Authentication
  const authService = new AuthService(supabase);
  const user = await authService.getCurrentUser();
  
  if (!user) {
    console.log('User not authenticated');
    return;
  }

  // Conversations
  const conversationService = new ConversationService(supabase);
  const conversation = await conversationService.createConversation(
    user.id,
    'My first conversation'
  );

  if (conversation) {
    // Messages
    const messageService = new MessageService(supabase);
    await messageService.addMessage(
      conversation.id,
      user.id,
      'user',
      'Hello, AI!'
    );

    // Subscribe to new messages
    messageService.subscribeToMessages(conversation.id, (message) => {
      console.log('New message:', message);
    });

    // Get all messages
    const messages = await messageService.getMessages(conversation.id);
    console.log('Messages:', messages);
  }

  // Workflow runs
  const workflowService = new WorkflowRunService(supabase);
  const run = await workflowService.createWorkflowRun(
    user.id,
    'example-workflow',
    { query: 'Test input' },
    conversation?.id
  );

  if (run) {
    // Update run status
    await workflowService.updateWorkflowRun(run.id, {
      status: 'completed',
      output: { result: 'Test output' },
      duration_ms: 1500,
      completed_at: new Date().toISOString(),
    });
  }
}
