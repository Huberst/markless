import { signal } from '@preact/signals-core'
import { random } from 'lodash'
import { interval, map } from 'rxjs'
import { _EACH } from '../../src/control-structures/each.ts'
import { renderToDom } from '../../src/dom-renderer/dom-renderer.ts'
import { button, component, div, h1, li, ul } from '../../src/index.ts'
import { toRa } from './helpers.ts'

// Array of 10 nice colors which work with black background.
const colors = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F333FF',
  '#33FFF5',
  '#F5FF33',
  '#FF33A8',
  '#A833FF',
  '#33FFA8',
  '#FFA833',
]
const _pickRandomColor = () => {
  const idx = Math.floor(Math.random() * colors.length)
  return colors[idx]
}

// Simple Component to show nesting in other components.

// Main Component example. Contains reactive text and a reactive style attribute.
const MyComp = () =>
  component(() => {
    const [countUp] = toRa(interval(1000).pipe(map((el) => `${el}`)))

    const makeListEntries = (): string[] => {
      const entries: Set<string> = new Set<string>()
      const randomAmount = random(1, 10)
      while (entries.size < randomAmount) {
        const randNum = Math.floor(Math.random() * 10).toString()
        entries.add(randNum)
      }
      return Array.from(entries)
    }

    const listEntries = signal(makeListEntries())
    const [sigListEntries] = toRa(listEntries)

    return [
      h1._('Hello from MyComp'),

      button
        ._('Regenerate List')
        .event('click', () => (listEntries.value = makeListEntries())),

      ul._(
        _EACH(sigListEntries).DO((item) => [
          li._(`Item: ${item}`),
          _EACH(sigListEntries).DO((nestedItem) =>
            li._(`-- Nested Item: ${nestedItem}`),
          ),
        ]),
      ),

      // _EACH([0, 2]).DO(() => BlinkComp()),

      'This is a static text ',

      countUp,
    ]
  })

renderToDom(document.body, MyComp())
