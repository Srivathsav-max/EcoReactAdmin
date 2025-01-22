import { getStorePublicData } from "@/actions/get-store-by-domain"
import { StoreHeader } from "@/components/ui/store-header"
import { notFound } from "next/navigation"

interface StoreLayoutProps {
  children: React.ReactNode
  params: {
    domain: string
  }
}

export default async function StoreLayout({
  children,
  params
}: StoreLayoutProps) {
  const store = await getStorePublicData(params.domain)

  if (!store) {
    return notFound()
  }

  return (
    <html lang="en">
      <head>
        {store.faviconUrl && (
          <link rel="icon" href={store.faviconUrl} />
        )}
        {store.customCss && (
          <style dangerouslySetInnerHTML={{ __html: store.customCss }} />
        )}
      </head>
      <body>
        <StoreHeader 
          storeName={store.name}
          logoUrl={store.logoUrl}
        />
        <main className="min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  )
}

export async function generateStaticParams() {
  return []
}