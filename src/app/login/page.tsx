'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient())

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Seller Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
        />
        <p className="text-sm text-gray-500 mt-4">
          No account? Use the “Sign up” tab above.
        </p>
      </div>
    </div>
  )
}
