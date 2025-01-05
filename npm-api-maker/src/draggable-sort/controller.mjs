import {digg} from "diggerize"
import EventEmitter from "events"

export default class DraggableSortController {
  constructor({data, keyExtractor}) {
    this.data = data
    this.currentOrder = [...data]
    this.events = new EventEmitter()
    this.keyExtractor = keyExtractor

    this.draggedItem = null
    this.draggedItemData = null
    this.draggedItemNewPosition = null

    this.draggedOverItem = null
    this.draggedOverItemData = null

    this.itemData = {}

    for (const itemIndex in data) {
      this.itemData[itemIndex] = {
        index: itemIndex,
        item: data[itemIndex],
        position: itemIndex
      }
    }
  }

  isOverOtherItem = ({position}) => {
    console.log("isOverOtherItem", {position})
  }

  getEvents = () => this.events
  getItemDataForItem = (item) => this.getItemDataForIndex(this.data.indexOf(item))
  getItemDataForKey = (key) => this.itemData.find((itemDataI) => digg(itemDataI, "key") == key)
  getItemDataForIndex = (index) => digg(this, "itemData", index)

  onDragStart = ({item, itemIndex}) => {
    if (item) {
      this.draggedItem = item
      this.draggedItemData = this.getItemDataForIndex(itemIndex)
      this.draggedItemIndex = itemIndex
      this.events.emit("draggingItem", {itemData: this.draggedItemData})
    }
  }

  onDragEnd = () => {
    const itemData = this.draggedItemData
    const fromIndex = itemData.index
    const toPosition = this.draggedItemNewPosition

    this.draggedItemData.events.emit("resetPosition")

    const fromItem = this.draggedItem
    const toItem = this.draggedOverItem

    this.draggedItem = null
    this.draggedItemData = null
    this.draggedItemNewPosition = null

    this.draggedOverItem = null
    this.draggedOverItemData = null

    this.events.emit("dragEnd", {itemData, fromIndex, fromItem, toItem, toPosition})
  }

  onItemLayout = ({events, index, item, layout}) => {
    if (!(index in this.itemData)) throw new Error(`Item not found for index ${index}`)

    const key = this.keyExtractor(item)

    this.itemData[index].baseX = layout.x
    this.itemData[index].events = events
    this.itemData[index].layout = layout
    this.itemData[index].key = key
  }

  onMove = ({gestate}) => {
    // Send move-event to the item being dragged so it will actually move around
    this.draggedItemData?.events?.emit("move", {gestate})

    let found = false
    const moveX = gestate.dx + this.initialDragPosition.x

    for (const itemIndex in this.itemData) {
      const itemData = this.getItemDataForIndex(itemIndex)
      const baseX = digg(itemData, "baseX")
      let smallestWidth = this.draggedItemData.layout.width

      if (itemData.layout.width < smallestWidth) smallestWidth = itemData.layout.width

      if (moveX > baseX && moveX < (baseX + smallestWidth) && itemIndex != this.draggedItemData.index) {
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
        this.draggedOverItem = null
        this.draggedOverItemData = null

        found = true
      }
    }

    // Nothing was found - unset draggedOverItem
    if (!found) {
      this.draggedOverItem = null
      this.draggedOverItemData = null
    }
  }

  setInitialDragPosition = (initialDragPosition) => {
    this.initialDragPosition = initialDragPosition
  }

  updatePositionOfItems() {
    let currentPosition = 0

    for (const item of this.currentOrder) {
      const itemData = this.getItemDataForItem(item)

      if (digg(itemData, "index") != digg(this, "draggedItemData", "index")) { // Dont animate dragged element to a new position because it is currently being dragged
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
