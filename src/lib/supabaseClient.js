import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnungauvdtershilojxj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udW5nYXV2ZHRlcnNoaWxvanhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTA5MjEzOSwiZXhwIjoyMDYwNjY4MTM5fQ.r0-4Mb-hdtLCo5O6N6BMM4EO39B2EliVJfZi9YTVL8g'

export const supabase = createClient(supabaseUrl, supabaseKey)