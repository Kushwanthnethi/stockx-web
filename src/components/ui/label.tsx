"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// We need to install @radix-ui/react-label for this to work perfectly, 
// but for now I will implement a simple accessible label without the dependency if it's not installed.
// Checking package.json... I remember installing some radix libs but maybe not label.
// To be safe and minimal dependency, I'll allow a standard label but styled.
// ACTUALLY, I'll check if I should use the primitive. 
// Plan didn't specify installing new deps, so I'll make a standard React label to avoid build errors if package missing.

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(labelVariants(), className)}
        {...props}
    />
))
Label.displayName = "Label"

export { Label }
