import { Check, Copy, Server } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiAlertProps {
  title: string;
  description: string;
  variant: 'public' | 'admin',
};

const textMap: Record<ApiAlertProps["variant"], string> = {
  public: 'Public',
  admin: 'Admin'
};

const alertVariantMap: Record<ApiAlertProps["variant"], "info" | "warning"> = {
  public: 'info',
  admin: 'warning'
};

const badgeVariantMap: Record<ApiAlertProps["variant"], BadgeProps["variant"]> = {
  public: 'secondary',
  admin: 'destructive'
};

export const ApiAlert: React.FC<ApiAlertProps> = ({
  title,
  description,
  variant = "public"
}) => {
  const [copying, setCopying] = useState(false);

  const onCopy = async (description: string) => {
    setCopying(true);
    await navigator.clipboard.writeText(description);
    toast.success('API Route copied to clipboard.');
    setTimeout(() => setCopying(false), 1000);
  }

  return (
    <Alert variant={alertVariantMap[variant]} className="overflow-hidden">
      <Server className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-x-2">
        {title}
        <Badge variant={badgeVariantMap[variant]} className="text-xs">
          {textMap[variant]}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-muted/50 px-[0.5rem] py-[0.3rem] font-mono text-sm font-semibold ring-1 ring-border/5 transition-colors">
          {description}
        </code>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onCopy(description)}
          className={cn(
            "transition-all duration-200 hover:bg-secondary",
            copying && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-500"
          )}
        >
          {copying ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
