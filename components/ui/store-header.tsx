'use client';

import Link from 'next/link'
import { ShoppingCart, Menu } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu"

interface StoreHeaderProps {
  storeName: string;
  logoUrl: string | null;
  taxonomies?: {
    id: string;
    name: string;
    taxons: {
      id: string;
      name: string;
      permalink: string;
    }[];
  }[];
}

export function StoreHeader({ storeName, logoUrl, taxonomies = [] }: StoreHeaderProps) {
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
          <NavigationMenu>
            <NavigationMenuList>
              {taxonomies.map((taxonomy) => (
                <NavigationMenuItem key={taxonomy.id}>
                  <NavigationMenuTrigger>{taxonomy.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {taxonomy.taxons.map((taxon) => (
                        <li key={taxon.id}>
                          <Link
                            href={`${baseUrl}/categories/${taxon.permalink}`}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{taxon.name}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link 
                  href={`${baseUrl}/products`}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  All Products
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
            {taxonomies.map((taxonomy) => (
              <div key={taxonomy.id} className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-gray-600">
                  {taxonomy.name}
                </div>
                {taxonomy.taxons.map((taxon) => (
                  <Link
                    key={taxon.id}
                    href={`${baseUrl}/categories/${taxon.permalink}`}
                    className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md ml-4"
                  >
                    {taxon.name}
                  </Link>
                ))}
              </div>
            ))}
            <Link 
              href={`${baseUrl}/products`}
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md"
            >
              All Products
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}