import { input } from '../../generated/__generated-static-elements.ts'
import type { IReactiveAdapter } from '../reactive-adapters.ts'
import { DomRenderCtx } from './dom-renderer.ts'
import { ElementRenderer } from './element-renderer.ts'

Deno.test('reactive styles clear removed declarations and unsubscribe', () => {
  const customProperties = new Map<string, string>()
  const style = {
    color: '',
    backgroundColor: '',
    setProperty(key: string, value: string) {
      customProperties.set(key, value)
    },
    removeProperty(key: string) {
      customProperties.delete(key)
    },
  }
  const currentStyle = () => ({ color: style.color, backgroundColor: style.backgroundColor })
  const el = {
    style,
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    remove() {},
  }
  const originalDocument = globalThis.document
  globalThis.document = { createElement: () => el } as unknown as Document

  let emit: ((value: { color?: string; backgroundColor?: string; '--accent'?: string }) => void) | undefined
  let unsubscribed = false
  const reactiveStyle: IReactiveAdapter<{
    color?: string
    backgroundColor?: string
    '--accent'?: string
  }> = {
    subscribe(fn) {
      emit = fn
      fn({ color: 'red', '--accent': 'gold' })
      return { unsubscribe: () => { unsubscribed = true } }
    },
  }

  try {
    const renderer = new ElementRenderer(input.style(reactiveStyle))
    renderer.create(new DomRenderCtx())
    if (currentStyle().color !== 'red' || customProperties.get('--accent') !== 'gold') {
      throw new Error('initial styles not set')
    }

    emit?.({ backgroundColor: 'blue' })
    if (currentStyle().color !== '' || currentStyle().backgroundColor !== 'blue' || customProperties.has('--accent')) {
      throw new Error('removed styles not cleared')
    }

    emit?.({})
    if (currentStyle().backgroundColor !== '') throw new Error('last style not cleared')

    renderer.remove()
    if (!unsubscribed) throw new Error('style subscription not cleaned up')
  } finally {
    globalThis.document = originalDocument
  }
})
