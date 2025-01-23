import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

import { Billboard } from "./components/billboard";
import { ProductsList } from "./components/products-list";
import { BannerComponent } from "./components/banner";
import { CategoriesGrid } from "./components/categories-grid";
import { ProductsCarousel } from "./components/products-carousel";

interface LayoutComponent {
  id: string;
  type: string;
  config: Record<string, any>;
  position: number;
  isVisible: boolean;
}

const HomePage = async ({
  params
}: {
  params: { domain: string }
}) => {
  // Get the store by domain
  const store = await prismadb.$queryRaw<Array<any>>`
    SELECT s.*, json_agg(t.*) as taxonomies
    FROM "Store" s
    LEFT JOIN "Taxonomy" t ON t."storeId" = s.id
    WHERE s.domain = ${params.domain}
    GROUP BY s.id
  `;

  if (!store[0]) {
    redirect('/');
  }

  // Get active layout with components
  const layout = await prismadb.$queryRaw<Array<any>>`
    SELECT l.*, 
           json_agg(
             json_build_object(
               'id', c.id,
               'type', c.type,
               'config', c.config,
               'position', c.position,
               'isVisible', c."isVisible"
             ) ORDER BY c.position
           ) FILTER (WHERE c.id IS NOT NULL) as components
    FROM "HomeLayout" l
    LEFT JOIN "LayoutComponent" c ON c."layoutId" = l.id
    WHERE l."storeId" = ${store[0].id}
      AND l."isActive" = true
    GROUP BY l.id
  `;

  const activeLayout = layout[0];
  const components = activeLayout?.components || [];

  return (
    <div className="pb-10">
      {components
        .filter((component: LayoutComponent) => component.isVisible)
        .map((component: LayoutComponent) => {
          switch (component.type) {
            case 'billboard':
              return (
                <Billboard
                  key={component.id}
                  data={component.config}
                />
              );
            case 'featured-products':
              return (
                <ProductsList
                  key={component.id}
                  title="Featured Products"
                  items={component.config.products || []}
                />
              );
            case 'banner':
              return (
                <BannerComponent
                  key={component.id}
                  data={component.config}
                />
              );
            case 'categories':
              return (
                <CategoriesGrid
                  key={component.id}
                  categories={component.config.categories || []}
                />
              );
            case 'products-grid':
              return (
                <ProductsList
                  key={component.id}
                  title={component.config.title || "Products"}
                  items={component.config.products || []}
                />
              );
            case 'products-carousel':
              return (
                <ProductsCarousel
                  key={component.id}
                  title={component.config.title || "Products"}
                  items={component.config.products || []}
                />
              );
            default:
              return null;
          }
      })}
    </div>
  );
}

export default HomePage;