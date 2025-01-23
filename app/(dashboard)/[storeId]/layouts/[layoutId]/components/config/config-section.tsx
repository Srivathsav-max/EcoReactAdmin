"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { type LayoutComponent } from "@/types/models";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const componentTypes = [
  { value: "billboard", label: "Billboard" },
  { value: "featured-products", label: "Featured Products" },
  { value: "banner", label: "Banner" },
  { value: "categories", label: "Categories Grid" },
  { value: "products-grid", label: "Products Grid" },
  { value: "products-carousel", label: "Products Carousel" },
] as const;

const formSchema = z.object({
  type: z.string().min(1)
});

type ComponentFormValues = z.infer<typeof formSchema>;

interface ConfigSectionProps {
  layoutId: string;
  components: LayoutComponent[];
}

export default function ConfigSection({ layoutId, components: initialComponents }: ConfigSectionProps) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState(initialComponents);

  const form = useForm<ComponentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
    }
  });

  const onSubmit = async (data: ComponentFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.storeId}/layouts/${layoutId}/components`, data);
      form.reset();
      router.refresh();
      toast.success('Component added.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      position: index
    }));

    try {
      setLoading(true);
      await axios.patch(
        `/api/${params.storeId}/layouts/${layoutId}/components`,
        { components: updates }
      );
      router.refresh();
      toast.success('Components reordered.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          defaultValue={field.value} 
                          placeholder="Select a component type" 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {componentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit">
            Add Component
          </Button>
        </form>
      </Form>
      <Separator />
      <Heading title="Layout Components" description="Drag to reorder components" />
      <div className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="components">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {components.map((component, index) => (
                  <Draggable 
                    key={component.id} 
                    draggableId={component.id} 
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4"
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              {componentTypes.find(t => t.value === component.type)?.label}
                            </CardTitle>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDelete(component.id)}
                            >
                              Remove
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              Position: {index + 1}
                            </div>
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
        </DragDropContext>
      </div>
    </div>
  );
}