
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseAnonKey = 'sb_publishable_oZxwN2IjTDglga7duHV5zg_hbZ_gEmX';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    const tables = [
        'recipes', 
        'recipe_steps', 
        'recipe_shopping_trips', 
        'recipe_shopping_items', 
        'recipe_customers',
        'recipe_notes'
    ];

    console.log('--- Table Diagnostics ---');
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
            if (error) {
                console.log(`❌ Table [${table}]: Error - ${error.message}`);
            } else {
                console.log(`✅ Table [${table}]: Found (${data || 0} rows)`);
            }
        } catch (err) {
            console.log(`❌ Table [${table}]: Unexpected Error`);
        }
    }
    process.exit(0);
}

checkTables();
