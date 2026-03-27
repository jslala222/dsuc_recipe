
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jsdqmsbqtgdacccqkrjm.supabase.co';
const supabaseAnonKey = 'sb_publishable_oZxwN2IjTDglga7duHV5zg_hbZ_gEmX';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    try {
        console.log('--- Schema Diagnostics [recipes] ---');
        // 한 개라도 가져와서 컬럼 확인 (0개여도 구조는 반환됨)
        const { data, error } = await supabase.from('recipes').select('*').limit(1);
        
        if (error) {
            console.error('Error fetching recipes:', error.message);
        } else {
            console.log('Successfully queried recipes table.');
            if (data.length > 0) {
                console.log('Columns:', Object.keys(data[0]).join(', '));
            } else {
                console.log('Table is empty, cannot infer columns from data. Trying rpc or other method...');
                // rpc가 없을 수 있으니 간단한 필터로 오류 유도
                const { error: filterError } = await supabase.from('recipes').select('id, title, cooking_time, difficulty').limit(1);
                if (filterError) console.log('❌ Common columns test failed:', filterError.message);
                else console.log('✅ Common columns exist.');
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
    process.exit(0);
}

checkSchema();
