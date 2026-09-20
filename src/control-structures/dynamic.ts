import { comment } from '../define-tag.ts'
import { SubscriptionManager } from '../dom-renderer/sub-manager.ts'
import type { IReactiveAdapter } from '../reactive-adapters.ts'
import type { IElementEntity, IRenderCtx, MarkLess } from '../static-el-base.ts'

/**
 * Creates a dynamic element that can be used in templates.
 * It takes a reactive source that emits a function returning a markless template.
 */
export const _DYNAMIC = (
  source: IReactiveAdapter<() => MarkLess>,
  _name = '_DYN',
) => {
  const subManager = new SubscriptionManager()

  let anchorEntity: IElementEntity
  let rCtx: IRenderCtx

  let currentEntity: IElementEntity | null = null
  let lastFn: (() => MarkLess) | null = null

  const render = (fn: () => MarkLess) => {
    if (lastFn === fn) return
    lastFn = fn
    currentEntity?.remove()
    currentEntity = rCtx.render(fn(), _name)
    anchorEntity.placeAfterSelf(currentEntity)
  }

  return comment
    .attr('data', _name)
    .afterMount((elEnt, passedRCtx) => {
      anchorEntity = elEnt
      rCtx = passedRCtx
      const sub = source.subscribe(render)
      subManager.addUnSubCb(() => sub.unsubscribe())
    })
    .onRemove(() => {
      subManager.unSubAll()
      currentEntity?.remove()
      currentEntity = null
      lastFn = null
    })
}
