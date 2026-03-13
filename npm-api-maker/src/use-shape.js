import {useEffect, useMemo} from "react"
import {Shape} from "set-state-compare/build/use-shape.js"
import shared from "set-state-compare/build/shared.js"

/**
 * Wrap queued `useShape` state setters so deferred updates schedule their own flush.
 *
 * The upstream `Shape` helper only replays `__setStatesLater` from React commits.
 * When an async setter lands during another render and no later commit happens,
 * the queued state can otherwise sit forever.
 *
 * @param {Shape & Record<string, any>} shape
 * @returns {void}
 */
const ensureQueuedStateFlush = function(shape) {
  shape.__wrappedUseShapeSetStates ||= {}

  for (const stateName in shape.setStates) {
    if (!shape.__wrappedUseShapeSetStates[stateName]) {
      const originalSetState = shape.setStates[stateName]

      shape.setStates[stateName] = (newValue, args) => {
        originalSetState(newValue, args)

        if (!shape.__mounted || Object.keys(shape.__setStatesLater).length === 0) return
        if (shape.__queuedUseShapeFlushScheduled) return

        shape.__queuedUseShapeFlushScheduled = true

        // Flush deferred updates after paint so queued async completions do not depend on an unrelated future commit.
        shared.scheduleAfterPaint(() => {
          shape.__queuedUseShapeFlushScheduled = false

          if (!shape.__mounted || Object.keys(shape.__setStatesLater).length === 0) return

          shape.__afterRender()
        })
      }
      shape.__wrappedUseShapeSetStates[stateName] = true
    }
  }
}

/**
 * Local `useShape` wrapper that flushes queued state writes after every commit.
 *
 * The upstream helper only flushes `__setStatesLater` on the initial mount.
 * When async hook work resolves during a later render, those updates can stay
 * queued forever, which strands dependent UIs in loading states.
 *
 * @param {Record<string, any>} props
 * @param {object} [opts]
 * @param {typeof Shape} [opts.shapeClass]
 * @returns {Shape}
 */
export default function useShape(props, opts) {
  const shape = /** @type {Shape} */ (useMemo(
    () => {
      const ShapeClass = opts?.shapeClass || Shape

      return new ShapeClass()
    },
    []
  ))

  useEffect(() => {
    shape.__mounting = false
    shape.__mounted = true
    shape.__afterRender()

    return () => {
      shape.__mounted = false
    }
  }, [])

  useEffect(() => {
    // Flush render-time queued updates after every commit so async completions
    // that land during a sibling render are not stranded indefinitely.
    shape.__afterRender()
  })

  ensureQueuedStateFlush(shape)
  shape.updateProps(props)

  return shape
}
