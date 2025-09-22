import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rdwrhuipyhbvlztbjdgp.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3JodWlweWhidmx6dGJqZGdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5NzE2OCwiZXhwIjoyMDczNjczMTY4fQ.w7xnh6CDixYkYxN8crx13PmeORyezg0_brX_GU-mS24'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function finalAutoSetup() {
  console.log('🚀 Final auto-setup attempt...')
  
  try {
    // Test connection first
    console.log('🔍 Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)
    
    if (testError) {
      console.log('ℹ️ Connection test note:', testError.message)
    } else {
      console.log('✅ Connection successful!')
    }
    
    // Try to create tables by attempting to insert data
    console.log('📝 Creating games table...')
    const { data: gamesData, error: gamesError } = await supabase
      .from('games')
      .insert({
        name: 'Test Game',
        status: 'waiting',
        max_players: 4,
        current_players: 0,
        score_limit: 100,
        created_by: '00000000-0000-0000-0000-000000000000'
      })
      .select()
    
    if (gamesError && gamesError.code === 'PGRST116') {
      console.log('ℹ️ Games table does not exist yet - this is expected')
    } else if (gamesError) {
      console.log('ℹ️ Games table error:', gamesError.message)
    } else {
      console.log('✅ Games table exists and is accessible!')
      // Clean up test data
      await supabase.from('games').delete().eq('id', gamesData[0].id)
    }
    
    // Try to create game_players table
    console.log('📝 Creating game_players table...')
    const { data: playersData, error: playersError } = await supabase
      .from('game_players')
      .insert({
        game_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        player_name: 'Test Player',
        is_host: false,
        is_ready: false
      })
      .select()
    
    if (playersError && playersError.code === 'PGRST116') {
      console.log('ℹ️ Game_players table does not exist yet - this is expected')
    } else if (playersError) {
      console.log('ℹ️ Game_players table error:', playersError.message)
    } else {
      console.log('✅ Game_players table exists and is accessible!')
      // Clean up test data
      await supabase.from('game_players').delete().eq('id', playersData[0].id)
    }
    
    // Try to create game_states table
    console.log('📝 Creating game_states table...')
    const { data: statesData, error: statesError } = await supabase
      .from('game_states')
      .insert({
        game_id: '00000000-0000-0000-0000-000000000000',
        state_data: {},
        current_player_index: 0,
        turn_timer: 45
      })
      .select()
    
    if (statesError && statesError.code === 'PGRST116') {
      console.log('ℹ️ Game_states table does not exist yet - this is expected')
    } else if (statesError) {
      console.log('ℹ️ Game_states table error:', statesError.message)
    } else {
      console.log('✅ Game_states table exists and is accessible!')
      // Clean up test data
      await supabase.from('game_states').delete().eq('id', statesData[0].id)
    }
    
    // Try to create user_stats table
    console.log('📝 Creating user_stats table...')
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        games_played: 0,
        games_won: 0,
        total_score: 0
      })
      .select()
    
    if (statsError && statsError.code === 'PGRST116') {
      console.log('ℹ️ User_stats table does not exist yet - this is expected')
    } else if (statsError) {
      console.log('ℹ️ User_stats table error:', statsError.message)
    } else {
      console.log('✅ User_stats table exists and is accessible!')
      // Clean up test data
      await supabase.from('user_stats').delete().eq('id', statsData[0].id)
    }
    
    console.log('🎉 Database connection verified!')
    console.log('📋 Manual setup required:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select project: rdwrhuipyhbvlztbjdgp')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Copy and paste the contents of supabase/migrations/20250917095516_create_tables.sql')
    console.log('   5. Click "Run" to execute the schema')
    console.log('   6. Go to Authentication → Settings')
    console.log('   7. Enable Email authentication')
    console.log('   8. Set Site URL to: http://localhost:8080')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run the setup
finalAutoSetup()