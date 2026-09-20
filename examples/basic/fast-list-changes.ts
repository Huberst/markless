import { computed, effect, type Signal, signal } from '@preact/signals-core'
import { random, range } from 'lodash'
import { renderToDom } from '../../src/dom-renderer/dom-renderer.ts'
import { _EACH, button, component, div } from '../../src/index.ts'
import { toRa } from './helpers.ts'

const makeRandomList = () => {
  const randRange = range(5, random(6, 20))
  const randNumbers = randRange.map(() => random(1, 100))
  return randNumbers
}

const makeQuickList = (control: Signal<number>) => {
  return computed(() => {
    control.value
    return makeRandomList()
  })
}

const MainComp = () =>
  component(() => {
    //
    const advance = () => {
      control.value = Date.now()
    }

    const running = signal(false)

    // Handle auto-advance when running is true.
    let stopper: (() => void) | null = null
    effect(() => {
      if (running.value && stopper === null) {
        const intervalId = setInterval(() => {
          advance()
        }, 80)
        stopper = () => clearInterval(intervalId)
      }
      if (!running.value && stopper) {
        stopper()
        stopper = null
      }
    })

    const start = () => {
      running.value = true
    }
    const stop = () => {
      running.value = false
    }
    const manual = () => {
      advance()
    }

    const control = signal(0)

    const [list1] = toRa(makeQuickList(control))
    const [list2] = toRa(makeQuickList(control))
    const [list3] = toRa(makeQuickList(control))

    // biome-ignore format: custom layout needed
    return [
      div
        .class('actions')
        ._([
          button._('start').event('click', start),
          button._('stop').event('click', stop),
          button._('manual').event('click', manual),
        ]),

      div
        .class('lists')._([
          div._(
            _EACH(list1).DO((item) => div._(`List1 Item: ${item}`)),
          ),
          div._(
            _EACH(list2).DO((item) => div._([
              `List2 Item: ${item}`,
              _EACH(list3).DO((nestedItem) => div._(`-- Nested Item: ${nestedItem}`))
            ])),
          ),
          div._(
            _EACH(list3).DO((item) => div._(`List3 Item: ${item}`)),
          ),
        ]),
    ]
  })

renderToDom(document.body, MainComp())
