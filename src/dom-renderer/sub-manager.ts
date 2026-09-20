export class SubscriptionManager {
  private unSubFnSet = new Set<() => void>()

  addUnSubCb(unSubCb: () => void) {
    this.unSubFnSet.add(unSubCb)
  }

  unSubAll() {
    this.unSubFnSet.forEach((unSubFn) => unSubFn())
    this.unSubFnSet.clear()
  }
}
