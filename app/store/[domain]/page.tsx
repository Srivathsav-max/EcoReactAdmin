import { getStoreByDomain } from "@/actions/get-store-by-domain"
import { notFound } from "next/navigation"
import Link from 'next/link'
import Image from 'next/image'

interface StorefrontPageProps {
  params: {
    domain: string
  }
}

export default async function StorefrontPage({
  params
}: StorefrontPageProps) {
  const store = await getStoreByDomain(params.domain)

  if (!store) {
    return notFound()
  }

  return (
    <div className="pb-10">
      {/* Hero section with billboard */}
      {store.billboards[0] && (
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src={store.billboards[0].imageUrl}
            alt={store.billboards[0].label}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-xs sm:max-w-2xl">
              {store.billboards[0].label}
            </h1>
          </div>
        </div>
      )}

      {/* Featured Categories */}
      {store.taxonomies[0]?.taxons?.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {store.taxonomies[0].taxons.map((taxon) => (
              <Link
                key={taxon.id}
                href={`/store/${params.domain}/categories/${taxon.permalink}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-75"
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-center font-medium">{taxon.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      {store.products.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.products.map((product) => (
              <Link
                key={product.id}
                href={`/store/${params.domain}/products/${product.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {store.currency} {product.price?.toString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}