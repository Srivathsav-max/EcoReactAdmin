import { Separator } from "@/components/ui/separator";
import { ApiReference } from "./components/api-reference";

export default function DocumentationPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
          <Separator />
          <ApiReference />
        </div>
      </div>
    </div>
  );
} 