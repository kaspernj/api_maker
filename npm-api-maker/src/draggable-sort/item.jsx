// @ts-check
/* eslint-disable sort-imports */
import {Animated, Easing, PanResponder} from "react-native"
import {EventEmitter} from "eventemitter3"
import React, {useMemo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "ya-use-event-emitter"

/** @typedef {import("./controller.js").default} DraggableSortController */
/** @typedef {import("eventemitter3").EventEmitter} DraggableSortEventEmitter */
/** @typedef {import("react-native").GestureResponderHandlers} DraggableTouchProps */
/** @typedef {import("react-native").LayoutRectangle} DraggableSortLayout */
/** @typedef {import("react-native").PanResponderGestureState} DraggableSortGestureState */
/** @typedef {{x: number, y: number}} DraggablePosition */
/**
 * @typedef {object} DraggableSortAnimationArgs
 * @property {number} duration
 * @property {(value: number) => number} easing
 * @property {DraggablePosition} toValue
 * @property {boolean} useNativeDriver
 */
/**
 * @typedef {object} DraggableSortOnItemMovedArgs
 * @property {DraggableSortAnimationArgs} [animationArgs]
 * @property {object} item
 * @property {number} itemIndex
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {object} DraggableSortRenderItemArgs
 * @property {boolean} isActive
 * @property {object} item
 * @property {DraggableTouchProps} touchProps
 */
/**
 * @typedef {object} DraggableSortItemData
 * @property {number} index
 * @property {object} item
 * @property {number} position
 */
/**
 * @typedef {object} DraggableSortMoveEventArgs
 * @property {DraggableSortGestureState} gestate
 */
/**
 * @typedef {object} DraggableSortMoveToPositionArgs
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {object} DraggableSortResetPositionArgs
 * @property {() => void} [callback]
 */

/**
 * @typedef {object} Props
 * @property {import("react-native").ViewStyle} [activeItemStyle]
 * @property {string} [cacheKey]
 * @property {DraggableSortController} controller
 * @property {object} item
 * @property {number} itemIndex
 * @property {(args: DraggableSortOnItemMovedArgs) => void} [onItemMoved]
 * @property {(args: DraggableSortRenderItemArgs) => React.ReactNode} renderItem
 */
/**
 * @typedef {object} State
 * @property {boolean} active
 * @property {boolean} dragging
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class DraggableSortItem extends ShapeComponent {
  static propTypes = propTypesExact({
    activeItemStyle: PropTypes.object,
    cacheKey: PropTypes.string,
    controller: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    itemIndex: PropTypes.number.isRequired,
    onItemMoved: PropTypes.func,
    renderItem: PropTypes.func.isRequired
  })

  /** @type {DraggableSortEventEmitter} */
  events

  /** @type {import("react-native").Animated.ValueXY} */
  position

  /** @type {import("react-native").PanResponderInstance} */
  panResponder

  /** @type {DraggableSortLayout|null} */
  initialLayout = null
  state = {
    active: false,
    dragging: false
  }

  setup() {
    this.events ||= new EventEmitter()
    this.position ||= new Animated.ValueXY()
    this.panResponder ||= PanResponder.create({
      onStartShouldSetPanResponder: (_event) => {
        this.s.dragging = true
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
    const {activeItemStyle, item, renderItem} = this.p
    const {active} = this.s
    const style = useMemo(
      () => {
        const baseTransform = this.tt.position.getTranslateTransform()

        /** @type {import("react-native").ViewStyle} */
        const style = {transform: baseTransform}

        if (active) {
          if (activeItemStyle) {
            const {transform: activeTransform, ...restActiveStyle} = activeItemStyle

            if (activeTransform) {
              const normalizedActiveTransform = /** @type {NonNullable<import("react-native").TransformsStyle["transform"]>} */ (
                Array.isArray(activeTransform) ? activeTransform : [activeTransform]
              )

              style.transform = /** @type {import("react-native").ViewStyle["transform"]} */ ([...baseTransform, ...normalizedActiveTransform])
            }

            Object.assign(style, restActiveStyle)
          }
          style.elevation = 2
          style.zIndex = 99999
        }

        return style
      },
      [active, activeItemStyle]
    )

    return (
      <Animated.View dataSet={this.cache("draggableSortItemDataSet", {component: "draggable-sort/item"})} onLayout={this.tt.onLayout} style={style}>
        {renderItem({isActive: active, item, touchProps: this.tt.panResponder.panHandlers})}
      </Animated.View>
    )
  }

  /**
   * Activate the dragged item after the controller announces drag start.
   * @param {{itemData: DraggableSortItemData}} root0
   */
  onDragStart = ({itemData}) => {
    this.s.dragging = true

    if (itemData.index == this.p.itemIndex) {
      this.s.active = true
      this.baseXAtStartedDragging = this.getBaseX()
    }
  }

  onDragEndAnimation = () => {
    this.s.active = false
    this.s.dragging = false
  }

  /** @param {{nativeEvent: {layout: DraggableSortLayout}}} e */
  onLayout = (e) => {
    const {controller, item, itemIndex} = this.p

    controller.onItemLayout({events: this.tt.events, index: itemIndex, item, layout: e.nativeEvent.layout})

    if (!this.tt.initialLayout) {
      this.initialLayout = e.nativeEvent.layout
    }
  }

  /**
   * Move the active item in sync with the current drag gesture.
   * @param {DraggableSortMoveEventArgs} root0
   */
  onMove = ({gestate}) => {
    if (!this.tt.initialLayout) throw new Error("Expected initial layout before moving draggable item")

    const x = gestate.dx + this.tt.baseXAtStartedDragging - this.tt.initialLayout.x
    const y = this.tt.initialLayout.y

    this.tt.position.setValue({x, y})

    if (this.props.onItemMoved) {
      this.p.onItemMoved({item: this.p.item, itemIndex: this.p.itemIndex, x, y})
    }
  }

  /**
   * Animate a non-dragged item into its new ordered position.
   * @param {DraggableSortMoveToPositionArgs} root0
   */
  onMoveToPosition = ({x, y}) => {
    if (!this.tt.initialLayout) throw new Error("Expected initial layout before animating item position")

    const calculatedXFromStartingPosition = x - this.tt.initialLayout.x

    /** @type {DraggableSortAnimationArgs} */
    const animationArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: calculatedXFromStartingPosition,
        y
      },
      useNativeDriver: true
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
        item: this.p.item,
        itemIndex: this.p.itemIndex,
        x: calculatedXFromStartingPosition,
        y
      })
    }
  }

  getBaseX = () => this.p.controller.getItemDataForIndex(this.p.itemIndex).baseX

  /**
   * Animate the dragged item back to its base position after drag end.
   * @param {DraggableSortResetPositionArgs} [args]
   */
  onResetPosition = (args) => {
    if (!this.tt.initialLayout) throw new Error("Expected initial layout before resetting item position")

    const baseX = this.getBaseX() - this.tt.initialLayout.x

    /** @type {DraggableSortAnimationArgs} */
    const animationArgs = {
      duration: 200,
      easing: Easing.inOut(Easing.linear),
      toValue: {
        x: baseX,
        y: 0
      },
      useNativeDriver: true
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
        item: this.p.item,
        itemIndex: this.p.itemIndex,
        x: baseX,
        y: 0
      })
    }
  }
}))
