export default function handler(req, res) {
  console.log('Test API Keys endpoint called with method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Log all available environment variables for debugging
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_REGION: process.env.VERCEL_REGION,
    supabaseKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
    hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasViteSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY
  });
  
  // Return a simple response
  return res.status(200).json({
    success: true,
    message: 'Test API Keys endpoint is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
