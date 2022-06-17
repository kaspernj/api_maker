import React from "react"

export default class Link extends React.PureComponent {
  render() {
    const {to, onClick, ...restProps} = this.props

    return (
      <a href={to} {...restProps} onClick={this.onLinkClicked} />
    )
  }

  onLinkClicked = (e, ...restArgs) => {
    const {onClick} = this.props

    if (onClick) onClick(e, ...restArgs)

    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()

      const history = global.apiMakerConfigGlobal?.history

      if (!history) throw new Error("History hasn't been set in the API maker configuration")

      history.push(this.props.to)
    }
  }
}
