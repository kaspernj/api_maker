import React, {useMemo} from "react"
import {Animated, PanResponder} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import Controller from "./controller.js"
import DraggableSortItem from "./item"
import {EventEmitter} from "eventemitter3"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "../use-event-emitter.js"

const AnimatedView = /** @type {any} */ (Animated.View)

export default memo(shapeComponent(class DraggableSort extends ShapeComponent {
  /** @type {Controller|undefined} */
  controller
  /** @type {any} */
  panResponder

  static defaultProps = {
    horizontal: false
  }

  static propTypes = propTypesExact({
    cacheKeyExtractor: PropTypes.func,
    data: PropTypes.array.isRequired,
    dataSet: PropTypes.object,
    events: PropTypes.instanceOf(EventEmitter),
    horizontal: PropTypes.bool.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    onDragItemEnd: PropTypes.func,
    onDragItemStart: PropTypes.func,
    onItemMoved: PropTypes.func,
    onReordered: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired
  })

  setup() {
    const {data, keyExtractor} = this.p
    const {events} = this.p

    this.controller ||= new Controller({data, events, keyExtractor})
    this.panResponder ||= PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        const eventAny = /** @type {any} */ (e)
        const initialDragPosition = {x: eventAny.nativeEvent.locationX, y: eventAny.nativeEvent.locationY}

        this.controller.setInitialDragPosition(initialDragPosition)

        if (this.controller.draggedItemData) {
          return true
        }
      },
      onPanResponderMove: (_e, gestate) => {
        this.tt.controller.onMove({gestate})
      },
      onPanResponderRelease: () => {
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
    const {cacheKeyExtractor, dataSet} = this.p
    const actualDataSet = useMemo(
      () => Object.assign(
        {component: "draggable-sort"},
        dataSet
      ),
      [dataSet]
    )

    return (
      <AnimatedView
        dataSet={actualDataSet}
        style={this.cache("rootViewStyle", {flexDirection: horizontal ? "row" : "column"}, [horizontal])}
        {...this.tt.panResponder.panHandlers}
      >
        {data.map((item, itemIndex) =>
          <DraggableSortItem
            cacheKey={cacheKeyExtractor ? cacheKeyExtractor(item) : undefined}
            controller={this.tt.controller}
            item={item}
            itemIndex={itemIndex}
            key={keyExtractor(item)}
            onItemMoved={this.props.onItemMoved}
            renderItem={renderItem}
          />
        )}
      </Animated.View>
    )
  }

  onDragItemStart = ({itemData}) => {
    if (this.props.onDragItemStart) {
      this.p.onDragItemStart({itemData})
    }
  }

  onDragItemEnd = (args) => {
    if (args.toPosition !== null) {
      this.p.onReordered(args)
    }

    if (this.props.onDragItemEnd) {
      this.p.onDragItemEnd(args)
    }
  }
}))
