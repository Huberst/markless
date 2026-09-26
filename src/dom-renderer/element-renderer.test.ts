import { input } from '../../generated/__generated-static-elements.ts'
import type { IReactiveAdapter } from '../reactive-adapters.ts'
import { DomRenderCtx } from './dom-renderer.ts'
import { ElementRenderer } from './element-renderer.ts'

Deno.test('properties are assigned and reactively updated without setting attributes', () => {
  const attributes = new Map<string, string>()
  const el = {
    value: '',
    checked: false,
    setAttribute(key: string, value: string) {
      attributes.set(key, value)
    },
    removeAttribute(key: string) {
      attributes.delete(key)
    },
    addEventListener() {},
    remove() {},
  }
  const originalDocument = globalThis.document
  globalThis.document = {
    createElement: () => el,
  } as unknown as Document

  let emit: ((value: string) => void) | undefined
  let unsubscribed = false
  const reactiveValue: IReactiveAdapter<string> = {
    subscribe(fn) {
      emit = fn
      fn('first')
      return { unsubscribe: () => { unsubscribed = true } }
    },
  }

  try {
    const description = input
      .attr('placeholder', 'Type here')
      .propSet({ checked: true })
      .prop('value', reactiveValue)
    const renderer = new ElementRenderer(description)
    renderer.create(new DomRenderCtx())

    if (el.value !== 'first' || !el.checked) throw new Error('properties not set')
    if (attributes.get('placeholder') !== 'Type here') {
      throw new Error('attribute not set')
    }
    if (attributes.has('value') || attributes.has('checked')) {
      throw new Error('properties were written as attributes')
    }

    emit?.('second')
    const currentValue = () => el.value
    if (currentValue() !== 'second') throw new Error('reactive property not updated')

    renderer.remove()
    if (!unsubscribed) throw new Error('property subscription not cleaned up')
  } finally {
    globalThis.document = originalDocument
  }
})
