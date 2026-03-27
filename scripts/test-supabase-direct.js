
const { createClient } = require('@supabase/supabase-js');

// 직접 값을 넣어서 테스트 (Assertion 에러 방지)
const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseAnonKey = 'sb_publishable_oZxwN2IjTDglga7duHV5zg_hbZ_gEmX';

console.log('Testing connection to production Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('recipes').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('Connection failed:', error.message);
            process.exit(1);
        }
        
        console.log('Successfully connected to production Supabase! (aos_erp1)');
        console.log('Total recipes in production DB:', data);
        process.exit(0);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

testConnection();
