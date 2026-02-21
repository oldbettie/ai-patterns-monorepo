export default function SmallpdfAlternativeLoading() {
  return (
    <div className="animate-pulse">
      <div className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
          <div className="h-14 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-6 bg-muted rounded w-2/3 mx-auto" />
          <div className="h-12 bg-muted rounded w-48 mx-auto" />
        </div>
      </div>
      <div className="py-24 px-6 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-12" />
          <div className="bg-card rounded-2xl border border-border h-64" />
        </div>
      </div>
    </div>
  )
}
