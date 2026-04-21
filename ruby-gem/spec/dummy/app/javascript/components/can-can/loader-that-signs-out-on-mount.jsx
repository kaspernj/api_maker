import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import {memo, useMemo} from "react"

/** @typedef {object} LoaderThatSignsOutOnMountProps */
/** @typedef {object} LoaderThatSignsOutOnMountState */
export default memo(shapeComponent(/** @augments {ShapeComponent<LoaderThatSignsOutOnMountProps, LoaderThatSignsOutOnMountState>} */ class LoaderThatSignsOutOnMount extends ShapeComponent {
  setup() {
    useMemo(() => {
      Devise.signOut()
    }, [])
  }

  render() {
    return null
  }
}))
