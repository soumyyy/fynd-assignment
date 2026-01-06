import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null

if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey)
} else {
    console.error('⚠️ Supabase credentials missing or invalid! Check your .env file.')

    // Recursive stub to handle chained methods like .from().insert().select()
    const errorResult = { data: null, error: { message: "Supabase not configured! Check .env" } };

    const stub = () => ({
        select: stub,
        insert: stub,
        order: stub,
        limit: stub,
        single: stub,
        then: (resolve) => resolve(errorResult) // Makes it awaitable
    });

    client = {
        from: stub
    }
}

export const supabase = client
