import {
  button,
  component,
  dialog,
  h1,
  type MarkLess,
  p,
  renderToDom,
} from '../../src/index.ts'

const Main = () =>
  component((): MarkLess => {
    // Ref will be set once the element is created.
    let myDialogRef: HTMLDialogElement | null = null

    // Toggle function can make use of the ref.
    const toggle = () => {
      if (myDialogRef) {
        myDialogRef.open = !myDialogRef.open
        console.log('Dialog ref:', myDialogRef)
      }
    }

    // biome-ignore format: custom layout needed
    return [
      h1._('Using Ref Demo'),

      button
        ._('Click me to toggle dialog open/close')
        .class('toggle-dialog-btn')
        .event('click', toggle),

      dialog
        ._(p._('This is a paragraph inside the dialog.'))
        .setRef((ref) => { myDialogRef = ref }), // <<<<<<< Set Ref Example
    ]
  })

renderToDom(document.body, Main())
