const environment = {}

const useEnvironment = function useEnvironment() {
  if (!environment.result) {
    environment.result = {
      isBrowser: false,
      isNative: false,
      isServer: false
    }

    if (typeof navigator !== undefined && navigator.product == "ReactNative") {
      environment.result.isNative = true
    } else if (typeof window !== undefined && window.document?.createElement) {
      environment.result.isBrowser = true
    } else {
      environment.result.isServer = true
    }
  }

  return environment.result
}

export default useEnvironment
