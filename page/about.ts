import { component, h1, h2, type MarkLess, p } from '../src/index.ts'

export const AboutPage = () =>
  component(
    (): MarkLess => [
      h1._('About'),
      p._(`
        markless is built with Deno and TypeScript.
        It is framework-agnostic and works with
        any reactive source — RxJS, Preact Signals, or your own.
      `),
      h2._('Why?'),
      p._(`
        Sometimes you want the raw power of the DOM with a bit of structure —
        without pulling in a full framework.
      `),
    ],
  )
