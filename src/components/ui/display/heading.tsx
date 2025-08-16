interface HeadingProps {
  title: string;
  description?: string;
}

export function Heading({ title, description }: HeadingProps) {
  return (
    <div className="grid gap-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
