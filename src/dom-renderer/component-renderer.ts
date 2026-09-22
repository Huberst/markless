import type { MarkLess, TCanBeRendered } from '../static-el-base.ts'
import {
  DomElementEntity,
  type DomRenderCtx,
  type IRenderer,
} from './dom-renderer.ts'
import { parse } from './parser.ts'

export class ComponentRenderer implements IRenderer {
  private mounted = false
  private cleanupFns = new Set<() => void>()

  constructor(public name = 'NO-NAME') {}

  _frag: DocumentFragment = new DocumentFragment()
  _tmplArr: TCanBeRendered[] = []

  nested: IRenderer[] = []

  public domElEntity = new DomElementEntity(this)

  addCleanup(fn: () => void) {
    this.cleanupFns.add(fn)
  }

  remove() {
    const cleanupErrors: unknown[] = []

    this.cleanupFns.forEach((fn) => {
      try {
        fn()
      } catch (e) {
        cleanupErrors.push(e)
      }
    })
    this.cleanupFns.clear()

    this.nested.forEach((n) => n.remove())

    if (cleanupErrors.length > 0) {
      console.error('Component cleanup failed', cleanupErrors)
    }
  }

  public setTmpl(tmpl: MarkLess) {
    this._tmplArr = Array.isArray(tmpl) ? tmpl : [tmpl]
  }

  public create(renderCtx: DomRenderCtx) {
    this.nested = renderCtx.withActiveComponent(this, () =>
      parse(this._tmplArr, renderCtx),
    )
  }

  public mountTo(toParent?: Element | DocumentFragment) {
    this.nested.forEach((n) => n.mountTo(this._frag))
    if (toParent) {
      toParent.append(this._frag)
      this.mounted = true
    }
  }

  /**
   * Places this component's node(s) right after `anchor` on first call.
   * On later calls it repositions the existing (already-mounted) nodes
   * instead of recreating them, preserving DOM identity (focus, selection, state).
   */
  public moveAfter(anchor: ChildNode): ChildNode {
    if (!this.mounted) {
      this.nested.forEach((n) => n.mountTo(this._frag))
      const nodes = Array.from(this._frag.childNodes) as ChildNode[]
      anchor.after(this._frag)
      this.mounted = true
      return nodes.length > 0 ? nodes[nodes.length - 1] : anchor
    }

    let currentAnchor = anchor
    this.nested.forEach((n) => {
      currentAnchor = n.moveAfter(currentAnchor)
    })
    return currentAnchor
  }
}
