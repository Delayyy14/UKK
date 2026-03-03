'use client';

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext<{
  openValue?: string;
  setOpenValue: (value?: string) => void;
} | null>(null);

export const Accordion = ({ 
  children, 
  type = "single", 
  collapsible = true, 
  className 
}: { 
  children: React.ReactNode; 
  type?: "single"; 
  collapsible?: boolean; 
  className?: string 
}) => {
  const [openValue, setOpenValue] = React.useState<string | undefined>();

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div className={cn("space-y-4", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({ 
  value, 
  children, 
  className 
}: { 
  value: string; 
  children: React.ReactNode; 
  className?: string 
}) => {
  return (
    <div className={cn("border-b", className)} data-value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value } as any);
        }
        return child;
      })}
    </div>
  );
};

export const AccordionTrigger = ({ 
  children, 
  className, 
  value 
}: { 
  children: React.ReactNode; 
  className?: string; 
  value?: string 
}) => {
  const context = React.useContext(AccordionContext);
  const isOpen = context?.openValue === value;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      onClick={() => {
        if (isOpen) {
          context?.setOpenValue(undefined);
        } else {
          context?.setOpenValue(value);
        }
      }}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
};

export const AccordionContent = ({ 
  children, 
  className, 
  value 
}: { 
  children: React.ReactNode; 
  className?: string; 
  value?: string 
}) => {
  const context = React.useContext(AccordionContext);
  const isOpen = context?.openValue === value;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};
