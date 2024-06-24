import {ShapeComponent} from "set-state-compare/src/shape-component"

export default class ComponentsWooftechShapeComponent extends ShapeComponent {
  p = fetchingObject(() => this.props)
  s = fetchingObject(() => this.shape || this.state)
  tt = fetchingObject(this)
}
