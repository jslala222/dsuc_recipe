import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
    const { data, error } = await supabase.from('recipe_customers').select('*');
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('recipe_customers:', data);
    }
}

check();
