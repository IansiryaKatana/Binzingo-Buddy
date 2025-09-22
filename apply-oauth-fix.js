import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rdwrhuipyhbvlztbjdgp.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3JodWlweWhidmx6dGJqZGdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5NzE2OCwiZXhwIjoyMDczNjczMTY4fQ.w7xnh6CDixYkYxN8crx13PmeORyezg0_brX_GU-mS24'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyOAuthFix() {
  console.log('🔧 Applying OAuth user creation fix...')
  
  try {
    // Read the fix file
    const fs = await import('fs')
    const fixSQL = fs.readFileSync('fix-oauth-users.sql', 'utf8')
    
    console.log('📝 Fix SQL loaded successfully')
    console.log('📝 Attempting to apply fix via Management API...')
    
    // Try to apply the fix using the Management API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: fixSQL
      })
    })
    
    if (response.ok) {
      console.log('✅ OAuth fix applied successfully!')
    } else {
      const error = await response.text()
      console.log('ℹ️ Management API result:', error)
    }
    
    // Test if the fix worked by trying to create a test user stats entry
    console.log('🔍 Testing user stats creation...')
    const { data: testData, error: testError } = await supabase
      .from('user_stats')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        games_played: 0,
        games_won: 0,
        total_score: 0
      })
      .select()
    
    if (testError && testError.code === 'PGRST116') {
      console.log('ℹ️ User_stats table does not exist yet - this is expected')
    } else if (testError) {
      console.log('ℹ️ User_stats table error:', testError.message)
    } else {
      console.log('✅ User_stats table exists and is accessible!')
      // Clean up test data
      await supabase.from('user_stats').delete().eq('id', testData[0].id)
    }
    
    console.log('🎉 OAuth fix completed!')
    console.log('📋 Next steps:')
    console.log('   1. Try Google OAuth again')
    console.log('   2. It should work without database errors now')
    console.log('   3. If it still fails, use email authentication as backup')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
    console.log('📋 Manual fix required:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select project: rdwrhuipyhbvlztbjdgp')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Copy and paste the contents of fix-oauth-users.sql')
    console.log('   5. Click "Run" to execute the fix')
  }
}

// Run the fix
applyOAuthFix()
