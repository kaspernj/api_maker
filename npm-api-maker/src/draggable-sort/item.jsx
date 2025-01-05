import EventEmitter from "events"
import memo from "set-state-compare/src/memo"
import {Animated, Easing, PanResponder} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import useEventEmitter from "../use-event-emitter.mjs"

export default memo(shapeComponent(class DraggableSortItem extends ShapeComponent {
  static propTypes = propTypesExact({
    cacheKey: PropTypes.string,
    controller: PropTypes.object.isRequired,
    item: PropTypes.any.isRequired,
    itemIndex: PropTypes.number.isRequired,
    onItemMoved: PropTypes.func,
    renderItem: PropTypes.func.isRequired
  })

  setup() {
    this.useStates({
      active: false,
      dragging: false,
      initialLayout: null
    })

    this.events = useMemo(() => new EventEmitter(), [])
    this.position = useMemo(() => new Animated.ValueXY(), [])
    this.panResponder = useMemo(
      () => PanResponder.create({
        onStartShouldSetPanResponder: (e, ) => {
          this.setState({dragging: true})
          this.p.controller.onDragStart({item: this.p.item, itemIndex: this.p.itemIndex})

          return false
        }
      }),
      []
    )

    useEventEmitter(this.p.controller.getEvents(), "draggingItem", this.tt.onDraggingItem)
    useEventEmitter(this.p.controller.getEvents(), "dragEnd", this.tt.onDragEnd)
    useEventEmitter(this.tt.events, "move", this.tt.onMove)
    useEventEmitter(this.tt.events, "moveToPosition", this.tt.onMoveToPosition)
    useEventEmitter(this.tt.events, "resetPosition", this.tt.onResetPosition)
  }

  render() {
    const {item, renderItem} = this.p
    const {active} = this.s
    const style = useMemo(
      () => {
        const style = {
          transform: this.tt.position.getTranslateTransform()
        }

        if (active) {
          style.elevation = 1
          style.zIndex = 99999
        }

        return style
      },
      [active]
    )

    return (
      <Animated.View dataSet={{component: "api-maker/draggable-sort/item"}} onLayout={this.tt.onLayout} style={style}>
        {renderItem({isActive: active, item, touchProps: this.tt.panResponder.panHandlers})}
      </Animated.View>
    )
  }

  onDraggingItem = ({itemData}) => {
    const newState = {dragging: true}

    if (itemData.index == this.p.itemIndex) {
      newState.active = true
      this.baseXAtStartedDragging = this.getBaseX()
    }

    this.setState(newState)
  }

  onDragEnd = () => this.setState({active: false, dragging: false})

  onLayout = (e) => {
    if (!this.s.initialLayout) {
      this.p.controller.onItemLayout({events: this.tt.events, index: this.p.itemIndex, item: this.p.item, layout: e.nativeEvent.layout})
      this.setState({initialLayout: e.nativeEvent.layout})
    }
  }

  onMove = ({gestate}) => {
    const x = gestate.dx + this.tt.baseXAtStartedDragging - this.s.initialLayout.x
    const y = this.s.initialLayout.y

    this.tt.position.setValue({x, y})

    if (this.props.onItemMoved) {
      this.p.onItemMoved({itemIndex: this.p.itemIndex, x, y})
    }
  }

  onMoveToPosition = ({x, y}) => {
    const calculatedXFromStartingPosition = x - this.s.initialLayout.x
    const animatedArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: calculatedXFromStartingPosition,
        y
      },
      useNativeDriver: true,
    }

    Animated.timing(this.tt.position, animatedArgs).start()

    if (this.props.onItemMoved) {
      this.p.onItemMoved({
        animatedArgs,
        itemIndex: this.p.itemIndex,
        x: calculatedXFromStartingPosition,
        y
      })
    }
  }

  getBaseX = () => this.p.controller.getItemDataForIndex(this.p.itemIndex).baseX

  onResetPosition = () => {
    const baseX = this.getBaseX() - this.s.initialLayout.x
    const animatedArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: baseX,
        y: 0
      },
      useNativeDriver: true,
    }

    Animated.timing(this.tt.position, animatedArgs).start()

    if (this.props.onItemMoved) {
      this.p.onItemMoved({
        animatedArgs,
        itemIndex: this.p.itemIndex,
        x: baseX,
        y: 0
      })
    }
  }
}))
