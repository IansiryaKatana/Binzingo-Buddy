import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function pushSchema() {
  console.log('🚀 Pushing database schema...')
  
  try {
    // Use the correct EU region database URL
    const dbUrl = 'postgresql://postgres:12345678@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?options=project%3Drdwrhuipyhbvlztbjdgp'
    
    console.log('📝 Executing schema push...')
    const { stdout, stderr } = await execAsync(`.\\supabase.exe db push --db-url "${dbUrl}"`)
    
    if (stdout) {
      console.log('✅ Success:', stdout)
    }
    if (stderr) {
      console.log('ℹ️ Info:', stderr)
    }
    
    console.log('🎉 Schema pushed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes('failed to connect')) {
      console.log('🔍 Connection issue detected. Let me try alternative approaches...')
      
      // Try alternative database URL formats
      const alternatives = [
        'postgresql://postgres:12345678@db.rdwrhuipyhbvlztbjdgp.supabase.co:5432/postgres',
        'postgresql://postgres:12345678@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?options=project%3Drdwrhuipyhbvlztbjdgp',
        'postgresql://postgres:12345678@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
      ]
      
      for (let i = 0; i < alternatives.length; i++) {
        const altUrl = alternatives[i]
        console.log(`🔄 Trying alternative ${i + 1}/${alternatives.length}: ${altUrl}`)
        
        try {
          const { stdout, stderr } = await execAsync(`.\\supabase.exe db push --db-url "${altUrl}"`)
          
          if (stdout) {
            console.log('✅ Success with alternative:', stdout)
            return
          }
          if (stderr) {
            console.log('ℹ️ Alternative result:', stderr)
          }
        } catch (altError) {
          console.log(`ℹ️ Alternative ${i + 1} failed:`, altError.message)
        }
      }
    }
    
    console.log('📋 Manual setup required:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Select project: rdwrhuipyhbvlztbjdgp')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Copy and paste the contents of supabase/migrations/20250917095516_create_tables.sql')
    console.log('   5. Click "Run" to execute the schema')
  }
}

// Run the push
pushSchema()
