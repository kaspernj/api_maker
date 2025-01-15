class HistoryNative {
  push(...args) {
    throw new Error("Stub: Push from history.nativejs", {args})
  }
}

const historyNative = new HistoryNative()

export default historyNative
