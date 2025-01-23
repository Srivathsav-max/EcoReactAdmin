"use client";

import { notFound, useParams } from "next/navigation";
import { LayoutForm } from "./components/layout-form";
import LayoutBuilder from "./components/layout-builder";
import type { LayoutComponent } from "@/types/models";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Layout } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    layoutId: string;
    storeId: string;
  };
}

interface LayoutData {
  id: string;
  name: string;
  isActive: boolean;
  components: LayoutComponent[];
  createdAt: string;
  updatedAt: string;
}

export default function LayoutPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<LayoutData | null>(null);
  const [version, setVersion] = useState(0);
  
  // Get params using useParams hook
  const { storeId, layoutId } = useParams<PageProps["params"]>();
  const isNew = layoutId === 'new';

  const fetchLayout = useCallback(async () => {
    try {
      if (isNew) {
        setLoading(false);
        return;
      }

      const response = await axios.get<LayoutData>(
        `/api/${storeId}/layouts/${layoutId}`
      );
      
      if (!response.data) {
        notFound();
      }

      setLayout({
        id: response.data.id,
        name: response.data.name || '',
        isActive: response.data.isActive || false,
        components: Array.isArray(response.data.components) ? 
          response.data.components.sort((a, b) => a.position - b.position) : [],
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      });
    } catch (error) {
      console.error('Failed to load layout:', error);
      toast.error('Error loading layout data');
      router.push(`/${storeId}/layouts`);
    } finally {
      setLoading(false);
    }
  }, [storeId, layoutId, isNew, router]);

  useEffect(() => {
    if (!isNew && layoutId) {
      fetchLayout();
    } else {
      setLoading(false);
    }
  }, [fetchLayout, isNew, layoutId]);

  const handleLayoutUpdate = useCallback(() => {
    if (!isNew) {
      setVersion(prev => prev + 1);
      fetchLayout();
    }
  }, [fetchLayout, isNew]);

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Create Layout' : 'Loading Layout...'}
            </h2>
          </div>
          <Card className="p-6">
            <div className="h-24 flex items-center justify-center">
              <Layout className="h-10 w-10 animate-pulse text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        
        <Card className="p-6">
          <LayoutForm
            storeId={storeId}
            layoutId={layoutId}
            initialData={isNew ? null : layout}
            onUpdate={handleLayoutUpdate}
          />
        </Card>

        {!isNew && layout && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Layout Builder</h3>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(layout.updatedAt).toLocaleString()}
                </div>
              </div>
              <LayoutBuilder
                key={`${layout.id}-${version}`}
                initialComponents={layout.components}
                layoutId={layoutId}
                storeId={storeId}
                onUpdate={handleLayoutUpdate}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}