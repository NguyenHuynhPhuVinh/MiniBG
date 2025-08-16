import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-[80px] w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-2 text-base shadow-xs transition-all outline-none resize-vertical disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-primary focus:ring-0 focus:ring-offset-0",
        "aria-invalid:border-destructive aria-invalid:focus:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
