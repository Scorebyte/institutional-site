import { RouterProvider } from 'react-router-dom'

import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary'
import { appRouter } from '@/app/router'

export function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={appRouter} />
    </AppErrorBoundary>
  )
}
