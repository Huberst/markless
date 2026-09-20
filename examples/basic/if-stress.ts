import { computed, signal } from '@preact/signals-core'
import {
  _EACH,
  _IF,
  button,
  component,
  div,
  h1,
  p,
  renderToDom,
} from '../../src/index.ts'
import { toRa } from './helpers.ts'

const [show, showSig] = toRa(signal(true))
const [tick, tickSig] = toRa(signal(0))

setInterval(() => {
  tickSig.value++
}, 40)

const toggle = () => {
  showSig.value = !showSig.value
}

const Main = () =>
  component(() => {
    const [label] = toRa(computed(() => (showSig.value ? 'hide' : 'show')))

    const [list] = toRa(
      computed(() => {
        // churn list so nested subscriptions are exercised
        tickSig.value
        return Array.from({ length: (tickSig.value % 10) + 1 }, (_, i) => i)
      }),
    )

    // biome-ignore format: custom layout needed
    return [
      h1._('_IF demo'),
      p._([
        'Toggles a whole subtree using _IF. ',
        'This should unsubscribe + remove child nodes when hidden.',
      ]),
      button._(label).event('click', toggle),

      _IF(show)
        .THEN(() =>
          div
            .class('box')
            ._([
              'tick: ', tick,
              div._(
                _EACH(list)
                  .DO((i) => div._(`row ${i}`))),
            ]),
          )
          .ELSE(() => div.class('box')._('hidden'))
    ]
  })

renderToDom(document.body, Main())
