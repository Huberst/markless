import { comment } from '../define-tag.ts'
import { SubscriptionManager } from '../dom-renderer/sub-manager.ts'
import {
  type IReactiveAdapter,
  isReactiveAdapter,
} from '../reactive-adapters.ts'
import type { IElementEntity, IRenderCtx, MarkLess } from '../static-el-base.ts'

const defaultDoFn = (item: any, idx: number) => {
  console.warn('NO DO FN!')
  return ''
}

type TEachEntry<T> = {
  idx: number
  entry: T
  elEntity?: IElementEntity
}

type TEachEntityMap<T> = Map<string, TEachEntry<T>>

export const _EACH = <T>(
  arrayOrReactive: T[] | IReactiveAdapter<T[]>,
  idxFn?: (item: T, idx: number) => string,
) => {
  let nextValues: T[] = []
  let nextKeys: string[] = []
  let needsFullRemount = false

  const entityMap: TEachEntityMap<T> = new Map<string, TEachEntry<T>>()
  let entityArray: TEachEntry<T>[] = []

  let hiddenDivEntity: IElementEntity
  let rCtx: IRenderCtx

  /** @todo Impl. more elegant way of getting the key. Also allow user to determine how to grab a key. */
  function grabKey(entry: T, index?: number): string {
    const defaultKey = entry
    return `${defaultKey}_KEY${index !== undefined ? `_${index}` : ''}`
  }

  function removeDetachedEntries() {
    entityMap.forEach((e, key) => {
      if (!nextKeys.includes(key)) {
        e.elEntity?.remove()
        entityMap.delete(key)
      }
    })
  }

  function clearMountedEntries() {
    entityMap.forEach((e) => {
      e.elEntity?.remove()
      e.elEntity = undefined
    })
  }

  /**
   * UPDATE ELEMENTS
   */
  function updateElements() {
    if (needsFullRemount) {
      clearMountedEntries()
    }

    removeDetachedEntries()

    entityArray.reverse().forEach((e) => {
      if (!e.elEntity) {
        e.elEntity = rCtx.render(doFn(e.entry, e.idx), 'from _EACH doFn')
        hiddenDivEntity.placeAfterSelf(e.elEntity)
      }
    })
  }

  /**
   * REMAP
   */
  function remap() {
    const updated: TEachEntry<T>[] = []
    nextKeys = []
    needsFullRemount = false
    const hasMountedEntries = entityArray.some((entry) => entry.elEntity)

    nextValues.forEach((entry, index) => {
      const key = idxFn ? idxFn(entry, index) : grabKey(entry, index)
      nextKeys.push(key)
      const present = entityMap.get(key)

      if (present) {
        if (present.idx !== index || present.entry !== entry) {
          needsFullRemount = true
        }
        present.idx = index
        present.entry = entry
        updated.push(present)
      } else {
        if (hasMountedEntries) {
          needsFullRemount = true
        }
        const toAdd: TEachEntry<T> = {
          idx: index,
          entry: entry,
        }
        entityMap.set(key, toAdd)
        updated.push(toAdd)
      }
    })
    entityArray = updated
  }

  // Setting things up.

  const subManager = new SubscriptionManager()

  function setupAndSubscribe() {
    if (isReactiveAdapter(arrayOrReactive)) {
      const unSub = arrayOrReactive.subscribe((newArr) => {
        nextValues = newArr
        remap()
        updateElements()
      })
      subManager.addUnSubCb(() => unSub.unsubscribe())
    } else {
      // Not observed array - just use as is.
      nextValues = arrayOrReactive
      remap()
      updateElements()
    }
  }

  const hiddenEachElement = comment
    .attr('data', '_EACH')
    .afterMount((elEnt, passedRCtx) => {
      hiddenDivEntity = elEnt
      rCtx = passedRCtx
      setupAndSubscribe()
    })
    .onRemove(() => {
      subManager.unSubAll()

      entityMap.forEach((e) => {
        e.elEntity?.remove()
      })
      entityMap.clear()
      entityArray = []
    })

  let doFn: (item: T, idx: number) => MarkLess = defaultDoFn

  const DO = (passedDoFn: (item: T, idx: number) => MarkLess) => {
    doFn = passedDoFn
    return hiddenEachElement
  }

  return { DO }
}

/**
 * Note for improvements:
 * - Ensure that each can render before the hiddenDivElement has mounted somehow!
 *   Rendering sync would be good.
 */
