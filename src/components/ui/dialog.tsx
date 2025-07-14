"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';


export const Dialog = DialogPrimitive.Root;

export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogTitlee = DialogPrimitive.Title;


export const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50 top-[50%] left-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg focus:outline-none",
                className
            )}
            {...props}
        >

            <DialogTitlee>
                <VisuallyHidden>Modal</VisuallyHidden>
            </DialogTitlee>
            {children}
            <DialogPrimitive.Close className="absolute top-3 right-3 text-gray-500 hover:text-black">
                <X className="h-5 w-5" />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ children }: React.PropsWithChildren) => (
    <div className="mb-4">{children}</div>
);

export const DialogFooter = ({ children }: React.PropsWithChildren) => (
    <div className="mt-4 flex justify-between space-x-2">{children}</div>
);

export const DialogTitle = ({ children }: React.PropsWithChildren) => (
    <h2 className="text-xl font-semibold text-gray-900">{children}</h2>
);
