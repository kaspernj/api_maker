// @ts-check
/* eslint-disable sort-imports */
import {Animated, PanResponder} from "react-native"
import {EventEmitter} from "eventemitter3"
import React, {useMemo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import Controller from "./controller.js"
import DraggableSortItem from "./item"
import PropTypes from "prop-types"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "ya-use-event-emitter"

/** @typedef {import("eventemitter3").EventEmitter} DraggableSortEventEmitter */
/** @typedef {import("react-native").GestureResponderHandlers} DraggableTouchProps */
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
 * @typedef {object} DraggableSortDragItemData
 * @property {number} index
 * @property {object} item
 * @property {number} position
 */
/**
 * @typedef {object} DraggableSortDragStartArgs
 * @property {DraggableSortDragItemData} itemData
 */
/**
 * @typedef {object} DraggableSortDragEndArgs
 * @property {number} fromIndex
 * @property {object} fromItem
 * @property {number} fromPosition
 * @property {object} item
 * @property {DraggableSortDragItemData} itemData
 * @property {object|null} toItem
 * @property {number|null} toPosition
 */
/**
 * @typedef {object} DraggableSortRenderItemArgs
 * @property {boolean} isActive
 * @property {object} item
 * @property {DraggableTouchProps} touchProps
 */

/**
 * @typedef {object} Props
 * @property {import("react-native").ViewStyle} [activeItemStyle]
 * @property {(item: object) => string} [cacheKeyExtractor]
 * @property {object[]} data
 * @property {object} [dataSet]
 * @property {DraggableSortEventEmitter} [events]
 * @property {boolean} [horizontal]
 * @property {(item: object) => string} keyExtractor
 * @property {(args: DraggableSortDragEndArgs) => void} [onDragItemEnd]
 * @property {(args: DraggableSortDragStartArgs) => void} [onDragItemStart]
 * @property {(args: DraggableSortOnItemMovedArgs) => void} [onItemMoved]
 * @property {(args: DraggableSortDragEndArgs) => void|Promise<void>} onReordered
 * @property {(args: DraggableSortRenderItemArgs) => React.ReactNode} renderItem
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class DraggableSort extends ShapeComponent {
  /** @type {import("./controller.js").default} */
  controller

  /** @type {import("react-native").PanResponderInstance} */
  panResponder

  static defaultProps = {
    activeItemStyle: {backgroundColor: "#fff"},
    horizontal: false
  }

  static propTypes = propTypesExact({
    activeItemStyle: PropTypes.object,
    cacheKeyExtractor: PropTypes.func,
    data: PropTypes.array.isRequired,
    dataSet: PropTypes.object,
    events: PropTypes.instanceOf(EventEmitter),
    horizontal: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
    onDragItemEnd: PropTypes.func,
    onDragItemStart: PropTypes.func,
    onItemMoved: PropTypes.func,
    onReordered: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired
  })

  setup() {
    const {data, keyExtractor} = this.p
    const {events} = this.props

    this.controller ||= new Controller({data, events, keyExtractor})
    this.panResponder ||= PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        const initialDragPosition = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY}

        this.controller.setInitialDragPosition(initialDragPosition)

        if (this.controller.draggedItemData) {
          return true
        }
      },
      onPanResponderMove: (_e, gestate) => {
        this.tt.controller.onMove({gestate})
      },
      onPanResponderRelease: (_e, _gestate) => {
        if (this.controller.draggedItem) {
          this.tt.controller.onDragEnd()
        }
      }
    })

    useEventEmitter(this.controller.getEvents(), "onDragStart", this.tt.onDragItemStart)
    useEventEmitter(this.controller.getEvents(), "onDragEnd", this.tt.onDragItemEnd)
  }

  render() {
    const {data, horizontal, keyExtractor, renderItem} = this.p
    const {cacheKeyExtractor, dataSet} = this.props
    const actualDataSet = useMemo(() => ({
      component: "draggable-sort",
      ...dataSet
    }), [dataSet])

    return (
      <Animated.View
        dataSet={actualDataSet}
        style={this.cache("rootViewStyle", {flexDirection: horizontal ? "row" : "column"}, [horizontal])}
        {...this.tt.panResponder.panHandlers}
      >
        {data.map((item, itemIndex) => (
          <DraggableSortItem
            activeItemStyle={this.p.activeItemStyle}
            cacheKey={cacheKeyExtractor ? cacheKeyExtractor(item) : undefined}
            controller={this.tt.controller}
            item={item}
            itemIndex={itemIndex}
            key={keyExtractor(item)}
            onItemMoved={this.props.onItemMoved}
            renderItem={renderItem}
          />
        ))}
      </Animated.View>
    )
  }

  /**
   * Forward drag-start notifications to the optional parent callback.
   * @param {DraggableSortDragStartArgs} root0
   */
  onDragItemStart = ({itemData}) => {
    if (this.props.onDragItemStart) {
      this.p.onDragItemStart({itemData})
    }
  }

  /**
   * Forward drag-end notifications and persist the reordered list when needed.
   * @param {DraggableSortDragEndArgs} args
   */
  onDragItemEnd = (args) => {
    if (args.toPosition !== null) {
      this.p.onReordered(args)
    }

    if (this.props.onDragItemEnd) {
      this.p.onDragItemEnd(args)
    }
  }
}))
