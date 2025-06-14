const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  console.error('Please check your .env file');
  process.exit(1);
}

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test connection
const testConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    console.error('Full error:', err);
  }
};

testConnection();

module.exports = supabase;