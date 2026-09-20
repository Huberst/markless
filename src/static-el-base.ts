import type { IReactiveAdapter, TReactive } from './reactive-adapters.ts'

export interface IRenderCtx {
  render(toRender: MarkLess, name?: string): IElementEntity
  onCleanup(fn: () => void): void
}

export type ExtendedHtmlElementTagNameMap = HTMLElementTagNameMap & {
  text: Text
  comment: Comment
}

export type TElementTagName =
  | keyof ExtendedHtmlElementTagNameMap
  | keyof SVGElementTagNameMap

type TRenderFn = (renderCtx: IRenderCtx) => MarkLess

type TOptionalArray<T> = T | T[]

type TBasicRenderable = string | number | ElDescription<any>

export type TCanBeRendered = TOptionalArray<
  | TBasicRenderable
  | TRenderFn
  | IReactiveAdapter<string | number | null | undefined>
>
export type MarkLess = TOptionalArray<TCanBeRendered>

export interface IElementEntity {
  appendTo(parent: IElementEntity): void
  placeAfterSelf(targetElEntity: IElementEntity): void
  remove: () => void
}

export type TReactiveClassListEntry = IReactiveAdapter<
  string | null | undefined
>

type TRenderLifecycleFn = (elE: IElementEntity, rCtx: IRenderCtx) => void

/**
 * El Description Class.
 * Used to store everything that got passed to an StaticElWrapperBase extending class.
 * Passed attributes, css classes, nested elements.
 * Just store stuff. Keep Logic to a minimum.
 */
export class ElDescription<
  ConHTMLElType extends HTMLElement | unknown = unknown,
> {
  public lc = {
    onMount: new Set<TRenderLifecycleFn>(),
    onRemove: new Set<TRenderLifecycleFn>(),
    setRef: new Set<(ref: ConHTMLElType) => void>(),
  }

  public ref = {} as ConHTMLElType

  public elName: TElementTagName

  public namespace?: string

  public eventHandlers = new Map<string, (event: any) => void>()

  public attributes = new Map<
    keyof ConHTMLElType,
    string | TReactive | undefined
  >()

  public classes: (TReactiveClassListEntry | string)[] = []

  public nested: TCanBeRendered[] = []

  constructor(elName: TElementTagName, namespace?: string) {
    this.elName = elName
    this.namespace = namespace
  }

  public _(stuffToNest: MarkLess): typeof this
  public _(...stuffToNest: TCanBeRendered[]): typeof this
  public _(
    first?: MarkLess | TCanBeRendered,
    ...rest: TCanBeRendered[]
  ): typeof this {
    if (rest.length > 0) {
      this.nested = [first as TCanBeRendered, ...rest]
    } else if (first !== undefined) {
      this.nested = Array.isArray(first)
        ? (first as TCanBeRendered[])
        : [first as TCanBeRendered]
    }
    return this
  }

  public event<
    EK extends keyof GlobalEventHandlersEventMap,
    EV extends
      GlobalEventHandlersEventMap[EK] = GlobalEventHandlersEventMap[EK],
  >(
    eName: EK,
    cb: (
      e: EV & {
        readonly target: ConHTMLElType extends HTMLElement
          ? ConHTMLElType
          : EventTarget | null
      },
    ) => void,
  ) {
    this.eventHandlers.set(eName, cb as (e: EV) => void)
    return this
  }

  public attr(key: keyof ConHTMLElType, value?: string | TReactive) {
    this.attributes.set(key, value)
    return this
  }

  public attrSet(
    attributes: Partial<Record<keyof ConHTMLElType, string | TReactive>>,
  ) {
    for (const [key, value] of Object.entries(attributes) as [
      keyof ConHTMLElType,
      string | TReactive,
    ][]) {
      this.attr(key, value)
    }
    return this
  }

  public dataAttr(key: string, value?: string | TReactive) {
    return this.attr(`data-${key}` as keyof ConHTMLElType, value)
  }

  public setRef(setRefCb: (ref: ConHTMLElType) => void) {
    this.lc.setRef.add(setRefCb)
    return this
  }

  public class(args: TClassListEntry[]): typeof this
  public class(...args: TClassListEntry[]): typeof this
  public class(...args: TClassListEntry[] | [TClassListEntry[]]) {
    if (args.length === 1 && Array.isArray(args[0])) {
      this.class(...(args[0] as TClassListEntry[]))
    } else {
      this.classes.push(...(args as TClassListEntry[]))
    }
    return this
  }

  public afterMount(fn: TRenderLifecycleFn) {
    this.lc.onMount.add(fn)
    return this
  }

  public onRemove(fn: TRenderLifecycleFn) {
    this.lc.onRemove.add(fn)
    return this
  }
}

export type TClassListEntry =
  | IReactiveAdapter<string | null | undefined>
  | string
