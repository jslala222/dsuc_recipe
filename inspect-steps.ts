
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHFtc2JxdGdkYWNjY3FrcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTI5ODMsImV4cCI6MjA4NDkyODk4M30.7ADXbt6pT-MF1KYybdGE7wbtK5YaULby2OLwh65cj2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectStepsSchema() {
    console.log('Fetching one step to inspect structure...');

    // creating a dummy step to check columns returned
    // we can't insert easily without a recipe_id, so let's try to just select
    const { data, error } = await supabase.from('recipe_steps').select('*').limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.log('Table missing (unexpected)');
        } else {
            console.error('Error fetching step:', error);
        }
    } else {
        // If table is empty, we can't see columns from data.
        // access internal property? No.
        // We will assume it is correct if it exists, or try to insert a dummy if we had a recipe.
        // Let's just create a dummy recipe first? No, too invasive.

        // Actually, we can check if we can select 'images' column specifically.
        const { error: colError } = await supabase.from('recipe_steps').select('images').limit(1);
        if (colError) {
            console.log('Column "images" checking failed:', colError.message);
        } else {
            console.log('Column "images" exists!');
        }
    }
}

inspectStepsSchema();
