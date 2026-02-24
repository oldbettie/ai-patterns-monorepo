export async function BackgroundDecoration() {
  return (
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-200px,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(255,255,255,0.06),transparent_60%)]'
    />
  )
}
