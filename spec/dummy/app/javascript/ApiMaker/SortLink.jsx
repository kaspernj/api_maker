import changeCase from "change-case"
import { Link } from "react-router-dom"
import qs from "qs"
import React from "react"

export default class extends React.Component {
  constructor(props) {
    super(props)

    let searchKey = this.props.query.searchKeyValue
    if (!searchKey)
      searchKey = "q"

    this.state = {searchKey: searchKey}
  }

  attribute() {
    return changeCase.snake(this.props.attribute)
  }

  href() {
    let sortMode

    if (this.isSortedByAttribute()) {
      sortMode = "desc"
    } else {
      sortMode = "asc"
    }

    let currentParams = qs.parse(window.location.search.substr(1))

    if (!currentParams[this.state.searchKey])
      currentParams[this.state.searchKey] = {}

    currentParams[this.state.searchKey]["s"] = `${this.attribute()} ${sortMode}`

    let newParams = qs.stringify(currentParams)
    let newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute() {
    if (this.props.query.args.ransack.s == this.attribute())
      return true

    if (this.props.query.args.ransack.s == `${this.attribute()} asc`)
      return true

    return false
  }

  render() {
    let LinkComponent = this.linkComponent()

    return (
      <LinkComponent to={this.href()}>
        {this.title()}
      </LinkComponent>
    )
  }

  linkComponent() {
    if (this.props.linkComponent) {
      return this.props.linkComponent
    } else {
      return Link
    }
  }

  title() {
    if (this.props.title)
      return this.props.title

    return this.props.query.modelClass().humanAttributeName(this.props.attribute)
  }
}
