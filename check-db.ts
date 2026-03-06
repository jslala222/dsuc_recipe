
import { createClient } from '@supabase/supabase-js';

// Hardcoded for verification only - matches src/lib/supabase.ts fallbacks
const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHFtc2JxdGdkYWNjY3FrcmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTI5ODMsImV4cCI6MjA4NDkyODk4M30.7ADXbt6pT-MF1KYybdGE7wbtK5YaULby2OLwh65cj2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('Testing connection to:', supabaseUrl);

    try {
        const { data, error } = await supabase.from('accounting_records').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Error detail:', error);
            if (error.code === '42P01') {
                console.log('RESULT: TABLE_MISSING');
            } else {
                console.log('RESULT: CONNECTION_ERROR');
            }
        } else {
            console.log('RESULT: TABLE_EXISTS');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkConnection();
