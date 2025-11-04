/**
 * Supabase Client Integration Example
 * 
 * This is a minimal example showing how to integrate Supabase.
 * Expand this implementation as your project grows.
 * 
 * See Supabase docs: https://supabase.com/docs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for client-side use
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Usage example: Fetch data from a table
 */
export async function exampleQuery() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}

/**
 * Usage example: Insert data
 */
export async function exampleInsert() {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { email: 'user@example.com', full_name: 'Example User' }
    ])
    .select();

  if (error) {
    console.error('Error inserting data:', error);
    return null;
  }

  return data;
}
