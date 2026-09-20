import type { IReactiveAdapter } from '../reactive-adapters.ts'
import { isReactiveAdapter } from '../reactive-adapters.ts'
import type { MarkLess } from '../static-el-base.ts'
import { _DYNAMIC } from './dynamic.ts'

type TAllowedToBoolean = boolean | string | number | null | undefined
type TAsReactiveAdapterAllowed = IReactiveAdapter<TAllowedToBoolean>

type TConditionFnParam = MarkLess | (() => MarkLess)

const EMPTY: MarkLess = []
const EMPTY_FN = () => EMPTY

export function _IF(
  condOrReactive: TAllowedToBoolean | TAsReactiveAdapterAllowed,
) {
  let thenFn: () => MarkLess = EMPTY_FN
  let elseFn: () => MarkLess = EMPTY_FN

  const dynAdapter: IReactiveAdapter<() => MarkLess> = {
    subscribe: (subFn) => {
      if (isReactiveAdapter(condOrReactive)) {
        return condOrReactive.subscribe((val) => subFn(val ? thenFn : elseFn))
      }
      subFn(condOrReactive ? thenFn : elseFn)
      return { unsubscribe: () => {} }
    },
  }

  const dynamic = _DYNAMIC(dynAdapter, '_IF')

  const elseReuse = (forElse: TConditionFnParam) => {
    elseFn = () => forElse
    return dynamic
  }

  return {
    THEN: (forThen: TConditionFnParam) => {
      thenFn = () => forThen
      // Assign ELSE for optional chaining
      return Object.assign(dynamic, { ELSE: elseReuse })
    },
    ELSE: elseReuse,
  }
}
