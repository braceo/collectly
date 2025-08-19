import ProductForm from './product-form'

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Add a Product</h2>
      <ProductForm />
    </div>
  )
}
