type EntryListSectionProps = {
  children: React.ReactNode
  className?: string
}

export function EntryListSection({ children, className }: EntryListSectionProps) {
  return (
    <div className="container py-8">
      <div className={className}>{children}</div>
    </div>
  )
}
