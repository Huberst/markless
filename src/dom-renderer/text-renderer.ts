import type { IReactiveAdapter } from '../reactive-adapters.ts'
import type { DomRenderCtx, IRenderer } from './dom-renderer.ts'
import { SubscriptionManager } from './sub-manager.ts'

/**
 * Simple renderer for static strings.
 */
export class TextRenderer extends SubscriptionManager implements IRenderer {
  #text: Text = new Text()

  constructor(
    private passedText:
      | string
      | number
      | IReactiveAdapter<string | number | null | undefined>,
  ) {
    super()
  }

  remove() {
    this.unSubAll()
    this.#text.remove()
  }

  create(_renderCtx: DomRenderCtx) {
    if (
      typeof this.passedText === 'string' ||
      typeof this.passedText === 'number'
    ) {
      this.#text.data = this.passedText.toString()
    } else {
      this.#text.data = ''
      const unSub = this.passedText.subscribe((newStr) => {
        this.#text.data = newStr ? newStr.toString() : ''
      })
      this.addUnSubCb(() => unSub.unsubscribe())
    }
  }

  mountTo(toParent?: Element | DocumentFragment) {
    if (toParent) {
      toParent.append(this.#text)
    }
  }
}
