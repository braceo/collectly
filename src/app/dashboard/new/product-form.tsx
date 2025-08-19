'use client'

import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
}

export default function ProductForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name')
        .order('name', { ascending: true })

      if (error) {
        console.error(error)
        setError('Failed to load categories.')
      } else {
        setCategories(data ?? [])
      }
    })()
  }, [supabase])

  async function onSubmit(form: FormData) {
    setError(null)
    setLoading(true)

    const title = String(form.get('title') || '').trim()
    const description = String(form.get('description') || '').trim()
    const priceStr = String(form.get('price') || '0').trim()
    const categoryId = Number(form.get('category_id') || 0)
    const stockQty = Number(form.get('stock_quantity') || 0)
    const inStock = form.get('in_stock') === 'on'

    if (!title) return setError('Title is required.'), setLoading(false)
    if (!categoryId) return setError('Pick a category.'), setLoading(false)

    const price_cents = Math.round(Number(priceStr) * 100)
    if (!Number.isFinite(price_cents) || price_cents < 0) {
      return setError('Price must be valid.'), setLoading(false)
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      setError('Not authenticated.')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase.from('products').insert({
      seller_id: user.id,
      title,
      description,
      price_cents,
      category_id: categoryId,
      stock_quantity: stockQty,
      in_stock: inStock,
    })

    setLoading(false)

    if (insertErr) {
      console.error(insertErr)
      setError(insertErr.message)
      return
    }

    alert('Product created.')
    router.push('/dashboard')
  }

  return (
    <form action={onSubmit} className="space-y-4 bg-white rounded-2xl shadow p-6">
      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          name="title"
          required
          className="w-full border rounded-lg px-3 py-2"
          placeholder="e.g. Handmade mug"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          rows={4}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Short details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price (£)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="12.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category_id" required className="w-full border rounded-lg px-3 py-2">
            <option value="">Select…</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock quantity</label>
          <input
            name="stock_quantity"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <label className="flex items-center gap-2 mt-6">
          <input name="in_stock" type="checkbox" defaultChecked className="h-4 w-4" />
          <span className="text-sm">In stock</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Create product'}
      </button>
    </form>
  )
}
