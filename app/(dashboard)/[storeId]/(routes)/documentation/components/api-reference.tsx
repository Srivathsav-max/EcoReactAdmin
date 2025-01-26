"use client";

import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateApiDocs } from "@/constants/api-docs";
import { toast } from "react-hot-toast";

export function ApiReference() {
  const params = useParams();
  const endpoints = generateApiDocs(params.storeId as string);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const onCopy = (text: string, endpoint: string, isFullUrl: boolean = false) => {
    const textToCopy = isFullUrl ? `${baseUrl}${text}` : text;
    navigator.clipboard.writeText(textToCopy);
    setCopiedEndpoint(endpoint);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopiedEndpoint(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}

      <Tabs defaultValue="products" className="space-y-4">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-muted/50 backdrop-blur-sm rounded-lg border">
          {/* Base URL Section */}
          <div className="w-full md:w-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">API Base URL</h3>
            <div className="flex items-center gap-2">
              <code className="relative rounded bg-muted px-[0.5rem] py-[0.35rem] font-mono text-sm">
                {`${baseUrl}/api/${params.storeId}`}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(`/api/${params.storeId}`, 'base-url', true)}
                className="h-8 px-2"
              >
                {copiedEndpoint === 'base-url' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* API Sections Navigation */}
          <div className="w-full md:w-auto">
            <TabsList className="flex flex-wrap h-auto gap-2 p-1 bg-muted/50">
              {Object.keys(endpoints).map((key) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="px-3 py-1.5 text-xs font-medium"
                >
                  {endpoints[key].title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* API Content Sections */}
        {Object.entries(endpoints).map(([key, section]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0">
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                {section.endpoints.map((endpoint, index) => (
                  <div 
                    key={index} 
                    className="space-y-4 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          endpoint.method === "GET" 
                            ? "bg-blue-100 text-blue-800"
                            : endpoint.method === "POST"
                            ? "bg-green-100 text-green-800"
                            : endpoint.method === "DELETE"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm bg-muted px-3 py-1 rounded-md">
                          {endpoint.path}
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(endpoint.path, endpoint.path, true)}
                        className="h-8 px-2"
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                    {endpoint.payloadExample && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Payload Example:</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopy(JSON.stringify(endpoint.payloadExample, null, 2), `payload-${index}`, true)}
                            className="h-8 px-2"
                          >
                            {copiedEndpoint === `payload-${index}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm">
                            {JSON.stringify(endpoint.payloadExample, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}
                    {endpoint.responseExample && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Response Example:</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopy(JSON.stringify(endpoint.responseExample, null, 2), `response-${index}`, true)}
                            className="h-8 px-2"
                          >
                            {copiedEndpoint === `response-${index}` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm">
                            {JSON.stringify(endpoint.responseExample, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 