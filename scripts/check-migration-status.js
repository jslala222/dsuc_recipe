
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMigration() {
    console.log('--- Migration Status Check ---');
    
    // Check recipes table
    const { data: recipes, error: rError } = await supabase
        .from('recipe_recipes')
        .select('id, title, image_url')
        .limit(10);
        
    if (rError) {
        console.error('Error fetching recipes:', rError.message);
    } else {
        console.log(`\n[recipe_recipes] - Total fetched: ${recipes.length}`);
        recipes.forEach(r => {
            const isR2 = r.image_url && r.image_url.includes('r2.dev');
            const isSupabase = r.image_url && r.image_url.includes('supabase.co');
            console.log(`- ${r.title}: ${isR2 ? '✅ R2' : isSupabase ? '❌ Supabase' : '⚠️ No Image'} (${r.image_url || 'empty'})`);
        });
    }

    // Check recipe_steps table
    const { data: steps, error: sError } = await supabase
        .from('recipe_steps')
        .select('id, images')
        .limit(10);
        
    if (sError) {
        console.error('Error fetching steps:', sError.message);
    } else {
        console.log(`\n[recipe_steps] - Total fetched: ${steps.length}`);
        steps.forEach(s => {
            const allR2 = s.images && s.images.length > 0 && s.images.every(img => img && img.includes('r2.dev'));
            console.log(`- Step ${s.id}: ${allR2 ? '✅ All R2' : '⚠️ Mixed/Supabase'} (${s.images?.length || 0} images)`);
        });
    }

    // Check recipe_notes table
    const { data: notes, error: nError } = await supabase
        .from('recipe_notes')
        .select('*')
        .limit(10);
        
    if (nError) {
        console.error('Error fetching notes:', nError.message);
    } else {
        console.log(`\n[recipe_notes] - Total fetched: ${notes?.length || 0}`);
        notes?.forEach(n => {
            const hasBlob = n.images && n.images.some(img => img.startsWith('blob:'));
            const hasSupabase = n.images && n.images.some(img => img.includes('supabase.co'));
            const hasR2 = n.images && n.images.some(img => img.includes('r2.dev'));
            console.log(`- Note: ${n.id} : ${hasBlob ? '❌ Blob Found!' : hasSupabase ? '⚠️ Supabase Found' : hasR2 ? '✅ R2' : 'No Images'} (${n.images?.length || 0} images)`);
        });
    }

    // Check Supabase Storage
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    if (bError) {
        console.error('Error listing buckets:', bError.message);
    } else {
        console.log('\n[Supabase Storage Buckets]');
        if (buckets && buckets.length > 0) {
            for (const bucket of buckets) {
                const { data: files, error: fError } = await supabase.storage.from(bucket.name).list();
                console.log(`- ${bucket.name}: ${fError ? 'Error' : (files?.length || 0) + ' files'}`);
            }
        }
    }
}

checkMigration();
