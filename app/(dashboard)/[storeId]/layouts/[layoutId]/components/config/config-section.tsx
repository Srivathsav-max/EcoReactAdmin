"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { type LayoutComponent } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditComponentDialog from "../edit-component-dialog";
import { Droppable, Draggable } from "react-beautiful-dnd";

interface ConfigSectionProps {
  layoutId: string;
  components: LayoutComponent[];
}

const ImagePreview = ({ src, alt, className }: { 
  src?: string; 
  alt?: string; 
  className?: string 
}) => {
  if (!src) {
    return (
      <div className={cn("w-full h-full bg-gray-200 flex items-center justify-center", className)}>
        <p className="text-gray-400">No image selected</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Preview"}
      className={cn("object-cover w-full h-full", className)}
    />
  );
};

export default function ConfigSection({ 
  layoutId, 
  components: initialComponents 
}: ConfigSectionProps) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingComponent, setEditingComponent] = useState<LayoutComponent | null>(null);

  const onDelete = async (componentId: string) => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/layouts/${layoutId}/components/${componentId}`
      );
      router.refresh();
      toast.success('Component removed.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <EditComponentDialog
        isOpen={!!editingComponent}
        onClose={() => setEditingComponent(null)}
        component={editingComponent}
        storeId={params.storeId as string}
        layoutId={layoutId}
      />
      <Droppable 
        droppableId={`config-section-${layoutId}`}
        isDropDisabled={false}
        ignoreContainerClipping={true}
      >
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="space-y-4 min-h-[200px] p-4 border-2 border-dashed rounded-lg"
          >
            {initialComponents.map((component, index) => (
              <Draggable 
                key={component.id} 
                draggableId={component.id} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      "transition-all duration-200",
                      snapshot.isDragging ? "opacity-50" : ""
                    )}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                        </CardTitle>
                        <div className="flex items-center gap-x-2">
                          {!component.config && (
                            <div className="px-2 py-1 text-xs text-yellow-600 bg-yellow-100 rounded-md">
                              Needs Configuration
                            </div>
                          )}
                          <Button
                            variant={component.config ? "outline" : "default"}
                            size="sm"
                            onClick={() => setEditingComponent(component)}
                          >
                            {component.config ? "Edit" : "Configure"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(component.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {component.type === "billboard" && (
                          <div className="aspect-[2.4/1] overflow-hidden rounded-lg relative">
                            <ImagePreview
                              src={(component.config as any)?.imageUrl}
                              alt={(component.config as any)?.label}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white">
                                <div className="text-2xl font-bold mb-4">
                                  {(component.config as any)?.label}
                                </div>
                                {(component.config as any)?.callToAction?.text && (
                                  <button className="bg-white text-black px-6 py-2 rounded-full">
                                    {(component.config as any)?.callToAction.text}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {component.type === "banner" && (
                          <div className="aspect-[3/1] overflow-hidden rounded-lg">
                            <ImagePreview
                              src={(component.config as any)?.imageUrl}
                              alt={(component.config as any)?.title}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}