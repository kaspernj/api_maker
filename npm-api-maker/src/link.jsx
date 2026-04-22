// @ts-check
/* eslint-disable sort-imports */
import {Platform, Pressable, StyleSheet} from "react-native"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types"
import React from "react"
import dataSetToAttributes from "./data-set-to-attributes.js"
import memo from "set-state-compare/build/memo.js"
import {useApiMaker} from "./with-api-maker"

/** @typedef {{pressed?: boolean, focused?: boolean, hovered?: boolean}} LinkStyleState */
/**
 * @typedef {Partial<import("react-native").ViewStyle & import("react").CSSProperties> &
 *   {paddingHorizontal?: number|string, paddingVertical?: number|string}} ResolvedStyle
 */
/** @typedef {import("react-native").StyleProp<import("react-native").ViewStyle>} NativeLinkStyle */
/** @typedef {NativeLinkStyle | ((state: LinkStyleState) => NativeLinkStyle)} PressableLinkStyle */
/** @typedef {import("react").CSSProperties | PressableLinkStyle} LinkStyle */
/** @typedef {{paddingHorizontal?: number|string, paddingVertical?: number|string, style?: LinkStyle, usePressable?: boolean}} LinkStyleArgs */
/** @typedef {{paddingBottom?: number|string, paddingLeft?: number|string, paddingRight?: number|string, paddingTop?: number|string}} PaddingOverrides */

/**
 * @typedef {object} Props
 * @property {number|string} [paddingHorizontal]
 * @property {number|string} [paddingVertical]
 * @property {boolean} [usePressable]
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerLink extends ShapeComponent {
  static propTypes = {
    paddingHorizontal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    paddingVertical: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    usePressable: PropTypes.bool
  }

  setup() {
    this.apiMaker = useApiMaker()
  }

  render() {
    const {dataSet, to, onClick, onPress, paddingHorizontal, paddingVertical, style, testID, usePressable, ...restProps} = this.props
    const linkStyle = this.linkStyle({paddingHorizontal, paddingVertical, style, usePressable})

    if (Platform.OS == "web" && !usePressable) {
      return (
        <a
          {...dataSetToAttributes(Object.assign({testid: testID}, dataSet))} // eslint-disable-line prefer-object-spread
          href={to || "#"}
          onClick={this.tt.onLinkClicked}
          style={/** @type {import("react").CSSProperties} */ (linkStyle)}
          {...restProps}
        />
      )
    }

    return (
      <Pressable
        dataSet={dataSet}
        onPress={this.tt.onPress}
        style={/** @type {PressableLinkStyle} */ (linkStyle)}
        testID={testID}
        {...restProps}
      />
    )
  }

  /**
   * Returns a cached style with padding props applied.
   * @param {LinkStyleArgs} root0
   * @returns {LinkStyle}
   */
  linkStyle({paddingHorizontal, paddingVertical, style, usePressable}) {
    if (Platform.OS == "web" && !usePressable) {
      return this.linkStyleForAnchor({paddingHorizontal, paddingVertical, style})
    }

    return this.linkStyleForPressable({paddingHorizontal, paddingVertical, style})
  }

  /**
   * Returns the anchor style with padding props applied.
   * @param {LinkStyleArgs} root0
   * @returns {import("react").CSSProperties}
   */
  linkStyleForAnchor({paddingHorizontal, paddingVertical, style}) {
    return this.cache("linkStyleForAnchor", () => {
      const resolvedStyle = this.resolveStyleForAnchor(style)
      const overrides = this.paddingOverridesFromStyle({paddingHorizontal, paddingVertical, style: resolvedStyle})

      if (!overrides) return resolvedStyle

      const nextStyle = {...resolvedStyle}

      delete nextStyle.paddingHorizontal
      delete nextStyle.paddingVertical

      return {...nextStyle, ...overrides}
    }, [paddingHorizontal, paddingVertical, style])
  }

  /**
   * Returns a Pressable-compatible style with padding props applied.
  * @param {LinkStyleArgs} root0
  * @returns {PressableLinkStyle}
  */
  linkStyleForPressable({paddingHorizontal, paddingVertical, style}) {
    return /** @type {PressableLinkStyle} */ (this.cache("linkStyleForPressable", () => {
      if (typeof style == "function") {
        return /** @type {PressableLinkStyle} */ ((/** @type {LinkStyleState} */ state) => {
          const resolvedStyle = style(state)
          const overrides = this.paddingOverridesFromStyle({paddingHorizontal, paddingVertical, style: resolvedStyle})

          if (!overrides) return resolvedStyle

          if (Array.isArray(resolvedStyle)) return /** @type {NativeLinkStyle} */ ([...resolvedStyle, overrides])

          if (resolvedStyle && typeof resolvedStyle == "object") {
            return /** @type {NativeLinkStyle} */ ({...this.stripPaddingShorthand(resolvedStyle), ...overrides})
          }

          return /** @type {NativeLinkStyle} */ ([resolvedStyle, overrides])
        })
      }

      const overrides = this.paddingOverridesFromStyle({paddingHorizontal, paddingVertical, style})

      if (!overrides) return style

      if (!style) return overrides

      if (Array.isArray(style)) return /** @type {NativeLinkStyle} */ ([...style, overrides])

      if (typeof style == "object") {
        return /** @type {NativeLinkStyle} */ ({...this.stripPaddingShorthand(style), ...overrides})
      }

      return /** @type {NativeLinkStyle} */ ([style, overrides])
    }, [paddingHorizontal, paddingVertical, style]))
  }

  /**
   * Resolves a style object for anchor rendering.
   * @param {LinkStyle | undefined} style
   * @returns {ResolvedStyle}
   */
  resolveStyleForAnchor(style) {
    if (typeof style == "function") {
      return /** @type {ResolvedStyle} */ (StyleSheet.flatten(style({pressed: false, focused: false, hovered: false})) || {})
    }

    if (Array.isArray(style)) return /** @type {ResolvedStyle} */ (StyleSheet.flatten(style) || {})

    return /** @type {ResolvedStyle} */ (style || {})
  }

  /**
   * Returns padding overrides based on the resolved style.
   * @param {LinkStyleArgs} root0
   * @returns {PaddingOverrides | null}
   */
  paddingOverridesFromStyle({paddingHorizontal, paddingVertical, style}) {
    const styleObject = /** @type {ResolvedStyle} */ (StyleSheet.flatten(style) || {})
    const stylePaddingHorizontal = /** @type {number | string | undefined} */ (styleObject.paddingHorizontal)
    const stylePaddingVertical = /** @type {number | string | undefined} */ (styleObject.paddingVertical)
    const paddingHorizontalDefined = this.isDefined(paddingHorizontal)
    const paddingVerticalDefined = this.isDefined(paddingVertical)
    const stylePaddingHorizontalDefined = this.isDefined(stylePaddingHorizontal)
    const stylePaddingVerticalDefined = this.isDefined(stylePaddingVertical)
    const hasPaddingHorizontal = paddingHorizontalDefined || stylePaddingHorizontalDefined
    const hasPaddingVertical = paddingVerticalDefined || stylePaddingVerticalDefined

    if (!hasPaddingHorizontal && !hasPaddingVertical) return null

    const resolvedPaddingHorizontal = paddingHorizontalDefined ? paddingHorizontal : stylePaddingHorizontal
    const resolvedPaddingVertical = paddingVerticalDefined ? paddingVertical : stylePaddingVertical
    const overrides = {}

    if (this.isDefined(resolvedPaddingHorizontal)) {
      if (!this.isDefined(styleObject.paddingLeft)) overrides.paddingLeft = resolvedPaddingHorizontal
      if (!this.isDefined(styleObject.paddingRight)) overrides.paddingRight = resolvedPaddingHorizontal
    }

    if (this.isDefined(resolvedPaddingVertical)) {
      if (!this.isDefined(styleObject.paddingTop)) overrides.paddingTop = resolvedPaddingVertical
      if (!this.isDefined(styleObject.paddingBottom)) overrides.paddingBottom = resolvedPaddingVertical
    }

    return overrides
  }

  /**
   * Removes padding shorthand values from a style object.
   * @param {ResolvedStyle | import("react-native").ViewStyle | import("react").CSSProperties} style
  * @returns {ResolvedStyle}
   */
  stripPaddingShorthand(style) {
    const nextStyle = /** @type {ResolvedStyle} */ ({...style})

    delete nextStyle.paddingHorizontal
    delete nextStyle.paddingVertical

    return nextStyle
  }

  /**
   * Returns true when a value is neither null nor undefined.
   * @template T
   * @param {T | null | undefined} value
   * @returns {value is T}
   */
  isDefined(value) {
    return value !== null && value !== undefined
  }

  onLinkClicked = (e, ...restArgs) => {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey && this.props.target != "_blank") {
      e.preventDefault()

      this.redirect()
    }
  }

  onPress = (e, ...restArgs) => {
    const {onClick, onPress} = this.props

    if (onClick) {
      onClick(e, ...restArgs)
    }

    if (onPress) {
      onPress(e, ...restArgs)
    }

    this.redirect()
  }

  redirect = () => {
    // If no timeout is used, this can cause an "component suspended while responding to synchronous input"-error
    setTimeout(() => {
      this._historyPush()
    }, 0)
  }

  _historyPush() {
    const history = this.apiMaker.config.getHistory()

    if (!history) throw new Error("History hasn't been set in the API maker configuration")

    history.push(this.props.to)
  }
}))
