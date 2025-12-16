type PageHeroProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHero({ title, description, children }: PageHeroProps) {
  return (
    <div className="border-b bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
