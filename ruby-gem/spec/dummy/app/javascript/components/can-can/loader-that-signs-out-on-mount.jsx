import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Devise from "@kaspernj/api-maker/build/devise"
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
