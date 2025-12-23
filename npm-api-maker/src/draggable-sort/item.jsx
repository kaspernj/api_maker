import React, {useMemo} from "react"
import {Animated, Easing, PanResponder} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {EventEmitter} from "eventemitter3"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "../use-event-emitter.js"

const AnimatedView = /** @type {any} */ (Animated.View)

export default memo(shapeComponent(class DraggableSortItem extends ShapeComponent {
  /** @type {EventEmitter|undefined} */
  events
  /** @type {Animated.ValueXY|undefined} */
  position
  /** @type {any} */
  panResponder
  /** @type {any} */
  baseXAtStartedDragging

  static propTypes = propTypesExact({
    cacheKey: PropTypes.string,
    controller: PropTypes.object.isRequired,
    item: PropTypes.any.isRequired,
    itemIndex: PropTypes.number.isRequired,
    onItemMoved: PropTypes.func,
    renderItem: PropTypes.func.isRequired
  })

  initialLayout = null

  setup() {
    this.useStates({
      active: false,
      dragging: false
    })

    this.events ||= new EventEmitter()
    this.position ||= new Animated.ValueXY()
    this.panResponder ||= PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.setState({dragging: true})
        this.p.controller.onDragStart({item: this.p.item, itemIndex: this.p.itemIndex})

        return false
      }
    })

    useEventEmitter(this.p.controller.getEvents(), "onDragStart", this.tt.onDragStart)
    useEventEmitter(this.p.controller.getEvents(), "onDragEndAnimation", this.tt.onDragEndAnimation)
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
          style.backgroundColor = "#fff"
          style.elevation = 2
          style.zIndex = 99999
        }

        return style
      },
      [active]
    )

    return (
      <AnimatedView dataSet={this.cache("draggableSortItemDataSet", {component: "draggable-sort/item"})} onLayout={this.tt.onLayout} style={style}>
        {renderItem({isActive: active, item, touchProps: this.tt.panResponder.panHandlers})}
      </AnimatedView>
    )
  }

  onDragStart = ({itemData}) => {
    const newState = {dragging: true}

    if (itemData.index == this.p.itemIndex) {
      newState.active = true
      this.baseXAtStartedDragging = this.getBaseX()
    }

    this.setState(newState)
  }

  onDragEndAnimation = () => this.setState({active: false, dragging: false})

  onLayout = (e) => {
    const {controller, item, itemIndex} = this.p

    controller.onItemLayout({events: this.tt.events, index: itemIndex, item, layout: e.nativeEvent.layout})

    if (!this.tt.initialLayout) {
      this.initialLayout = e.nativeEvent.layout
    }
  }

  onMove = ({gestate}) => {
    const x = gestate.dx + this.tt.baseXAtStartedDragging - this.tt.initialLayout.x
    const y = this.tt.initialLayout.y

    this.tt.position.setValue({x, y})

    if (this.props.onItemMoved) {
      this.p.onItemMoved({itemIndex: this.p.itemIndex, x, y})
    }
  }

  onMoveToPosition = ({x, y}) => {
    const calculatedXFromStartingPosition = x - this.tt.initialLayout.x
    const animationArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: calculatedXFromStartingPosition,
        y
      },
      useNativeDriver: true,
    }
    const animationEventArgs = {animationArgs, animationType: "moveToPosition", item: this.p.item}

    this.p.controller.events.emit("onAnimationStart", animationEventArgs)

    Animated
      .timing(this.tt.position, animationArgs)
      .start(() => {
        this.p.controller.events.emit("onAnimationEnd", animationEventArgs)
      })

    if (this.props.onItemMoved) {
      this.p.onItemMoved({
        animationArgs,
        itemIndex: this.p.itemIndex,
        x: calculatedXFromStartingPosition,
        y
      })
    }
  }

  getBaseX = () => this.p.controller.getItemDataForIndex(this.p.itemIndex).baseX

  onResetPosition = (args) => {
    const baseX = this.getBaseX() - this.tt.initialLayout.x
    const animationArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: baseX,
        y: 0
      },
      useNativeDriver: true,
    }
    const animationEventArgs = {animationArgs, animationType: "resetPosition", item: this.p.item}

    this.p.controller.events.emit("onAnimationStart", animationEventArgs)

    Animated
      .timing(this.tt.position, animationArgs)
      .start(() => {
        this.p.controller.events.emit("onAnimationEnd", animationEventArgs)
        if (args?.callback) args.callback()
      })

    if (this.props.onItemMoved) {
      this.p.onItemMoved({
        animationArgs,
        itemIndex: this.p.itemIndex,
        x: baseX,
        y: 0
      })
    }
  }
}))
