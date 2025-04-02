import React, {useMemo} from "react"
import {Animated, PanResponder} from "react-native"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component"
import Controller from "./controller"
import DraggableSortItem from "./item"
import EventEmitter from "events"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import useEventEmitter from "../use-event-emitter"

export default memo(shapeComponent(class DraggableSort extends ShapeComponent {
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
      onPanResponderMove: (e, gestate) => {
        this.tt.controller.onMove({gestate})
      },
      onPanResponderRelease: (e, gestate) => {
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
    const actualDataSet = useMemo(
      () => Object.assign(
        {component: "draggable-sort"},
        dataSet
      ),
      [dataSet]
    )

    return (
      <Animated.View
        dataSet={actualDataSet}
        style={this.rootViewStyle ||= {flexDirection: horizontal ? "row" : "column"}}
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
