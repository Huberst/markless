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

  public placeAfter(toPlaceAfter: Element | Comment): void {
    if (this.mounted) {
      throw new Error('ComponentRenderer already mounted, cannot placeAfter')
    }
    this.nested.forEach((n) => n.mountTo(this._frag))
    toPlaceAfter.after(this._frag)
  }
}
