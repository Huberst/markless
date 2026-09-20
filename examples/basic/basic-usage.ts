import {
  component,
  div,
  h2,
  h3,
  type MarkLess,
  p,
  button,
  _IF,
  styles,
} from '../../src/index.ts'

const renderToDom = (container: HTMLElement, component: unknown) => {}

// example-start: basicText
export const basicText = 'Hello World!'
renderToDom(document.body, basicText)
// example-end: basicText

// example-start: BasicComponent
export const BasicComponent = (toGreet: string) =>
  component((): MarkLess => `Hello ${toGreet}!`)

renderToDom(document.body, BasicComponent('Mars'))
// example-end: BasicComponent

// example-start: UsingElements
// biome-ignore format: custom layout needed
export const UsingElements = component(() => div._(`
  My parent is easy to spot!
`))

// This is how to attach the component to the DOM.
// We won't repeat this for every example.
renderToDom(document.body, UsingElements)
// example-end: UsingElements

// example-start: UsingElementsNesting
// Components simply return MarkLess, which can be text, html element classes,
// other components, control structures or reactive adapters
// (more about that later).
const NestedHighlight = (text: string, color: string) =>
  // biome-ignore format: custom layout needed
  component(
    (): MarkLess =>
      p
        .attrSet({ style: styles({ color }) })
        ._(text),
  )

// This component simply nests elements and a component.
// biome-ignore format: custom layout needed
export const UsingElementsNesting = component(() => div._(
  h2._('Structured HTML Tags -> TypeScript Classes'),
  p._('Instead of opening and closing tags, you call the ._ method to add...'),
  div._(
    h3._('Children...'),
    p._(
      'to an element.',
      NestedHighlight('Of course you can nest components too!', 'gold'),
    ),
  ),
))

// example-end: UsingElementsNesting

/**
 * REACTIVITY
 */

// example-start: ReactiveColorSelection
// biome-ignore format: custom layout needed
import {
  _EACH,
  toReactiveAdapterWithSource as toRA
} from '../../src/index.ts'
import { computed, signal } from '@preact/signals-core'

// No need to think about re-rendering. Only reactive adapters cause change.
export const ReactiveColorSelection = component((): MarkLess => {

  const colors = ['red', 'green', 'deepskyblue', 'orange', 'purple']

  const [selectedColorRA, selectedColorSig] = toRA(signal<string | null>(null))
  const [selectedColorStyleRA] = toRA(
    computed(() => `color: ${selectedColorSig.value ?? 'white'};`),
  )

  function pickColor(color: string) {
    selectedColorSig.value = color
  }

  return [
    h3 // Passing a reactive adapter to an element's attribute makes it reactive.
      .attrSet({ style: selectedColorStyleRA })
      ._('Select a color'),

    // Use _EACH to render a list of items. We pass a normal array here, but you
    // can also pass a reactive adapter to make it reactive.
    _EACH(colors).DO((color) =>
      button._(color).event('click', () => pickColor(color)),
    ),

    // Use _IF to conditionally render content. Here we pass a reactive adapter
    // to the condition, so it will re-render when the selected color changes.
    _IF(selectedColorRA)
      .THEN(
        p._('You selected: ', selectedColorRA)
      )
      .ELSE(
        p._('No color selected yet.')
      ),
  ]
})
// example-end: ReactiveColorSelection
