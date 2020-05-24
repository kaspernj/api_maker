export default function setStateAsync(component, state) {
  return new Promise((resolve) => {
    component.setState(state, resolve)
  })
}
