import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-[1.02] active:scale-[0.98] transform-gpu",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 [&.is-3d]:border-primary-foreground/30 [&.is-3d]:after:from-white/40 [&.is-3d]:shadow-[0_0_0_1px_rgba(0,0,0,0.05)] [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-primary-foreground/5 [&.is-3d]:to-transparent",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 [&.is-3d]:border-destructive-foreground/30 [&.is-3d]:after:from-white/30 [&.is-3d]:shadow-[0_0_0_1px_rgba(0,0,0,0.05)] [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-white/10 [&.is-3d]:to-transparent",
        outline:
          "border-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 [&.is-3d]:border-accent/30 [&.is-3d]:after:from-white/30 [&.is-3d]:shadow-[0_0_0_1px_rgba(0,0,0,0.05)] [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-accent/5 [&.is-3d]:to-transparent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 [&.is-3d]:border-secondary-foreground/30 [&.is-3d]:after:from-white/30 [&.is-3d]:shadow-[0_0_0_1px_rgba(0,0,0,0.05)] [&.is-3d]:bg-gradient-to-b [&.is-3d]:from-secondary-foreground/5 [&.is-3d]:to-transparent",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      is3DNoLayout: {
        true: "relative transition-all duration-200 ease-out before:content-[''] before:absolute before:inset-0 before:rounded-md before:shadow-[inset_0_-6px_0_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.1)] hover:before:shadow-[inset_0_-5px_0_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)] hover:translate-y-[1px] active:before:shadow-[inset_0_-2px_0_rgba(0,0,0,0.25),0_1px_4px_rgba(0,0,0,0.1)] active:translate-y-[3px] hover:brightness-[1.03] active:brightness-[0.97] after:absolute after:inset-0 after:rounded-md after:opacity-25 after:bg-gradient-to-b after:from-white/60 after:via-white/5 after:to-black/5 after:pointer-events-none border-b border-black/10 dark:border-white/10 transform-gpu hover:scale-[1.01] active:scale-[0.98] after:transition-opacity after:duration-200 active:after:opacity-10 overflow-visible",
        false: "transition-transform duration-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      is3DNoLayout: false,
    },
  }
);

function Button({
  className,
  variant,
  size,
  is3DNoLayout = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    is3D?: boolean;
    is3DNoLayout?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, is3DNoLayout, className }),
        is3DNoLayout && "is-3d-no-layout"
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
