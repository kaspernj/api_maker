import {digg, digs} from "diggerize"
import inflection from "inflection"
import PropTypes from "prop-types"
import qs from "qs"
import React from "react"

import Link from "../link"
import PureComponent from "set-state-compare/src/pure-component"
import withQueryParams from "on-location-changed/src/with-query-params"

class ApiMakerBootstrapSortLink extends PureComponent {
  static propTypes = {
    attribute: PropTypes.string.isRequired,
    className: PropTypes.string,
    linkComponent: PropTypes.object,
    onChanged: PropTypes.func,
    query: PropTypes.object.isRequired,
    queryParams: PropTypes.object.isRequired,
    title: PropTypes.node
  }

  searchKey = digg(this, "props", "query", "queryArgs").searchKey || "q"

  attribute () {
    return inflection.underscore(this.props.attribute)
  }

  href () {
    const {queryParams} = digs(this.props, "queryParams")
    const {searchKey} = digs(this, "searchKey")

    if (!queryParams[searchKey]) queryParams[searchKey] = {}

    queryParams[searchKey].s = `${this.attribute()} ${this.sortMode()}` // eslint-disable-line id-length

    const newParams = qs.stringify(queryParams)
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute () {
    const {queryParams} = digs(this.props, "queryParams")
    const {searchKey} = digs(this, "searchKey")
    const params = queryParams[searchKey] || {}

    if (params.s == this.attribute()) return true
    if (params.s == `${this.attribute()} asc`) return true

    return false
  }

  render () {
    const LinkComponent = this.linkComponent()
    const {attribute, className, linkComponent, onChanged, query, queryParams, title, ...restProps} = this.props

    return (
      <>
        <LinkComponent
          className={this.className()}
          data-attribute={attribute}
          data-sort-mode={this.sortMode()}
          to={this.href()}
          {...restProps}
        >
          {this.title()}
        </LinkComponent>
      </>
    )
  }

  className () {
    const classNames = ["component-api-maker-bootstrap-sort-link"]

    if (this.props.className) classNames.push(this.props.className)

    return classNames.join(" ")
  }

  linkComponent () {
    if (this.props.linkComponent) return this.props.linkComponent

    return Link
  }

  sortMode () {
    if (this.isSortedByAttribute()) return "desc"

    return "asc"
  }

  title () {
    const {attribute, query} = digs(this.props, "attribute", "query")
    const {title} = this.props

    if (title) return title

    return query.modelClass().humanAttributeName(attribute)
  }
}

export default withQueryParams(ApiMakerBootstrapSortLink)
