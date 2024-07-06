import BaseComponent from "../base-component"
import {digg, digs} from "diggerize"
import * as inflection from "inflection"
import PropTypes from "prop-types"
import qs from "qs"
import {memo, useMemo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import urlEncode from "../url-encode.mjs"

import Link from "../link"
import useQueryParams from "on-location-changed/src/use-query-params"

export default memo(shapeComponent(class ApiMakerBootstrapSortLink extends BaseComponent {
  static propTypes = {
    attribute: PropTypes.string.isRequired,
    className: PropTypes.string,
    defaultParams: PropTypes.object,
    linkComponent: PropTypes.object,
    onChanged: PropTypes.func,
    query: PropTypes.object.isRequired,
    title: PropTypes.node
  }

  setup() {
    this.queryParams = useQueryParams()
    this.searchKey = this.p.query.queryArgs.searchKey || "q"
  }

  attribute = () => inflection.underscore(this.p.attribute)

  href () {
    const qParams = this.qParams()
    const {queryParams, searchKey} = this.tt

    qParams.s = `${this.attribute()} ${this.sortMode()}` // eslint-disable-line id-length

    queryParams[searchKey] = JSON.stringify(qParams)

    const newParams = qs.stringify(queryParams, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute () {
    const params = this.qParams()

    if (params.s == this.attribute()) return true
    if (params.s == `${this.attribute()} asc`) return true

    return false
  }

  render () {
    const LinkComponent = this.linkComponent()
    const {attribute, className, defaultParams, linkComponent, onChanged, query, title, ...restProps} = this.props

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

  qParams() {
    const {defaultParams} = this.props
    const {queryParams} = this.tt
    const {searchKey} = digs(this, "searchKey")

    if (searchKey in queryParams) {
      return JSON.parse(queryParams[searchKey])
    } else if (defaultParams) {
      return {...defaultParams}
    }

    return {}
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
}))
