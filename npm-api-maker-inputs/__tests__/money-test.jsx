import Adapter from "enzyme-adapter-react-16"
import Enzyme, { shallow } from "enzyme"
import Money from "../src/input"
import React from "react"

Enzyme.configure({adapter: new Adapter()})

test("shows currency options by default", () => {
  const wrapper = shallow(
    <Money currenciesCollection={["DKK"]} />
  )

  expect(wrapper.find(".component-bootstrap-money-input")).toBeTruthy()
})

test("hides currency options", () => {
  const wrapper = shallow(
    <Money currenciesCollection={["DKK"]} showCurrencyOptions={false} />
  )

  expect(wrapper.find(".component-bootstrap-money-input").exists()).toBeFalsy()
})
