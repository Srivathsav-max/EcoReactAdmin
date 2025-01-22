'use client';

import Link from 'next/link'
import { ShoppingCart, Menu } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface StoreHeaderProps {
  storeName: string;
  logoUrl: string | null;
}

export function StoreHeader({ storeName, logoUrl }: StoreHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const params = useParams()

  const baseUrl = `/store/${params.domain}`

  return (
    <header className="border-b">
      <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href={baseUrl} className="ml-4 flex lg:ml-0 gap-x-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={storeName}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <span className="font-bold text-xl">{storeName}</span>
            )}
          </Link>
        </div>

        <nav className="hidden lg:flex items-center space-x-4 lg:space-x-6">
          <Link 
            href={`${baseUrl}/products`}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Products
          </Link>
          <Link 
            href={`${baseUrl}/categories`}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Categories
          </Link>
        </nav>

        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link 
            href={`${baseUrl}/cart`}
            className="ml-4 flex items-center gap-x-1 p-2 rounded-md hover:bg-gray-100"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 py-2 space-y-1">
            <Link 
              href={`${baseUrl}/products`}
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
            >
              Products
            </Link>
            <Link 
              href={`${baseUrl}/categories`}
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
            >
              Categories
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}