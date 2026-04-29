// @ts-check
import React, {forwardRef} from "react"
import {WithDefaultStyle, useMergedStyle} from "./default-style"
import memo from "set-state-compare/build/memo.js"

/**
 * Wires `Component` into the api-maker default-style context as a slot.
 * Inherits accumulated defaults for `slotKey`, merges them with the caller's
 * `style` prop, and re-provides the merged list so nested instances of the
 * same component continue to inherit.
 *
 * Caller usage mirrors the built-in `Text` wrapper:
 *
 * ```jsx
 * import {Link as ExpoLink} from "expo-router"
 * import withDefaultStyleSlot from "@kaspernj/api-maker/build/utils/with-default-style-slot"
 *
 * const Link = withDefaultStyleSlot(ExpoLink, "Link")
 *
 * // …consumer tree wraps in <WithDefaultStyle style={{Link: {color: "red"}}}> …
 * ```
 *
 * @template {object} P
 * @param {React.ComponentType<P>} Component Underlying component to wrap.
 * @param {string} slotKey Slot name to register defaults under.
 * @returns {React.NamedExoticComponent<P>}
 */
const withDefaultStyleSlot = (Component, slotKey) => {
  const RenderComponent = /** @type {React.ComponentType<Record<string, unknown>>} */ (
    /** @type {unknown} */ (Component)
  )
  const Wrapped = forwardRef((/** @type {Record<string, unknown>} */ props, ref) => {
    const {style, ...restProps} = props
    const {newDefaultStyle, stylesList} = useMergedStyle(style, slotKey)

    return (
      <WithDefaultStyle style={newDefaultStyle}>
        <RenderComponent ref={ref} style={stylesList} {...restProps} />
      </WithDefaultStyle>
    )
  })

  const displayName = `WithDefaultStyleSlot(${Component.displayName || Component.name || slotKey})`

  Wrapped.displayName = displayName

  const Memoized = /** @type {React.NamedExoticComponent<P>} */ (memo(Wrapped))

  Memoized.displayName = displayName

  return Memoized
}

export default withDefaultStyleSlot
