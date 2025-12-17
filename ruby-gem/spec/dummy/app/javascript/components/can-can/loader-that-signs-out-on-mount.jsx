import {shapeComponent, ShapeComponent} from ""set-state-compare/build/shape-component.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import {memo, useMemo} from "react"

export default memo(shapeComponent(class LoaderThatSignsOutOnMount extends ShapeComponent {
  setup() {
    useMemo(() => {
      Devise.signOut()
    }, [])
  }

  render() {
    return null
  }
}))
