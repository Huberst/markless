import { isReactiveAdapter } from '../reactive-adapters.ts'
import type { ElDescription, IRenderCtx } from '../static-el-base.ts'
import {
  DomElementEntity,
  type DomRenderCtx,
  type IRenderer,
} from './dom-renderer.ts'
import { parse } from './parser.ts'
import { SubscriptionManager } from './sub-manager.ts'

/**
 * ElRenderer class receives an element description on instantiation.
 * It creates and holds the DOM element according to the properties found on
 * the element description.
 */
export class ElementRenderer extends SubscriptionManager implements IRenderer {
  //

  #el?: Element
  #renderCtx?: IRenderCtx

  nested: IRenderer[] = []

  private domElEntity = new DomElementEntity(this)

  constructor(private elD: ElDescription) {
    super()
  }

  get el() {
    if (!this.#el) throw new Error('No el yet')
    return this.#el
  }

  get renderCtx() {
    if (!this.#renderCtx) throw new Error('No render context')
    return this.#renderCtx
  }

  remove() {
    this.unSubAll()
    this.elD.lc.onRemove.forEach((fn) => fn(this.domElEntity, this.renderCtx))
    this.nested.forEach((n) => n.remove())
    this.el.remove()
  }

  create(renderCtx: DomRenderCtx) {
    this.#el = this.elD.namespace
      ? globalThis.document.createElementNS(this.elD.namespace, this.elD.elName)
      : globalThis.document.createElement(this.elD.elName)
    this.#renderCtx = renderCtx
    this.nested = parse(this.elD.nested, renderCtx)

    this.setupEventHandlers()
    this.setupClasses()
    this.setupAttributes()

    this.elD.lc.setRef.forEach((setRefCb) => {
      setRefCb(this.el)
    })
  }

  private setupEventHandlers() {
    this.elD.eventHandlers.forEach((handler, key) => {
      this.el.addEventListener(key, handler as () => void)
    })
  }

  private currentClassList: (string | null | undefined)[] = []

  private setupClasses() {
    // continue with classes
    this.elD.classes.forEach((cls, index) => {
      if (isReactiveAdapter(cls)) {
        const unSub = cls.subscribe((nextVal) => {
          this.currentClassList[index] = nextVal
          this.patchClassList()
        })
        this.addUnSubCb(() => unSub.unsubscribe())
      } else {
        this.currentClassList.push(cls)
      }
    })

    this.patchClassList()
  }

  private patchClassList() {
    const classes = this.currentClassList
      .filter((cls) => cls != null && cls !== '' && cls !== undefined)
      .join(' ')
    if (classes) {
      this.el.setAttribute('class', classes)
    } else {
      this.el.removeAttribute('class')
    }
  }

  private setupAttributes() {
    this.elD.attributes.forEach((attr, key) => {
      if (isReactiveAdapter(attr)) {
        const unSub = attr.subscribe((nextVal) => {
          if (typeof nextVal === 'boolean') {
            if (nextVal) {
              this.el.setAttribute(key, '')
            } else {
              this.el.removeAttribute(key)
            }
            return
          }
          this.el.setAttribute(key, nextVal.toString())
        })
        this.addUnSubCb(() => unSub.unsubscribe())
      } else {
        // Static attribute without value (e.g. hidden)
        this.el.setAttribute(key, attr || '')
      }
    })
  }

  mountTo(toParent?: Element | DocumentFragment) {
    this.nested.forEach((n) => {
      n.mountTo(this.el)
    })

    if (toParent) {
      toParent.append(this.el)
      // Call all onMount callbacks
      this.elD.lc.onMount.forEach((fn) => fn(this.domElEntity, this.renderCtx))
    }
  }
}
