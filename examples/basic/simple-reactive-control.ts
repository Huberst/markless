import { computed, signal } from '@preact/signals-core'
import { BehaviorSubject, map } from 'rxjs'

import {
  _EACH,
  button,
  component,
  h1,
  h2,
  li,
  p,
  renderToDom,
  span,
  ul,
} from '../../src/index.ts'
import type { MarkLess } from '../../src/static-el-base.ts'
import { toRa } from './helpers.ts'

// Helper
export const compuSig = <R>(fn: () => R) => {
  return toRa(computed(fn))[0]
}

const SimplyReactive = () =>
  component((): MarkLess => {
    // counter is a signal, wrapped in a reactive adapter. counterSig is the raw signal.
    const counterSignal = signal(0)
    const [counter, counterSig] = toRa(counterSignal)

    const isSmiling$ = new BehaviorSubject<boolean>(false)
    const isSmilingClass$ = isSmiling$.pipe(
      map((val) => (val ? 'smiling' : null)),
    )
    const smilingList$ = isSmiling$
      .asObservable()
      .pipe(
        map((isSmiling) =>
          isSmiling ? ['😊', '😄', '😁'] : ['🤔', '🤨', '🧐'],
        ),
      )
    // isSmiling is a reactive adapter around the RxJS observable.
    const [isSmilingList] = toRa(smilingList$)
    const [isSmilingClass] = toRa(isSmilingClass$)

    const toggleSmile = () => {
      isSmiling$.next(!isSmiling$.value)
      counterSig.value += 1
    }

    // biome-ignore format: custom layout needed
    return [
      h1._('Simple Reactive Control Example'),
      h2._('This example shows a basic reactive control setup.'),

      p
      ._ (`We can use whatever reactive library we want.
        As long as we wrap it in a compatible reactive adapter.`),

      button._('Smile')
        .event('click', toggleSmile),

      ul
        .class('emoji-ul', isSmilingClass, 'other-static-class')
        ._(
          _EACH(isSmilingList)
          .DO((entry) => li._(entry))
        ),

      p._(['Button clicked ', span._(counter), ' times.']),
      // OR
      p._(compuSig(() => `Button clicked ${counterSig.value} times.`)),
    ]
  })

renderToDom(document.body, SimplyReactive())
