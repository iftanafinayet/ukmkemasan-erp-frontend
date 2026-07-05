import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./Utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary shadow-card hover:bg-primary/90 hover:shadow-card-hover",
        destructive:
          "bg-error text-on-error shadow-card hover:bg-error/90",
        outline:
          "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low hover:border-outline",
        secondary:
          "bg-secondary text-on-secondary hover:bg-secondary/90",
        ghost:
          "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
        cta:
          "bg-primary text-on-primary shadow-elevated hover:bg-primary/90 hover:shadow-modal",
      },
      size: {
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs",
        default: "h-10 px-5 py-2",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
