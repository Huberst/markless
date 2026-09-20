import { computed, signal } from '@preact/signals-core'
import {
  button,
  component,
  dialog,
  div,
  h1,
  h2,
  type MarkLess,
  p,
  pre,
  renderToDom,
} from '../../src/index.ts'
import { toRa } from './helpers.ts'

const compWithSlots = ({ head, body }: { head: MarkLess; body: MarkLess }) =>
  component((): MarkLess => {
    // biome-ignore format: custom layout needed
    return [
      div.class("comp-with-slots")._([
        div.class('comp-head')._(head),
        div.class('comp-body')._(body),
      ]),
    ]
  })

const Main = () =>
  component((): MarkLess => {
    const [isOpen, isOpenSig] = toRa(signal(false))
    const [btnClass] = toRa(
      computed(() => (isOpenSig.value ? 'open' : 'closed')),
    )

    // biome-ignore format: custom layout needed
    return [
      h1._('Using Slots Demo'),

      pre._(
        `
    asd
        asd`),

      button
        .class('toggle-dialog-btn', btnClass)
        ._('Click me to toggle dialog open/close')
        .event('click', () => { isOpenSig.value = !isOpenSig.value }),

      dialog._([
        h2._('Hello from the dialog!'),
        p._(
          `This dialog is toggled by the button above. It uses the native <dialog> element, but you could use any element as a dialog.
           The markless component compWithSlots is used to demonstrate how you can pass in different content for different slots (head and body in this case).`),
        button._('Close').event('click', () => { isOpenSig.value = false }),
      ])
        .attr('open', isOpen),

      compWithSlots({
        head: h2._('This is the head slot content'),
        body: [
          'This is the body slot content. ',
          'It can be more complex and contain multiple elements.',
        ],
      }),
    ]
  })

renderToDom(document.body, Main())
