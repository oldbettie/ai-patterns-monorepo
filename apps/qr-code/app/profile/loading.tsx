export default function ProfileLoading() {
  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
        <div className='mb-4 mx-auto h-16 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse' />
        <div className='mx-auto h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse' />
        <div className='mt-2 mx-auto h-4 w-48 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse' />
      </div>
    </main>
  )
}
