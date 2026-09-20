import type { IElementEntity, IRenderCtx, MarkLess } from '../static-el-base.ts'
import type { CommentRenderer } from './comment-renderer.ts'
import { ComponentRenderer } from './component-renderer.ts'
import type { ElementRenderer } from './element-renderer.ts'

export class DomElementEntity implements IElementEntity {
  constructor(
    private owner: ElementRenderer | ComponentRenderer | CommentRenderer,
  ) {}

  appendTo(_parent: IElementEntity): void {}

  placeAfterSelf(passedElEntity: DomElementEntity): void {
    if (
      passedElEntity.owner instanceof ComponentRenderer &&
      !(this.owner instanceof ComponentRenderer)
    ) {
      passedElEntity.owner.placeAfter(this.owner.el)
    }
  }
  remove() {
    this.owner.remove()
  }
}

export interface IRenderer {
  create(renderCtx: IRenderCtx): void
  mountTo(toParent?: Element | DocumentFragment): void
  remove: () => void
}

export type TDomMountHandle = {
  remove(): void
}

export class DomRenderCtx implements IRenderCtx {
  private activeComponent: ComponentRenderer | null = null

  withActiveComponent<T>(component: ComponentRenderer, fn: () => T): T {
    const prevComponent = this.activeComponent
    this.activeComponent = component

    try {
      return fn()
    } finally {
      this.activeComponent = prevComponent
    }
  }

  onCleanup(fn: () => void): void {
    if (!this.activeComponent) {
      throw new Error('onCleanup() must be called while rendering a component')
    }
    this.activeComponent.addCleanup(fn)
  }

  render(toRender: MarkLess, name?: string) {
    const root = new ComponentRenderer(`DomRenderCtx render ${name ?? '--'}`)
    root.setTmpl(toRender)
    root.create(this)
    return root.domElEntity
  }
}

export const renderToDom = (
  node: HTMLElement,
  toRender: MarkLess,
): TDomMountHandle => {
  const rCtx = new DomRenderCtx()
  const root = new ComponentRenderer('renderToDom')
  root.setTmpl(toRender)
  root.create(rCtx)
  root.mountTo(node)

  return {
    remove: () => root.remove(),
  }
}
