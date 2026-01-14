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

export default memo(shapeComponent(class DraggableSort extends ShapeComponent {
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
        {data.map((item, itemIndex) => ( // eslint-disable-line no-extra-parens
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
