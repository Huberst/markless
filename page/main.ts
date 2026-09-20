import { computed } from '@preact/signals-core'
import { toRa } from '../examples/basic/helpers.ts'
import {
  _DYNAMIC,
  _EACH,
  a,
  component,
  footer,
  header,
  li,
  type MarkLess,
  main,
  nav,
  renderToDom,
  ul,
} from '../src/index.ts'
import { routeSig } from './routes.ts'

const [mainToRender] = toRa(
  computed<() => MarkLess>(() => routeSig.value.render),
)

export const menuWithIds = {
  Mission: {
    href: '#Mission',
    title: 'The Mission',
  },
  Benefits: {
    href: '#Benefits',
    title: 'Benefits',
  },
  Reactivity: {
    href: '#Reactivity',
    title: 'Reactivity',
  },
  Todo: {
    href: '#Todo',
    title: 'Todo Example',
  },
  Mixing: {
    href: '#Mixing',
    title: 'Mixing Reactive Sources',
  },
}

const NavBar = () =>
  component(
    // biome-ignore format: custom layout needed
    (): MarkLess =>

      nav._(
        ul._(
          _EACH(Object.entries(menuWithIds))
          .DO(([_name, { href, title }]) =>
            li._(
              a._(title)
                .attr('href', href)
          ))),
      ),
  )

const Docs = () =>
  component(
    // biome-ignore format: custom layout needed
    (): MarkLess => [

      header.class('container')
        ._(NavBar()),

      main.class('container')
        ._(_DYNAMIC(mainToRender)),

      footer.class('container')
        ._('markless — built with TypeScript'),
    ],
  )

renderToDom(document.body, Docs())
