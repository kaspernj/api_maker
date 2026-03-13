import {useEffect, useMemo} from "react"
import {Shape} from "set-state-compare/build/use-shape.js"

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

  shape.updateProps(props)

  return shape
}
