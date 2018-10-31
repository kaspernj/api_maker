import { Link } from "react-router-dom"
import qs from "qs"
import React from "react"

export default class extends React.Component {
  href() {
    if (this.isSortedByAttribute()) {
      var sortMode = "desc"
    } else {
      var sortMode = "asc"
    }

    var currentParams = qs.parse(window.location.search.substr(1))

    if (!currentParams["q"])
      currentParams["q"] = {}

    currentParams["q"]["s"] = `${this.props.attribute} ${sortMode}`

    var newParams = qs.stringify(currentParams)
    var newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute() {
    if (this.props.query.ransackOptions.s == this.props.attribute)
      return true

    if (this.props.query.ransackOptions.s == `${this.props.attribute} asc`)
      return true

    return false
  }

  render() {
    var LinkComponent = this.linkComponent()

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
