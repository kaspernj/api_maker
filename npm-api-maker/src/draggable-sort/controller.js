// @ts-check
import {digg} from "diggerize"
import {EventEmitter} from "eventemitter3" // eslint-disable-line sort-imports

/** @typedef {import("eventemitter3").EventEmitter} DraggableSortEventEmitter */
/** @typedef {import("react-native").LayoutRectangle} DraggableSortLayout */
/** @typedef {import("react-native").PanResponderGestureState} DraggableSortGestureState */
/** @typedef {{x: number, y: number}} DraggableSortPosition */
/** @typedef {(item: object) => string} DraggableSortKeyExtractor */
/**
 * @typedef {object} DraggableSortItemData
 * @property {number} index
 * @property {object} item
 * @property {number} position
 * @property {number} [baseX]
 * @property {DraggableSortEventEmitter} [events]
 * @property {DraggableSortLayout} [initialLayout]
 * @property {string} [key]
 * @property {DraggableSortLayout} [layout]
 */
/**
 * @typedef {object} DraggableSortDragEndArgs
 * @property {number} fromIndex
 * @property {object} fromItem
 * @property {number} fromPosition
 * @property {object} item
 * @property {DraggableSortItemData} itemData
 * @property {object|null} toItem
 * @property {number|null} toPosition
 */

/** Controller for drag-sort row state and events. */
export default class DraggableSortController {
  /**
   * Set up drag-sort state for a list of draggable items.
   * @param {object} root0
   * @param {object[]} root0.data
   * @param {DraggableSortEventEmitter} [root0.events]
   * @param {DraggableSortKeyExtractor} root0.keyExtractor
   */
  constructor({data, events, keyExtractor}) {
    this.data = /** @type {object[]} */ (data)
    this.currentOrder = /** @type {object[]} */ ([...data])
    this.events = /** @type {DraggableSortEventEmitter} */ (events || new EventEmitter())
    this.keyExtractor = /** @type {DraggableSortKeyExtractor} */ (keyExtractor)
    this.draggedItem = /** @type {object|null} */ (null)
    this.draggedItemData = /** @type {DraggableSortItemData|null} */ (null)
    this.draggedItemNewPosition = /** @type {number|null} */ (null)
    this.draggedOverItem = /** @type {object|null} */ (null)
    this.draggedOverItemData = /** @type {DraggableSortItemData|null} */ (null)
    this.itemData = /** @type {Record<number, DraggableSortItemData>} */ ({})

    for (const [itemIndex, item] of data.entries()) {
      this.itemData[itemIndex] = {
        index: itemIndex,
        item,
        position: itemIndex
      }
    }
  }

  /** @returns {DraggableSortEventEmitter} */
  getEvents = () => this.events

  /**
   * Return the tracked drag metadata for the given item instance.
   * @param {object} item
   * @returns {DraggableSortItemData|undefined}
   */
  getItemDataForItem = (item) => this.getItemDataForIndex(this.data.indexOf(item))

  /**
   * Look up item metadata by its extracted stable key.
   * @param {string} key
   * @returns {DraggableSortItemData|undefined}
   */
  getItemDataForKey = (key) => Object.values(this.itemData).find((itemDataI) => digg(itemDataI, "key") == key)

  /**
   * Return the tracked drag metadata stored for a list index.
   * @param {number} index
   * @returns {DraggableSortItemData|undefined}
   */
  getItemDataForIndex = (index) => digg(this, "itemData", index)

  /**
   * Mark an item as the active dragged row and publish the drag-start event.
   * @param {object} root0
   * @param {object} root0.item
   * @param {number} root0.itemIndex
   */
  onDragStart = ({item, itemIndex}) => {
    if (item) {
      this.draggedItem = item
      this.draggedItemData = this.getItemDataForIndex(itemIndex)
      if (!this.draggedItemData) throw new Error(`Item data not found for index ${itemIndex}`)

      this.draggedItemIndex = itemIndex
      this.draggedItemPosition = this.draggedItemData.position
      this.events.emit("onDragStart", {item, itemData: this.draggedItemData})
    }
  }

  /** Finish the current drag and notify listeners about the final ordering. */
  onDragEnd = () => {
    if (!this.draggedItemData || !this.draggedItem) throw new Error("Cannot end drag without an active dragged item")

    const itemData = this.draggedItemData
    const fromIndex = itemData.index
    const fromPosition = digg(this, "draggedItemPosition")
    const toPosition = this.draggedItemNewPosition
    const fromItem = this.draggedItem
    const toItem = this.draggedOverItem

    /** @type {DraggableSortDragEndArgs} */
    const callbackArgs = {item: itemData.item, itemData, fromIndex, fromItem, fromPosition, toItem, toPosition}

    this.draggedItemData.events.emit("resetPosition", {
      callback: () => {
        this.events.emit("onDragEndAnimation", callbackArgs)
      }
    })

    this.draggedItem = null
    this.draggedItemData = null
    this.draggedItemNewPosition = null

    this.draggedOverItem = null
    this.draggedOverItemData = null

    this.events.emit("onDragEnd", callbackArgs)
  }

  /**
   * Store layout data and event bindings for a rendered draggable item.
   * @param {object} root0
   * @param {DraggableSortEventEmitter} root0.events
   * @param {number} root0.index
   * @param {object} root0.item
   * @param {DraggableSortLayout} root0.layout
   */
  onItemLayout = ({events, index, item, layout}) => {
    if (!(index in this.itemData)) throw new Error(`Item not found for index ${index}`)

    const itemData = this.itemData[index]

    itemData.layout = layout

    if (!itemData.initialLayout) {
      itemData.baseX = layout.x
      itemData.events = events
      itemData.initialLayout = layout
      itemData.key = this.keyExtractor(item)
    }
  }

  /**
   * Update ordering as the active dragged item crosses other item positions.
   * @param {object} root0
   * @param {DraggableSortGestureState} root0.gestate
   */
  onMove = ({gestate}) => {
    if (!this.draggedItemData || !this.initialDragPosition) return

    // Send move-event to the item being dragged so it will actually move around
    this.draggedItemData?.events?.emit("move", {gestate})

    const moveX = gestate.dx + this.initialDragPosition.x

    for (const itemData of Object.values(this.itemData)) {
      const baseX = digg(itemData, "baseX")
      let smallestWidth = this.draggedItemData.layout.width

      if (itemData.layout.width < smallestWidth) smallestWidth = itemData.layout.width

      if (moveX > baseX && moveX < baseX + smallestWidth && itemData.index != this.draggedItemData.index) {
        this.draggedOverItem = itemData.item
        this.draggedOverItemData = itemData

        const positionOfDraggedItem = this.currentOrder.indexOf(this.draggedItemData.item)
        const positionOfOverItem = this.currentOrder.indexOf(this.draggedOverItemData.item)

        this.currentOrder[positionOfDraggedItem] = this.draggedOverItemData.item
        this.currentOrder[positionOfOverItem] = this.draggedItemData.item

        this.draggedItemData.position = positionOfOverItem
        this.draggedOverItemData.position = positionOfDraggedItem

        this.updatePositionOfItems()
        this.draggedItemNewPosition = positionOfOverItem
      }
    }
  }

  /**
   * Store the touch position where the current drag gesture started.
   * @param {DraggableSortPosition} initialDragPosition
   */
  setInitialDragPosition = (initialDragPosition) => {
    this.initialDragPosition = initialDragPosition
  }

  /** Animate non-dragged items into their current ordered positions. */
  updatePositionOfItems() {
    let currentPosition = 0

    for (const item of this.currentOrder) {
      const itemData = this.getItemDataForItem(item)

      if (!itemData) throw new Error("Could not find item data while updating positions")

      if (digg(itemData, "index") != digg(this, "draggedItemData", "index")) {
        // Dont animate dragged element to a new position because it is currently being dragged
        itemData.events.emit("moveToPosition", {
          x: currentPosition,
          y: 0
        })
      }

      itemData.baseX = currentPosition
      currentPosition += digg(itemData, "layout", "width")
    }
  }
}
