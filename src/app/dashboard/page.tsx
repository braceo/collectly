import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <a
        href="/dashboard/products/new"
        className="inline-block mb-6 rounded-lg bg-black text-white px-4 py-2 text-sm"
      >
        ➕ Add a Product
      </a>

      <p className="text-gray-600">Product list will go here next.</p>
    </main>
  )
}
