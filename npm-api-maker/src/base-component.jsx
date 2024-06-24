import fetchingObject from "fetching-object"
import {ShapeComponent} from "set-state-compare/src/shape-component"

export default class BaseComponent extends ShapeComponent {
  p = fetchingObject(() => this.props)
  s = fetchingObject(() => this.shape || this.state)
  tt = fetchingObject(this)
}
