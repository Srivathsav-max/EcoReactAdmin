import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

const generateUniqueSlug = (name: string): string => {
  const timestamp = Date.now();
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${baseSlug}-${timestamp}`;
};

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store id is required"
      }, { status: 400 });
    }

    // Check if store belongs to user
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId
      }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: "Access denied to this store"
      }, { status: 403 });
    }

    // 1. Create base entities first
    console.log('Creating base entities...');
    
    // Create colors
    const colors = [
      { name: "Ruby Red", value: "#FF0000" },
      { name: "Sapphire Blue", value: "#0000FF" },
      { name: "Emerald Green", value: "#00FF00" }
    ];

    const createdColors = await Promise.all(
      colors.map(color => 
        prismadb.color.create({
          data: {
            ...color,
            storeId: params.storeId,
          }
        })
      )
    );

    // Create sizes
    const sizes = [
      { name: "Small", value: "S" },
      { name: "Medium", value: "M" },
      { name: "Large", value: "L" }
    ];

    const createdSizes = await Promise.all(
      sizes.map(size => 
        prismadb.size.create({
          data: {
            ...size,
            storeId: params.storeId,
          }
        })
      )
    );

    // 2. Create taxonomies and taxons structure
    console.log('Creating taxonomy structure...');
    
    interface TaxonConfig {
      name: string;
      description: string;
      position: number;
      permalink: string;
      children?: TaxonConfig[];
    }

    interface TaxonomyConfig {
      name: string;
      description: string;
      taxons: TaxonConfig[];
    }

    const taxonomyConfigs: TaxonomyConfig[] = [
      {
        name: "Categories",
        description: "Main product categories",
        taxons: [
          {
            name: "Clothing",
            description: "All clothing items",
            position: 1,
            permalink: "clothing",
            children: [
              {
                name: "Men's Wear",
                description: "Clothing for men",
                position: 1,
                permalink: "clothing/mens-wear"
              },
              {
                name: "Women's Wear",
                description: "Clothing for women",
                position: 2,
                permalink: "clothing/womens-wear"
              }
            ]
          },
          {
            name: "Accessories",
            description: "Fashion accessories",
            position: 2,
            permalink: "accessories"
          }
        ]
      },
      {
        name: "Collections",
        description: "Special product collections",
        taxons: [
          {
            name: "New Arrivals",
            description: "Latest products",
            position: 1,
            permalink: "new-arrivals"
          },
          {
            name: "Summer Collection",
            description: "Summer season items",
            position: 2,
            permalink: "summer-collection"
          }
        ]
      }
    ];

    const createdTaxons = [];
    for (const config of taxonomyConfigs) {
      const taxonomy = await prismadb.taxonomy.create({
        data: {
          name: config.name,
          description: config.description,
          storeId: params.storeId,
        }
      });

      for (const taxonData of config.taxons) {
        const topLevelTaxon = await prismadb.taxon.create({
          data: {
            name: taxonData.name,
            description: taxonData.description,
            position: taxonData.position,
            permalink: taxonData.permalink,
            taxonomyId: taxonomy.id,
          }
        });
        createdTaxons.push(topLevelTaxon);

        if (taxonData.children) {
          for (const childData of taxonData.children) {
            const childTaxon = await prismadb.taxon.create({
              data: {
                name: childData.name,
                description: childData.description,
                position: childData.position,
                permalink: childData.permalink,
                taxonomyId: taxonomy.id,
                parentId: topLevelTaxon.id
              }
            });
            createdTaxons.push(childTaxon);
          }
        }
      }
    }

    // 3. Create brands
    console.log('Creating brands...');
    
    const brands = [
      { 
        name: "Test Brand 1",
        description: "Premium quality brand",
        slug: generateUniqueSlug("test-brand-1"),
        website: "https://brand1.com",
        isActive: true
      },
      { 
        name: "Test Brand 2",
        description: "Affordable luxury",
        slug: generateUniqueSlug("test-brand-2"),
        website: "https://brand2.com",
        isActive: true
      }
    ];

    const createdBrands = await Promise.all(
      brands.map(brand => 
        prismadb.brand.create({
          data: {
            ...brand,
            storeId: params.storeId,
          }
        })
      )
    );

    // 4. Create product and link to taxonomies
    console.log('Creating product...');
    
    const clothingTaxon = createdTaxons.find(t => t.name === "Clothing");
    const newArrivalsTaxon = createdTaxons.find(t => t.name === "New Arrivals");
    
    const product = await prismadb.product.create({
      data: {
        name: "Test Product",
        slug: generateUniqueSlug("test-product"),
        description: "A test product with multiple variants",
        price: 99.99,
        sku: `TEST-${Date.now()}`,
        status: "active",
        isVisible: true,
        isPromotionable: true,
        hasVariants: true,
        minimumQuantity: 1,
        brandId: createdBrands[0].id,
        storeId: params.storeId,
        taxons: {
          connect: [
            ...(clothingTaxon ? [{ id: clothingTaxon.id }] : []),
            ...(newArrivalsTaxon ? [{ id: newArrivalsTaxon.id }] : [])
          ]
        },
        optionTypes: {
          create: [
            {
              name: "size",
              presentation: "Size",
              position: 0,
              storeId: params.storeId,
              optionValues: {
                createMany: {
                  data: [
                    { name: "small", presentation: "Small", position: 0 },
                    { name: "medium", presentation: "Medium", position: 1 },
                    { name: "large", presentation: "Large", position: 2 }
                  ]
                }
              }
            },
            {
              name: "color",
              presentation: "Color",
              position: 1,
              storeId: params.storeId,
              optionValues: {
                createMany: {
                  data: [
                    { name: "red", presentation: "Red", position: 0 },
                    { name: "blue", presentation: "Blue", position: 1 },
                    { name: "green", presentation: "Green", position: 2 }
                  ]
                }
              }
            }
          ]
        }
      },
      include: {
        optionTypes: {
          include: {
            optionValues: true
          }
        }
      }
    });

    // 5. Create variants with relationships
    console.log('Creating variants...');
    
    const variants = [];
    for (const size of createdSizes) {
      for (const color of createdColors) {
        const variant = await prismadb.variant.create({
          data: {
            name: `${product.name} - ${size.name} ${color.name}`,
            sku: `TEST-${size.value}-${color.value}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            price: 99.99,
            productId: product.id,
            sizeId: size.id,
            colorId: color.id,
            isVisible: true,
            trackInventory: true
          }
        });
        variants.push(variant);
      }
    }

    // 6. Create stock items for variants
    console.log('Creating stock items...');
    
    await Promise.all(
      variants.map(variant =>
        prismadb.stockItem.create({
          data: {
            variantId: variant.id,
            storeId: params.storeId,
            count: 100,
            stockStatus: "in_stock"
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Test data loaded successfully"
    });
  } catch (error) {
    console.error('[TEST_DATA_POST]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to load test data"
    }, { status: 500 });
  }
}