
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHFtc2JxdGdkYWNjY3FrcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTI5ODMsImV4cCI6MjA4NDkyODk4M30.7ADXbt6pT-MF1KYybdGE7wbtK5YaULby2OLwh65cj2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStepsTable() {
    console.log('Checking for recipe_steps table...');

    try {
        const { data, error } = await supabase.from('recipe_steps').select('count', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01') {
                console.log('RESULT: STEPS_TABLE_MISSING');
            } else {
                console.error('Error detail:', error);
                console.log('RESULT: CONNECTION_ERROR');
            }
        } else {
            console.log('RESULT: STEPS_TABLE_EXISTS');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkStepsTable();
