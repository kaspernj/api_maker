import events from "./events.mjs"
import useEventEmitter from "./use-event-emitter.mjs"
import useShape from "set-state-compare/src/use-shape.js"

const useValidationErrors = (callback) => {
  const s = useShape({callback})

  s.useStates({validationErrors: []})

  const onValidationErrors = useCallback((validationErrors) => {
    const matchedValidationErrors = []

    for (const validationError of validationErrors.getValidationErrors()) {
      if (s.p.callback(validationError)) {
        validationError.setHandled()
        matchedValidationErrors.push(validationError)
      }
    }

    s.set({
      validationErrors: matchedValidationErrors
    })
  }, [])

  useEventEmitter(events, "onValidationErrors", onValidationErrors)

  return {
    validationErrors: s.s.validationErrors
  }
}

export default useValidationErrors
