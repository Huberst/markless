import { computed, signal } from '@preact/signals-core'
import { ComponentRenderer } from '../../src/dom-renderer/component-renderer.ts'
import { DomRenderCtx } from '../../src/dom-renderer/dom-renderer.ts'
import { _EACH, component, div, h1, p } from '../../src/index.ts'
import type { IReactiveAdapter } from '../../src/reactive-adapters.ts'
import { toRa } from './helpers.ts'

type TSubStats = {
  active: number
  totalSubscribes: number
  totalUnsubscribes: number
}

const makeStats = (): TSubStats => ({
  active: 0,
  totalSubscribes: 0,
  totalUnsubscribes: 0,
})

const trackedAdapter = <T>(
  stats: TSubStats,
  inner: IReactiveAdapter<T>,
): IReactiveAdapter<T> => {
  return {
    subscribe: (fn) => {
      stats.totalSubscribes++
      stats.active++
      const sub = inner.subscribe(fn)
      return {
        unsubscribe: () => {
          stats.totalUnsubscribes++
          stats.active--
          sub.unsubscribe()
        },
      }
    },
  }
}

const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const makeUniqueList = (seed: number, minLen: number, maxLen: number) => {
  const len = randInt(minLen, maxLen)
  const arr = Array.from({ length: len }, (_, i) => `id_${seed}_${i}`)

  // Add a bit of churn: sometimes delete a few items from the middle.
  if (arr.length > 4 && seed % 3 === 0) {
    arr.splice(randInt(1, Math.min(5, arr.length - 2)), randInt(1, 3))
  }
  return arr
}

// Global “reactivity source”: keeps updating even while the view is unmounted.
// If unsubs are wrong, these updates will keep a growing number of callbacks alive.
const tick = signal(0)
const outerListSig = signal<string[]>([])
const nestedListSig = signal<string[]>([])

setInterval(() => {
  tick.value++
  outerListSig.value = makeUniqueList(tick.value, 5, 20)
  nestedListSig.value = makeUniqueList(tick.value, 2, 8)
}, 40)

// Subscription accounting
const outerEachSubs = makeStats()
const nestedEachSubs = makeStats()
const textSubs = makeStats()
const attrSubs = makeStats()

const outerEach = trackedAdapter(outerEachSubs, toRa(outerListSig)[0])
const nestedEach = trackedAdapter(nestedEachSubs, toRa(nestedListSig)[0])
const reactiveText = trackedAdapter(
  textSubs,
  toRa(computed(() => `tick=${tick.value}`))[0],
)
const reactiveAttr = trackedAdapter(
  attrSubs,
  toRa(computed(() => `data-tick-${tick.value}`))[0],
)

const StressView = () =>
  component(() => {
    return [
      h1._('Mount/Unmount Stress Test'),
      p._([
        'This mounts/unmounts a view that uses _EACH + reactive text/attr. ',
        'If cleanup is correct, active subscription counts should go back to 0 after unmount.',
      ]),
      div
        .class('box')
        .dataAttr('tick', reactiveAttr)
        ._([
          'Reactive text: ',
          reactiveText,
          div._(
            _EACH(outerEach).DO((id) =>
              div
                .class('row')
                ._([
                  `item ${id}`,
                  div
                    .class('nested')
                    ._(_EACH(nestedEach).DO((nid) => ` • ${nid}`)),
                ]),
            ),
          ),
        ]),
    ]
  })

let currentRoot: ComponentRenderer | null = null
let currentCtx: DomRenderCtx | null = null

const host = document.createElement('div')
const controls = document.createElement('div')
const status = document.createElement('pre')

controls.style.display = 'flex'
controls.style.gap = '8px'
controls.style.marginBottom = '12px'

const btnMount = document.createElement('button')
btnMount.textContent = 'mount'
const btnUnmount = document.createElement('button')
btnUnmount.textContent = 'unmount'
const btnCycle10 = document.createElement('button')
btnCycle10.textContent = 'cycle x10'
const btnCycle100 = document.createElement('button')
btnCycle100.textContent = 'cycle x100'

controls.append(btnMount, btnUnmount, btnCycle10, btnCycle100)

document.body.append(controls, status, host)

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const mount = () => {
  if (currentRoot) return
  currentCtx = new DomRenderCtx()
  currentRoot = new ComponentRenderer('stress-root')
  currentRoot.setTmpl(StressView())
  currentRoot.create(currentCtx)
  currentRoot.mountTo(host)
}

const unmount = () => {
  if (!currentRoot) return
  currentRoot.remove()
  currentRoot = null
  currentCtx = null

  // Extra safety: ensure host is empty even if a renderer forgets to remove a node.
  host.replaceChildren()
}

const cycle = async (n: number) => {
  for (let i = 0; i < n; i++) {
    mount()
    await wait(30)
    unmount()
    await wait(5)
  }
}

btnMount.onclick = () => mount()
btnUnmount.onclick = () => unmount()
btnCycle10.onclick = () => void cycle(10)
btnCycle100.onclick = () => void cycle(100)

const fmtMem = () => {
  // Chrome-only; will show "n/a" elsewhere.
  type PerformanceMemory = { usedJSHeapSize: number }
  type PerformanceWithMemory = Performance & { memory?: PerformanceMemory }
  const perf = performance as PerformanceWithMemory
  const used = perf.memory?.usedJSHeapSize
  if (typeof used !== 'number') return 'n/a'
  return `${Math.round(used / 1024 / 1024)} MB`
}

const fmt = (s: TSubStats) =>
  `active=${s.active} subs=${s.totalSubscribes} unsubs=${s.totalUnsubscribes}`

setInterval(() => {
  const domNodes = host.querySelectorAll('*').length
  status.textContent = [
    `mounted: ${currentRoot ? 'yes' : 'no'}`,
    `heap (approx): ${fmtMem()}`,
    `dom elements in host: ${domNodes}`,
    '',
    `outer _EACH:  ${fmt(outerEachSubs)}`,
    `nested _EACH: ${fmt(nestedEachSubs)}`,
    `text:        ${fmt(textSubs)}`,
    `attr:        ${fmt(attrSubs)}`,
    '',
    'Expectation:',
    '- while mounted: active counts > 0',
    '- after unmount: all active counts should return to 0',
  ].join('\n')
}, 200)
