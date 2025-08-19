'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function LoginPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()


  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        router.push('/dashboard') // 👈 where to go after login
      }
    }

    getUser()

    // Listen for login/signup events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push('/dashboard') // 👈 redirect again after real-time login
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Seller Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="sign_in"
        />
        <p className="text-sm text-gray-500 mt-4">
          No account? Use the “Sign up” tab above.
        </p>
      </div>
    </div>
  )
}

