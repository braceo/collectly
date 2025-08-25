'use client'

type Props = {
  productId: string
}

export default function DeleteProductButton({ productId }: Props) {
  return (
    <form
      action={`/dashboard/products/${productId}/delete`}
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
  )
}
