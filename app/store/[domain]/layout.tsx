import { Navbar } from "./components/navbar";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "react-hot-toast";

export default async function StoreLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  // Get taxonomies with their taxons for navigation
  const taxonomies = await prismadb.$queryRaw<Array<any>>`
    SELECT t.*, 
           json_agg(
             json_build_object(
               'id', tx.id,
               'name', tx.name,
               'permalink', tx.permalink
             )
           ) FILTER (WHERE tx.id IS NOT NULL) as taxons
    FROM "Taxonomy" t
    LEFT JOIN "Taxon" tx ON tx."taxonomyId" = t.id
    WHERE t."storeId" = (
      SELECT id FROM "Store" WHERE domain = ${params.domain}
    )
    GROUP BY t.id
  `;

  return (
    <div className="h-full">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        <Navbar taxonomies={taxonomies} />
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </ThemeProvider>
    </div>
  );
}