const React = require("react")
import {act, create} from "react-test-renderer"
import CanCanLoader from "../src/can-can-loader"
const CanCan = require("../src/can-can.cjs")
const canCan = CanCan.current()
import {Shape} from "set-state-compare"

class StateComponent extends React.Component {
  state = {}

  render() {
    return null
  }
}

class ShapeComponent extends React.Component {
  shape = new Shape(this, {})

  render() {
    return null
  }
}

canCan.loadAbilities = jest.fn(async() => true)

describe("CanCanLoader", () => {
  it("loads the abilities initially and updates its state",async() => {
    let component

    act(() => {
      component = create(<StateComponent />)
    })

    let canCanLoader

    act(() => {canCanLoader = create(<CanCanLoader abilities={[["admin", ["access"]]]} component={component.getInstance()} />)})

    expect(canCan.loadAbilities).toHaveBeenCalled()
    await(() => expect(component.getInstance().state).toBe({canCan: CanCan.current()}))
  })

  it("resets and reloads when abilities are reset",async() => {
    let component

    act(() => {
      component = create(<StateComponent />)
    })

    let canCanLoader

    act(() => {
      canCanLoader = create(<CanCanLoader abilities={[["admin", ["access"]]]} component={component.getInstance()} />)
    })

    await act(async() => {
      await canCan.resetAbilities()
    })

    await(() => expect(component.getInstance().state).toBe({canCan: undefined}))
    await(() => expect(component.getInstance().state).toBe({canCan: CanCan.current()}))
  })

  it("loads the abilities initially and updates its shape",async() => {
    let component

    act(() => {
      component = create(<ShapeComponent />)
    })

    let canCanLoader

    act(() => {canCanLoader = create(<CanCanLoader abilities={[["admin", ["access"]]]} component={component.getInstance()} />)})

    expect(canCan.loadAbilities).toHaveBeenCalledWith([["admin", ["access"]]])
    await(() => expect(component.getInstance().shape).toBe({canCan: CanCan.current()}))
  })
})
