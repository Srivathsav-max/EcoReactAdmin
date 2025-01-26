"use client";

import { DragDropContext, Draggable, Droppable, DroppableProps } from "react-beautiful-dnd";
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { LayoutComponent } from "@/types/models";
import EditComponentDialog from "./edit-component-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertModal } from "@/components/modals/alert-modal";
import { 
  Layout, 
  Image, 
  Grid, 
  List,
  ShoppingBag,
  LayoutGrid,
  GripHorizontal,
  Trash,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) return null;

  return <Droppable {...props}>{children}</Droppable>;
};

const componentTypes = [
  { value: "billboard", label: "Billboard", icon: Image },
  { value: "featured-products", label: "Featured Products", icon: ShoppingBag },
  { value: "banner", label: "Banner", icon: Layout },
  { value: "sliding-banners", label: "Sliding Banners", icon: SlidersHorizontal },
  { value: "categories", label: "Categories Grid", icon: Grid },
  { value: "products-grid", label: "Products Grid", icon: LayoutGrid },
  { value: "products-carousel", label: "Products Carousel", icon: List },
] as const;

interface LayoutBuilderProps {
  initialComponents: LayoutComponent[];
  layoutId: string;
  storeId: string;
  onUpdate?: () => void;
}

export default function LayoutBuilder({
  initialComponents,
  layoutId,
  storeId,
  onUpdate
}: LayoutBuilderProps) {
  const [components, setComponents] = useState<LayoutComponent[]>(initialComponents);
  const [loading, setLoading] = useState(false);
  const [editingComponent, setEditingComponent] = useState<LayoutComponent | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<LayoutComponent | null>(null);

  useEffect(() => {
    setComponents(initialComponents);
  }, [initialComponents]);

  const handleUpdate = useCallback(() => {
    onUpdate?.();
  }, [onUpdate]);

  const onDeleteComponent = async () => {
    if (!deletingComponent) return;

    try {
      setLoading(true);
      await axios.delete(
        `/api/${storeId}/layouts/${layoutId}/components/${deletingComponent.id}`
      );
      setComponents(prev => prev.filter(c => c.id !== deletingComponent.id));
      toast.success("Component deleted");
      handleUpdate();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete component");
    } finally {
      setLoading(false);
      setDeletingComponent(null);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedComponents = Array.from(components);

    try {
      setLoading(true);

      if (source.droppableId === "components-library" && destination.droppableId === "active-components") {
        const componentType = result.draggableId.replace("new-", "");
        console.log('Adding new component:', { componentType, position: destination.index });
        
        try {
          const response = await axios.post(
            `/api/${storeId}/layouts/${layoutId}/components`,
            { type: componentType, position: destination.index }
          );

          console.log('Component creation response:', response.data);

          if (!response.data || !response.data.id) {
            throw new Error('Invalid response data');
          }

          updatedComponents.splice(destination.index, 0, response.data);
          setComponents(updatedComponents);
          toast.success("Component added");
        } catch (error: any) {
          console.error('Component creation error:', error.response?.data || error.message);
          toast.error(error.response?.data || "Failed to add component");
          throw error; // Re-throw to trigger the catch block below
        }
      }
      else if (source.droppableId === "active-components" && destination.droppableId === "active-components") {
        const [movedComponent] = updatedComponents.splice(source.index, 1);
        updatedComponents.splice(destination.index, 0, movedComponent);

        await axios.patch(
          `/api/${storeId}/layouts/${layoutId}/components`,
          { components: updatedComponents.map((item, index) => ({
            id: item.id, position: index
          }))}
        );
        
        setComponents(updatedComponents);
        toast.success("Components reordered");
      }

      handleUpdate();
    } catch (error) {
      console.error("Drag and drop error:", error);
      toast.error("Failed to update components");
      setComponents(components);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={!!deletingComponent}
        onClose={() => setDeletingComponent(null)}
        onConfirm={onDeleteComponent}
        loading={loading}
      />

      <EditComponentDialog
        isOpen={!!editingComponent}
        onClose={() => {
          setEditingComponent(null);
          handleUpdate();
        }}
        component={editingComponent}
        storeId={storeId}
        layoutId={layoutId}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <div className="sticky top-8">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Available Components</h2>
                <StrictModeDroppable
                  droppableId="components-library"
                  isDropDisabled={true}
                  isCombineEnabled={false}
                >
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="grid grid-cols-2 gap-4"
                    >
                      {componentTypes.map((type, index) => {
                        const Icon = type.icon;
                        return (
                          <Draggable
                            key={type.value}
                            draggableId={`new-${type.value}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed",
                                  "transition-all duration-200 cursor-move hover:border-primary",
                                  "bg-background hover:bg-accent",
                                  snapshot.isDragging && "ring-2 ring-primary shadow-lg",
                                )}
                              >
                                <Icon className="h-8 w-8 mb-2 text-muted-foreground" />
                                <span className="text-sm font-medium text-center">
                                  {type.label}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </Card>
            </div>
          </div>

          <div className="col-span-9">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Page Layout</h2>
              <StrictModeDroppable
                droppableId="active-components"
                isDropDisabled={false}
                isCombineEnabled={false}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "space-y-4 min-h-[500px] rounded-lg p-4",
                      "transition-colors duration-200",
                      snapshot.isDraggingOver ? "bg-accent/50" : "bg-accent/10",
                      !components.length && "border-2 border-dashed"
                    )}
                  >
                    {!components.length && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                        <Layout className="h-12 w-12 mb-4" />
                        <p className="text-lg font-medium">Drag components here</p>
                        <p className="text-sm">Build your page layout by adding components</p>
                      </div>
                    )}

                    {components.map((component, index) => (
                      <Draggable 
                        key={component.id} 
                        draggableId={component.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative rounded-lg border bg-card p-4",
                              "transition-all duration-200 group",
                              snapshot.isDragging && "ring-2 ring-primary shadow-lg",
                            )}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 cursor-move"
                            >
                              <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center justify-between pl-8">
                              <div>
                                <span className="font-medium">
                                  {componentTypes.find(t => t.value === component.type)?.label}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  Position: {index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
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
                                  onClick={() => setDeletingComponent(component)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </Card>
          </div>
        </div>
      </DragDropContext>
    </>
  );
}