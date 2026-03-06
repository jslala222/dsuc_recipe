
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHFtc2JxdGdkYWNjY3FrcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTI5ODMsImV4cCI6MjA4NDkyODk4M30.7ADXbt6pT-MF1KYybdGE7wbtK5YaULby2OLwh65cj2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('Fetching one recipe to inspect structure...');

    const { data, error } = await supabase.from('recipes').select('*').limit(1);

    if (error) {
        console.error('Error fetching recipe:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Column keys found:', Object.keys(data[0]));
            console.log('Sample data:', data[0]);
        } else {
            console.log('Table is empty. Cannot inspect columns via select.');
            // Try inserting a dummy to check columns? No, that might fail constraints.
            // We will assume it matches the interface for now or ask user.
        }
    }
}

inspectSchema();
