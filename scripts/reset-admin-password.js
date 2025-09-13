import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lulphvvdjylmzkvxxxks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bHBodnZkanlsbXprdnh4eGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU0Mjc0OSwiZXhwIjoyMDczMTE4NzQ5fQ.0hM42h6qSA3zTskC_8ym-tifTaB0YEfPkNJshSCAGnE',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting password for sangpho966996@gmail.com...')
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      '3e454e27-9275-43e8-b4ad-96dd23372cbe', // Admin user UUID
      {
        password: 'passpass123456'
      }
    )

    if (error) {
      console.error('❌ Error resetting password:', error)
      return
    }

    console.log('✅ Password reset successful!')
    console.log('📧 Email:', data.user.email)
    console.log('🆔 User ID:', data.user.id)
    console.log('🔑 New password: passpass123456')
    
  } catch (error) {
    console.error('💥 Script error:', error)
  }
}

resetAdminPassword()
