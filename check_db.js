const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim();
        return acc;
    }, {});

    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('MISSING_CREDENTIALS');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function check() {
        // Check customers table
        const { data, error } = await supabase.from('accounting_records').select('count', { count: 'exact', head: true }); if (error) {
            if (error.code === '42P01') { // undefined_table
                console.log('TABLE_MISSING');
            } else {
                console.log('ERROR:', error.message);
            }
        } else {
            console.log('SUCCESS: Table exists');
        }
    }

    check();

} catch (e) {
    console.error('SCRIPT_ERROR', e);
}
