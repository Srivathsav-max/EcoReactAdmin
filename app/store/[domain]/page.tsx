import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

import { Billboard } from "./components/billboard";
import { ProductsList } from "./components/products-list";
import { BannerComponent } from "./components/banner";
import { CategoriesGrid } from "./components/categories-grid";
import { ProductsCarousel } from "./components/products-carousel";
import { SlidingBanners } from "./components/sliding-banners";

interface ComponentConfig {
  label?: string;
  imageUrl?: string;
  title?: string;
  products?: any[];
  categories?: any[];
  banners?: Array<{
    id: string;
    label: string;
    imageUrl: string;
    link?: string;
  }>;
  interval?: number;
}

interface LayoutComponent {
  id: string;
  type: string;
  config: ComponentConfig;
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
    <main className="flex-grow">
      <div className="space-y-10 pb-10">
      {components
        .filter((component: LayoutComponent) => component.isVisible)
        .map((component: LayoutComponent) => {
          const renderComponent = () => {
            switch (component.type) {
              case 'billboard':
                return (
                  <Billboard
                    data={component.config}
                  />
                );
              case 'featured-products':
                return (
                  <ProductsList
                    title="Featured Products"
                    items={component.config.products || []}
                  />
                );
              case 'banner':
                return (
                  <BannerComponent
                    data={component.config}
                  />
                );
              case 'categories':
                return (
                  <CategoriesGrid
                    categories={component.config.categories || []}
                  />
                );
              case 'products-grid':
                return (
                  <ProductsList
                    title={component.config.title || "Products"}
                    items={component.config.products || []}
                  />
                );
              case 'products-carousel':
                return (
                  <ProductsCarousel
                    title={component.config.title || "Products"}
                    items={component.config.products || []}
                  />
                );
              case 'sliding-banners':
                return (
                  <SlidingBanners
                    banners={component.config.banners || []}
                    interval={component.config.interval || 5000}
                  />
                );
              default:
                return null;
            }
          };

          return (
            <div key={component.id}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderComponent()}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default HomePage;