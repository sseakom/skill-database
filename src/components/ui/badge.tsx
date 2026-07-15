import { cn } from "@/lib/utils";

const VARIANT_CLASSES: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  destructive: "bg-destructive/15 text-destructive",
  outline: "border border-border text-foreground",
};

export function Badge({
  variant = "default",
  className,
  style,
  ...props
}: React.ComponentProps<"span"> & { variant?: keyof typeof VARIANT_CLASSES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default,
        className
      )}
      style={style}
      {...props}
    />
  );
}
