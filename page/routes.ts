// Simple routing example

import { signal } from '@preact/signals-core'
import type { MarkLess } from '../src/static-el-base.ts'
import { HomePage } from './home.ts'

type TRoute = {
  matchPath: (path: string) => boolean
  render: () => MarkLess
}

const homeRoute = {
  matchPath: (path: string) => path === '/',
  render: HomePage,
} satisfies TRoute

// const aboutRoute = {
//   matchPath: (path: string) => path === '/about',
//   render: AboutPage,
// } satisfies TRoute

const routes = [
  homeRoute,
  // aboutRoute
]

const parseRoute = (route: string): TRoute => {
  const pickedRoute = routes.find((r) => r.matchPath(route))
  return pickedRoute ?? homeRoute
}

export const routeSig = signal<TRoute>(parseRoute(location.pathname))

navigation.addEventListener('navigate', (evt) => {
  if (
    !evt?.canIntercept ||
    evt.hashChange ||
    evt.downloadRequest ||
    evt.navigationType === 'reload'
  ) {
    return
  }

  const url = new URL(evt.destination.url)
  const path = parseRoute(url.pathname)

  evt.intercept({
    handler() {
      if (path === routeSig.value) return
      routeSig.value = path
    },
  })
})
