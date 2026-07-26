// @ts-check
import TableSettings from "../src/table/table-settings.js"

const buildTableSettings = (identifier) => new TableSettings({
  table: {
    columnsAsArray: () => [],
    props: {},
    state: {identifier}
  }
})

const restoreCrypto = (descriptor) => {
  if (descriptor) {
    Object.defineProperty(globalThis, "crypto", descriptor)
  } else {
    delete globalThis.crypto
  }
}

describe("TableSettings anonymous user ID", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("persists a stable nonblank string without requiring global crypto", () => {
    const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")

    try {
      Object.defineProperty(globalThis, "crypto", {configurable: true, value: undefined})

      const firstTableSettings = buildTableSettings("orders")
      const firstId = firstTableSettings.anonymouseUserId()
      const secondId = buildTableSettings("orders").anonymouseUserId()

      expect(firstId).toEqual(expect.any(String))
      expect(firstId).not.toHaveLength(0)
      expect(secondId).toBe(firstId)
    } finally {
      restoreCrypto(originalCryptoDescriptor)
    }
  })

  it("generates unique values for independent identifiers and storage states", () => {
    const ordersId = buildTableSettings("orders").anonymouseUserId()
    const usersId = buildTableSettings("users").anonymouseUserId()

    localStorage.clear()

    const freshOrdersId = buildTableSettings("orders").anonymouseUserId()

    expect(new Set([ordersId, usersId, freshOrdersId]).size).toBe(3)
  })
})
