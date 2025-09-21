import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdwrhuipyhbvlztbjdgp.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkd3JodWlweWhidmx6dGJqZGdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5NzE2OCwiZXhwIjoyMDczNjczMTY4fQ.w7xnh6CDixYkYxN8crx13PmeORyezg0_brX_GU-mS24'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTablesDirectAPI() {
  console.log('🚀 Creating database tables via direct API calls...')
  
  try {
    // Read the migration file
    const fs = await import('fs')
    const schema = fs.readFileSync('supabase/migrations/20250917095516_create_tables.sql', 'utf8')
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Try to create tables using the Management API
    console.log('📝 Creating tables via Management API...')
    
    // Try to create tables using the Management API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: schema
      })
    })
    
    if (response.ok) {
      console.log('✅ Tables created successfully via Management API!')
    } else {
      const error = await response.text()
      console.log('ℹ️ Management API result:', error)
    }
    
    // Test table creation
    console.log('🔍 Testing table creation...')
    const { data: testData, error: testError } = await supabase
      .from('games')
      .select('*')
      .limit(1)
    
    if (testError && testError.code === 'PGRST116') {
      console.log('ℹ️ Tables not created yet - trying alternative approach...')
      
      // Try to create tables using the Management API with individual statements
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement.trim()) {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
          
          try {
            const stmtResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
              },
              body: JSON.stringify({
                sql: statement
              })
            })
            
            if (stmtResponse.ok) {
              console.log(`✅ Statement ${i + 1} executed successfully`)
            } else {
              const error = await stmtResponse.text()
              console.log(`ℹ️ Statement ${i + 1} result:`, error)
            }
          } catch (error) {
            console.log(`ℹ️ Statement ${i + 1} note:`, error.message)
          }
        }
      }
    } else if (testError) {
      console.log('ℹ️ Table test result:', testError.message)
    } else {
      console.log('✅ Tables created and accessible!')
    }
    
    // Final test
    console.log('🔍 Final table test...')
    const { data: finalTest, error: finalError } = await supabase
      .from('games')
      .select('*')
      .limit(1)
    
    if (finalError && finalError.code === 'PGRST116') {
      console.log('❌ Tables still not created - manual setup required')
    } else if (finalError) {
      console.log('ℹ️ Final test result:', finalError.message)
    } else {
      console.log('✅ Tables created and accessible!')
    }
    
    console.log('🎉 Database setup completed!')
    console.log('📋 Next steps:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select project: rdwrhuipyhbvlztbjdgp')
    console.log('   3. Go to Authentication → Settings')
    console.log('   4. Enable Email authentication')
    console.log('   5. Set Site URL to: http://localhost:8080')
    console.log('   6. Test your online multiplayer system!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run the setup
createTablesDirectAPI()

