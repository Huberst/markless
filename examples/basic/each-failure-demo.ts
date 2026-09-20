import { computed, signal } from '@preact/signals-core'
import { _EACH } from '../../src/control-structures/each.ts'
import {
  button,
  component,
  div,
  h1,
  h2,
  li,
  p,
  renderToDom,
  ul,
} from '../../src/index.ts'
import { toRa } from './helpers.ts'

type DemoItem = {
  id: string
  label: string
}

const cloneItems = (items: DemoItem[]) => items.map((item) => ({ ...item }))

const summarize = (items: DemoItem[]) =>
  items.map((item) => `${item.id}:${item.label}`).join(' | ')

const sectionStyle =
  'border: 1px solid #999; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;'

const actionsStyle =
  'display: flex; gap: 0.5rem; margin: 0.75rem 0; flex-wrap: wrap;'

const makeScenario = (args: {
  title: string
  description: string
  failureHint: string
  initial: DemoItem[]
  actionLabel: string
  action: (items: DemoItem[]) => DemoItem[]
}) => {
  const itemsSig = signal(cloneItems(args.initial))
  const [itemsRa] = toRa(itemsSig)
  const [summaryRa] = toRa(computed(() => summarize(itemsSig.value)))

  return div.attr('style', sectionStyle)._([
    h2._(args.title),
    p._(args.description),
    div.attr('style', actionsStyle)._([
      button._('Reset').event('click', () => {
        itemsSig.value = cloneItems(args.initial)
      }),
      button._(args.actionLabel).event('click', () => {
        itemsSig.value = args.action(cloneItems(itemsSig.value))
      }),
    ]),
    p._(['Expected data state: ', summaryRa]),
    p._(
      'Rendered list below uses the current _EACH implementation with item.id as key:',
    ),
    ul._(
      _EACH(itemsRa, (item) => item.id).DO((item) =>
        li._(`${item.id}: ${item.label}`),
      ),
    ),
    p._(args.failureHint),
  ])
}

const Demo = () =>
  component(() => {
    const reorderDemo = makeScenario({
      title: '1. Reorder failure',
      description:
        'Click the action once. The reactive data reverses, but the DOM rows stay in the old order.',
      failureHint:
        'Expected failure with the original implementation: the text above changes to c, b, a, but the rendered list stays a, b, c.',
      initial: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
        { id: 'c', label: 'Gamma' },
      ],
      actionLabel: 'Reverse order',
      action: (items) => [...items].reverse(),
    })

    const replaceDemo = makeScenario({
      title: '2. Same-key replacement failure',
      description:
        'This replaces the object for key a but keeps the same key. The current implementation keeps the old row entity and never rerenders it.',
      failureHint:
        'Expected failure with the original implementation: the data text shows Alpha updated, but the rendered row still shows Alpha.',
      initial: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ],
      actionLabel: 'Replace label for key a',
      action: (items) =>
        items.map((item) => {
          if (item.id === 'a') {
            return { ...item, label: 'Alpha updated' }
          }
          return item
        }),
    })

    const appendDemo = makeScenario({
      title: '3. Append ordering failure',
      description:
        'This appends a new keyed item to the end of the array. The current insertion logic mounts new rows after the anchor, so the new row can appear at the front.',
      failureHint:
        'Expected failure with the original implementation: the data text ends with c:Gamma, but the rendered list starts with c:Gamma.',
      initial: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ],
      actionLabel: 'Append c:Gamma',
      action: (items) => [...items, { id: 'c', label: 'Gamma' }],
    })

    return [
      h1._('Original _EACH failure demo'),
      p._(
        'This page is meant to be run against the original _EACH implementation. Each section keeps its own list state so the failure is easy to reproduce.',
      ),
      reorderDemo,
      replaceDemo,
      appendDemo,
    ]
  })

renderToDom(document.body, Demo())
