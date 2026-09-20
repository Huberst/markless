// ⚠️  AUTO-GENERATED — do not edit by hand.
// Run `deno task generate-raw` to regenerate.
// Source: tools/gen-raw-exports.ts

import { basicText, BasicComponent, UsingElements, UsingElementsNesting, ReactiveColorSelection } from '../examples/basic/basic-usage.ts'
import { MinimalTodo } from '../examples/basic/minimal-todo.ts'
import { SearchWithSuggestions } from '../examples/basic/main-page-example.ts'

export const rawExamples = {
  basicText: { raw: `export const basicText = 'Hello World!'
renderToDom(document.body, basicText)`, toRender: basicText },

  BasicComponent: { raw: `export const BasicComponent = (toGreet: string) =>
  component((): MarkLess => \`Hello \${toGreet}!\`)

renderToDom(document.body, BasicComponent('Mars'))`, toRender: BasicComponent },

  UsingElements: { raw: `export const UsingElements = component(() => div._(\`
  My parent is easy to spot!
\`))

// This is how to attach the component to the DOM.
// We won't repeat this for every example.
renderToDom(document.body, UsingElements)`, toRender: UsingElements },

  UsingElementsNesting: { raw: `// Components simply return MarkLess, which can be text, html element classes,
// other components, control structures or reactive adapters
// (more about that later).
const NestedHighlight = (text: string, color: string) =>
  component(
    (): MarkLess =>
      p
        .attrSet({ style: styles({ color }) })
        ._(text),
  )

// This component simply nests elements and a component.
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
))`, toRender: UsingElementsNesting },

  ReactiveColorSelection: { raw: `import {
  _EACH,
  toReactiveAdapterWithSource as toRA
} from '@huberst/markless'
import { computed, signal } from '@preact/signals-core'

// No need to think about re-rendering. Only reactive adapters cause change.
export const ReactiveColorSelection = component((): MarkLess => {

  const colors = ['red', 'green', 'deepskyblue', 'orange', 'purple']

  const [selectedColorRA, selectedColorSig] = toRA(signal<string | null>(null))
  const [selectedColorStyleRA] = toRA(
    computed(() => \`color: \${selectedColorSig.value ?? 'white'};\`),
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
})`, toRender: ReactiveColorSelection },

  MinimalTodo: { raw: `export const MinimalTodo = () =>
  component((): MarkLess => {
    // ℹ️ Reactivity is provided via Reactive Adapters. You can use preact/signals, rxjs
    // or any other library - as long as you wrap it in a compatible adapter.
    // Here we use Preact Signals via the RA helper.
    const todosSig = signal([firstTodo, ...initialEntries])

    // ℹ️ Here we create two derived reactive adapters for done and open todos.
    const [done] = toRa(
      computed(() => todosSig.value.filter((t) => t.completed)),
    )
    const [open] = toRa(
      computed(() => todosSig.value.filter((t) => !t.completed)),
    )

    // ℹ️ Use ref to get a handle on the input element.
    // Check the use of the setRef method below.
    let inputRef: HTMLInputElement | null = null

    // ℹ️ Place functions to work with the reactive data here.
    // You can also organize them outside the component function, it depends on your needs.
    const addTodo = () => {
      if (inputRef && inputRef.value.trim() !== '') {
        const newTodo: TodoEntry = {
          val: inputRef.value.trim(),
          completed: false,
        }
        todosSig.value = [...todosSig.value, newTodo]
        inputRef.value = ''
      }
    }

    const toggleTodo = (todo: TodoEntry) => {
      todosSig.value = todosSig.value.map((t) =>
        t === todo ? { ...t, completed: !t.completed } : t,
      )
    }

    // ℹ️ Make small helpers like this one to avoid redundancy.
    const listItem = (todo: TodoEntry) =>
      li._([
        div._([todo.completed ? '✅ ' : '📝 ']),
        div._(todo.val),
      ])
      .event('click', () => toggleTodo(todo))

    return [
      h1._('Minimal Todo List'),
      p._('A simple todo list example using markless.'),

      input
        .attr('placeholder', 'New Entry')
        .setRef(ref => { inputRef = ref }),

      button._('Add Todo').event('click', addTodo),

      div.class('list-wrapper')._([

        h2._('Completed Todos'),
        ul.class('todo-list completed')._(
        _EACH(done, i => i.val)
          .DO((item) => listItem(item))
        ),

        h2._('Open Todos'),
        ul.class('todo-list')._(
        _EACH(open, i => i.val)
          .DO((item) => listItem(item))
        ),

      ])
    ]
  })`, toRender: MinimalTodo },

  SearchWithSuggestions: { raw: `export const SearchWithSuggestions = () =>
  component(() => {
    // Pass reactive adapters to _IF, _EACH, and _DYNAMIC to have the UI update
    // the presence of DOM elements.
    // So bring your reactive sources of choice and use them in reactive adapters
    // to drive the UI. For this example, we use RxJS and Preact Signals.

    // Signal example: Track whether the async fetchSuggestions is in-flight, or
    // if the user is typing. Signal stuff for the UI to reactively feedback.
    const isLoadingSig = signal(false)
    const isTypingSig = signal(false)
    // Of course you can use whatever your reactive lib offers, like computed,
    // as long as the returned shape fits the reactive adapter.
    // Creating a reactive adapter for any reactive lib is easy an straightforward.
    // Check out reactive-adapters.ts in src/ (rxjs and signal example).
    const [states] = toRa(
      computed(() => {
        const states: string[] = []
        if (isLoadingSig.value) states.push('Loading...')
        if (isTypingSig.value) states.push('Typing...')
        return states
      }),
    )

    // Use RxJS to debounce, distinct, and switchMap to the async fetchSuggestions.
    const input$ = new Subject<string>()
    const [suggestions] = toRa(
      input$.pipe(
        tap(() => isTypingSig.value = true),
        debounceTime(500),
        tap(() => isTypingSig.value = false),
        distinctUntilChanged(),
        tap(() => isLoadingSig.value = true),
        switchMap((q) => (
            q.length <= 0
              ? of([] as string[])
              : from(fetchSuggestions(q))
          ).pipe(tap(() => isLoadingSig.value = false))
        ),
        startWith([] as string[]),
      ),
    )

    const [inputCharCountOdd] = toRa(
      input$.pipe(map((query) => (query.length % 2 === 1 ? 'odd' : ''))),
    )
    return section.class('search-with-suggestions-example')._([

      h1._('Example — Search with Suggestions'),

      input
        .attrSet({
          type: 'text',
          placeholder: 'Type anything…',
        })
        .class('search-input', inputCharCountOdd)
        // Event types are inferred. This is an input element, the event is
        // an InputEvent, and the target is an HTMLInputElement. Just TypeScript.
        .event('input', (event) => {
          input$.next(event.target.value)
        }),


      _EACH(states)
        .DO((state) => p._(state)),

      ul._(
        _EACH(suggestions, (word) => word)
          .DO((word) => li._(word)),
      ),
    ])
  })

renderToDom(document.body, SearchWithSuggestions())`, toRender: SearchWithSuggestions },
}
