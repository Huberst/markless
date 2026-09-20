import type { TReactive } from './reactive-adapters.ts'
import {
  ElDescription,
  type ExtendedHtmlElementTagNameMap,
  type MarkLess,
  type TCanBeRendered,
  type TClassListEntry,
} from './static-el-base.ts'

type THtmlTagName = keyof ExtendedHtmlElementTagNameMap

type THtmlElForTag<Tag extends THtmlTagName> =
  ExtendedHtmlElementTagNameMap[Tag]

export function defineStaticElementTag<Tag extends THtmlTagName, FT>(
  tagName: Tag,
  _fixType?: FT,
) {
  type ElT = FT extends unknown ? THtmlElForTag<Tag> : FT

  return class StaticHtmlTag {
    static readonly elName = tagName

    static get inst() {
      return new ElDescription<ElT>(tagName)
    }

    static _(nested: MarkLess): ElDescription<ElT>
    static _(...nested: TCanBeRendered[]): ElDescription<ElT>
    static _(first?: MarkLess | TCanBeRendered, ...rest: TCanBeRendered[]) {
      if (rest.length > 0) return this.inst._(first as TCanBeRendered, ...rest)
      return this.inst._(first as MarkLess)
    }

    static class(args: TClassListEntry[]): ElDescription<ElT>
    static class(...args: TClassListEntry[]): ElDescription<ElT>
    static class(...args: TClassListEntry[] | [TClassListEntry[]]) {
      if (args.length === 1 && Array.isArray(args[0])) {
        return this.inst.class(...args[0])
      }
      return this.inst.class(...(args as TClassListEntry[]))
    }

    static setRef(setRefCb: (ref: ElT) => void) {
      return this.inst.setRef(setRefCb)
    }

    static attr(key: keyof ElT, value?: string | TReactive) {
      return this.inst.attr(key, value)
    }

    static attrSet(attributes: Partial<Record<keyof ElT, string | TReactive>>) {
      let elDesc = this.inst
      for (const [key, value] of Object.entries(attributes) as [
        keyof ElT,
        string | TReactive,
      ][]) {
        elDesc = elDesc.attr(key, value)
      }
      return elDesc
    }

    static afterMount(fn: Parameters<ElDescription<ElT>['afterMount']>[0]) {
      return this.inst.afterMount(fn)
    }

    static onRemove(fn: Parameters<ElDescription<ElT>['onRemove']>[0]) {
      return this.inst.onRemove(fn)
    }

    static event<
      EK extends keyof GlobalEventHandlersEventMap,
      EV extends
        GlobalEventHandlersEventMap[EK] = GlobalEventHandlersEventMap[EK],
    >(
      eName: EK,
      cb: (
        e: EV & {
          readonly target: ElT extends HTMLElement ? ElT : EventTarget | null
        },
      ) => void,
    ) {
      return this.inst.event(eName, cb)
    }
  }
}

export class comment extends defineStaticElementTag('comment', Comment) {}
export class text extends defineStaticElementTag('text', Text) {}
