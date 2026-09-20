import type { ElDescription, IRenderCtx } from '../static-el-base.ts'
import { DomElementEntity, type IRenderer } from './dom-renderer.ts'
import { SubscriptionManager } from './sub-manager.ts'

export class CommentRenderer extends SubscriptionManager implements IRenderer {
  #comment: Comment = new Comment()
  #renderCtx?: IRenderCtx

  public domElEntity = new DomElementEntity(this)

  constructor(private elD: ElDescription<Comment>) {
    super()
  }

  get el() {
    return this.#comment
  }

  get renderCtx() {
    if (!this.#renderCtx) throw new Error('No render context')
    return this.#renderCtx
  }

  remove() {
    this.unSubAll()
    this.elD.lc.onRemove.forEach((fn) => fn(this.domElEntity, this.renderCtx))
    this.#comment.remove()
  }

  create(renderCtx: IRenderCtx) {
    this.#renderCtx = renderCtx
    const commentText = this.elD.attributes.get('data')
    this.#comment.data =
      typeof commentText === 'string' ? ` ${commentText} ` : ' '
  }

  mountTo(toParent?: Element | DocumentFragment) {
    if (toParent) {
      toParent.append(this.#comment)
      // Call all onMount callbacks
      this.elD.lc.onMount.forEach((fn) => fn(this.domElEntity, this.renderCtx))
    }
  }
}
