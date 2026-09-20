import { computed, signal } from '@preact/signals-core'
import {
  _IF,
  button,
  component,
  dialog,
  div,
  h1,
  h2,
  type MarkLess,
  p,
  renderToDom,
} from '../../src/index.ts'
import { toRa } from './helpers.ts'

const SomethingWithCleanup = () =>
  component((rCtx): MarkLess => {
    console.log('SomethingWithCleanup mounted')

    rCtx.onCleanup(() => {
      console.log('SomethingWithCleanup is being cleaned up!')
    })

    return div._('just a div')
  })

const [showDialogComp, showDialogCompSig] = toRa(signal(true))
const [isOpen, isOpenSig] = toRa(signal(true))
const [status, statusSig] = toRa(signal('mounted'))
const [closeBtnClass] = toRa(
  computed(() => (isOpenSig.value ? 'open' : 'closed')),
)

const DialogWrapper = component((rCtx) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      isOpenSig.value = false
    }
  }

  document.addEventListener('keydown', onKeyDown)
  document.body.classList.add('with-document-keydown-listener')
  statusSig.value = 'mounted: keydown listener active, body class applied'

  rCtx.onCleanup(() => {
    document.removeEventListener('keydown', onKeyDown)
    document.body.classList.remove('with-document-keydown-listener')
    statusSig.value = 'unmounted: keydown listener removed, body class cleared'
    console.log('cleanup dialog example: listener removed, body class cleared')
  })

  return dialog.attr('open', isOpen)._([
    h2._('Dialog owned by a component'),
    SomethingWithCleanup(),
    p._(
      'This subtree owns a document listener and a body class through rCtx.onCleanup(...).',
    ),
    p._(
      'Unmount this subtree with the button above, then inspect document.body.classList or press Escape again.',
    ),
    button
      .class('toggle-dialog-btn', closeBtnClass)
      ._('Close dialog')
      .event('click', () => {
        isOpenSig.value = false
      }),
  ])
})

const CleanupDemo = () =>
  component((): MarkLess => {
    // biome-ignore format: custom layout
    return [
      h1._('Component cleanup demo'),
      p._(
        `This component registers a document keydown listener and adds a class to document.body. Unmount
        the dialog subtree below to trigger rCtx.onCleanup(...).`,
      ),
      p._(['Component status: ', status]),
      div.class('actions')._([
        button._('Toggle dialog subtree mount').event('click', () => {
          showDialogCompSig.value = !showDialogCompSig.value
        }),
        button
          .class('toggle-dialog-btn', closeBtnClass)
          ._('Toggle dialog open attribute')
          .event('click', () => {
            isOpenSig.value = !isOpenSig.value
          }),
      ]),
      p._(
        `Press Escape while the subtree is mounted to close the dialog via the document listener.
        After unmount, Escape should do nothing and the body class should be gone.`,
      ),
      _IF(showDialogComp)
        .THEN(DialogWrapper)
        .ELSE(
          div
          .class('comp-with-slots')
          ._([
            h2._('Dialog subtree unmounted'),
            p._(
              'The component cleanup should already have removed the document listener and the with-document-keydown-listener body class.',
            ),
          ]),
        ),
    ]
  })

renderToDom(document.body, CleanupDemo)
