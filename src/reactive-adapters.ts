export type TReactive = IReactiveAdapter<string | number | boolean>

export interface IReactiveAdapter<T> {
  subscribe(subFn: (value: T) => void): { unsubscribe(): void }
}

export const isReactiveAdapter = <T>(
  obj: unknown,
): obj is IReactiveAdapter<T> => {
  return (
    obj !== undefined &&
    obj !== null &&
    typeof obj === 'object' &&
    'subscribe' in obj &&
    typeof obj.subscribe === 'function'
  )
}

type TRxJsObservableLike<T> = {
  subscribe(subscription: (val: T) => void): {
    unsubscribe(): void
  }
}

type TPreactSignalLike<T> = {
  subscribe: (fn: (value: T) => void) => () => void
}

const raFromSignal = <T>(signal: TPreactSignalLike<T>): IReactiveAdapter<T> => {
  return {
    subscribe: (subFn: (value: T) => void) => {
      const unSubFn = signal.subscribe(subFn)
      return {
        unsubscribe: () => unSubFn(),
      }
    },
  }
}

const isSignalLike = <T>(obj: unknown): obj is TPreactSignalLike<T> => {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&
    'peek' in obj &&
    typeof (obj as { peek?: unknown }).peek === 'function' &&
    'subscribe' in obj &&
    typeof (obj as TPreactSignalLike<T>).subscribe === 'function'
  )
}

export function toReactiveAdapter<T>(
  value: TPreactSignalLike<T>,
): IReactiveAdapter<T>
export function toReactiveAdapter<T>(
  value: TRxJsObservableLike<T> | IReactiveAdapter<T>,
): IReactiveAdapter<T>
export function toReactiveAdapter<T>(
  value: TPreactSignalLike<T> | TRxJsObservableLike<T> | IReactiveAdapter<T>,
): IReactiveAdapter<T> {
  if (isSignalLike<T>(value)) return raFromSignal(value)
  return value as IReactiveAdapter<T>
}

type ReactiveSource<S> = S extends {
  subscribe: (fn: (val: infer T) => void) => unknown
}
  ? T
  : never

export const toReactiveAdapterWithSource = <
  S extends { subscribe: (fn: (val: unknown) => void) => unknown },
>(
  source: S,
): [IReactiveAdapter<ReactiveSource<S>>, S] => [
  toReactiveAdapter(
    source as Parameters<typeof toReactiveAdapter>[0],
  ) as IReactiveAdapter<ReactiveSource<S>>,
  source,
]
