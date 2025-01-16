"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ApiSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ApiSection: React.FC<ApiSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};
