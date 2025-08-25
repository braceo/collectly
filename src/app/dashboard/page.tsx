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

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price_cents, stock_quantity, in_stock')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <a
        href="/dashboard/products/new"
        className="inline-block mb-6 rounded-lg bg-black text-white px-4 py-2 text-sm"
      >
        ➕ Add a Product
      </a>

      <div className="space-y-4">
        {products?.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{product.title}</h2>
              <p className="text-sm text-gray-500">
                £{(product.price_cents / 100).toFixed(2)} — {product.stock_quantity} in stock
              </p>
              {!product.in_stock && (
                <p className="text-xs text-red-500 font-medium mt-1">Out of stock</p>
              )}
            </div>

            <div className="flex gap-2">
              <a
                href={`/dashboard/products/${product.id}/edit`}
                className="text-sm text-blue-600 underline"
              >
                Edit
              </a>
              <form
                action={`/dashboard/products/${product.id}/delete`}
                method="post"
                onSubmit={(e) => {
                  if (!confirm('Are you sure you want to delete this product?')) {
                    e.preventDefault()
                  }
                }}
              >
                <button type="submit" className="text-sm text-red-600 underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

