// import { createClient } from '@supabase/supabase-js'

// // Get environment variables - note the correct variable name
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL 
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY // Fixed: was SUPABASEANONKEY

// // Validate environment variables
// if (!supabaseUrl) {
//   throw new Error('Missing REACT_APP_SUPABASE_URL environment variable')
// }

// if (!supabaseAnonKey) {
//   throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable')
// }

// // Validate URL format
// if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
//   throw new Error('Invalid Supabase URL format. Should be https://your-project.supabase.co')
// }

// console.log('Initializing Supabase client...')
// console.log('Supabase URL:', supabaseUrl)
// console.log('Anon Key present:', !!supabaseAnonKey)

// // Create Supabase client with additional options
// const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true,
//     flowType: 'pkce'
//   },
//   global: {
//     headers: {
//       'X-Client-Info': 'video-analyzer-app'
//     }
//   }
// })

// // Test connection on initialization
// const testConnection = async () => {
//   try {
//     const { data, error } = await supabase.auth.getSession()
//     if (error) {
//       console.warn('Supabase connection warning:', error.message)
//     } else {
//       console.log('Supabase connection successful')
//     }
//   } catch (err) {
//     console.error('Supabase connection failed:', err)
//   }
// }

// // Test connection after a brief delay
// setTimeout(testConnection, 1000)

// export default supabase


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL 
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable')
}

if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid Supabase URL format. Should be https://your-project.supabase.co')
}

console.log('Initializing Supabase client...')
console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key present:', !!supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'video-analyzer-app'
    }
  }
})

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.warn('Supabase connection warning:', error.message)
    } else {
      console.log('Supabase connection successful')
    }
  } catch (err) {
    console.error('Supabase connection failed:', err)
  }
}

setTimeout(testConnection, 1000)

export default supabase;
