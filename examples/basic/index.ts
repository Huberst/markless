import { a, h1, li, nav, renderToDom, ul } from '../../src/index.ts'

const examples = [
  { name: 'main', module: 'main', load: () => import('./main.ts') },
  {
    name: 'Fast list changes',
    module: 'fast-list-changes',
    load: () => import('./fast-list-changes.ts'),
  },
  {
    name: 'If stress',
    module: 'if-stress',
    load: () => import('./if-stress.ts'),
  },
  {
    name: 'Mount/unmount stress',
    module: 'mount-unmount-stress',
    load: () => import('./mount-unmount-stress.ts'),
  },
  {
    name: 'Using ref',
    module: 'using-ref',
    load: () => import('./using-ref.ts'),
  },
  {
    name: 'Simple reactive control',
    module: 'simple-reactive-control',
    load: () => import('./simple-reactive-control.ts'),
  },
  {
    name: 'Each failure demo',
    module: 'each-failure-demo',
    load: () => import('./each-failure-demo.ts'),
  },
  {
    name: 'Using slots',
    module: 'using-slots',
    load: () => import('./using-slots.ts'),
  },
  {
    name: 'Using cleanup dialog',
    module: 'using-cleanup-dialog',
    load: () => import('./using-cleanup-dialog.ts'),
  },
  {
    name: 'Minimal todo',
    module: 'minimal-todo',
    load: async () => {
      const { MinimalTodo } = await import('./minimal-todo.ts')
      renderToDom(document.body, MinimalTodo())
    },
  },
]

const selectedModule = new URLSearchParams(globalThis.location.search).get(
  'example',
)
const selectedExample = examples.find(({ module }) => module === selectedModule)

renderToDom(
  document.body,
  nav
    .class('examples-nav')
    ._([
      h1._('markless examples'),
      ul._(
        examples.map(({ name, module }) =>
          li._(a._(name).attr('href', `?example=${module}`)),
        ),
      ),
    ]),
)

if (selectedExample) {
  await selectedExample.load()
}
