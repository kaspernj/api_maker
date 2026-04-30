// @ts-check
import {jest} from "@jest/globals"
import moveDraggedColumnPosition from "../src/table/move-dragged-column-position.js"

describe("moveDraggedColumnPosition", () => {
  it("updates the dragged item's animated position directly", () => {
    const animatedPosition = {setValue: jest.fn()}

    moveDraggedColumnPosition({item: {animatedPosition}, x: 12, y: 34})

    expect(animatedPosition.setValue).toHaveBeenCalledWith({x: 12, y: 34})
  })

  it("starts an animation when animation args are passed", () => {
    const animatedPosition = {setValue: jest.fn()}
    const animationArgs = {duration: 100, toValue: {x: 0, y: 0}, useNativeDriver: false}
    const start = jest.fn()
    const timing = jest.fn(() => ({start}))

    moveDraggedColumnPosition({
      animationArgs,
      item: {animatedPosition},
      timing
    })

    expect(timing).toHaveBeenCalledWith(animatedPosition, animationArgs)
    expect(start).toHaveBeenCalledWith()
  })

  it("fails fast when the dragged item has no animated position", () => {
    expect(() => moveDraggedColumnPosition({item: {}, x: 12, y: 34})).toThrow("Expected dragged table column to have an animated position")
  })
})
