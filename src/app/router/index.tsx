import { createBrowserRouter } from 'react-router-dom'
import { RouteEffects } from './RouteEffects'

export const appRouter = createBrowserRouter([
  {
    element: <RouteEffects />,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('@/pages/institutional/ui/InstitutionalPage')
          return { Component: module.InstitutionalPage }
        },
      },
      {
        path: 'sandbox',
        lazy: async () => {
          const module = await import('@/pages/sandbox/ui/SandboxPage')
          return { Component: module.SandboxPage }
        },
      },
      {
        path: '*',
        lazy: async () => {
          const module = await import('@/pages/not-found/ui/NotFoundPage')
          return { Component: module.NotFoundPage }
        },
      },
    ],
  },
])
