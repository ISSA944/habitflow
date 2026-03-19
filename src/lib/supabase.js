import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const hasCredentials = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10

// Chain-safe mock that resolves to empty data for any method chain
function createMockChain() {
  const resolved = Promise.resolve({ data: [], error: null })
  const chain = new Proxy(resolved, {
    get(target, prop) {
      if (prop in target) return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop]
      return () => chain
    }
  })
  return chain
}

const mockClient = {
  from: () => createMockChain()
}

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient

export const isConnected = hasCredentials
