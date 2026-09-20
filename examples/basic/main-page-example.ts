import { computed, signal } from '@preact/signals-core'
import {
  debounceTime,
  distinctUntilChanged,
  from,
  map,
  of,
  Subject,
  startWith,
  switchMap,
  tap,
} from 'rxjs'
import { _EACH } from '../../src/control-structures/each.ts'
import {
  component,
  h1,
  input,
  li,
  p,
  section,
  style,
  toReactiveAdapterWithSource as toRa,
  ul,
} from '../../src/index.ts'

// Real Datamuse word-suggestion API
// Thanks to https://datamuse.com for this free service!
const fetchSuggestions = (query: string): Promise<string[]> =>
  fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}`)
    .then((r) => r.json())
    .then((data: { word: string }[]) => data.map((d) => d.word))

// example-start: SearchWithSuggestions
export const SearchWithSuggestions = () =>
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
    // biome-ignore format: custom layout
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

    // biome-ignore format: custom layout
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
// example-end: SearchWithSuggestions
