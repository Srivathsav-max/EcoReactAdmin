"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  permalink: string;
}

interface CategoriesGridProps {
  categories: Category[];
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories = []
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-3xl">Shop by Category</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.permalink}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-transform hover:scale-105"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};