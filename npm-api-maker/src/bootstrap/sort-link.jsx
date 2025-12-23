import BaseComponent from "../base-component.js"
import * as inflection from "inflection"
import Icon from "../utils/icon"
import PropTypes from "prop-types"
import qs from "qs"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import Text from "../utils/text"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import urlEncode from "../url-encode.js"
import useSorting from "../table/use-sorting.js"

import Link from "../link"
import useQueryParams from "on-location-changed/build/use-query-params.js"

export default memo(shapeComponent(class ApiMakerBootstrapSortLink extends BaseComponent {
  static propTypes = {
    attribute: PropTypes.string.isRequired,
    className: PropTypes.string,
    defaultParams: PropTypes.object,
    linkComponent: PropTypes.object,
    onChanged: PropTypes.func,
    query: PropTypes.object.isRequired,
    title: PropTypes.any
  }

  setup() {
    const {attribute, defaultParams, query} = this.props
    const {qParams, searchKey, sortAttribute, sortMode} = useSorting({defaultParams, query})

    this.setInstance({
      isSortedByAttribute: sortAttribute == attribute,
      qParams,
      searchKey,
      sortMode
    })

    this.queryParams = useQueryParams()
    this.searchKey = this.p.query.queryArgs.searchKey || "q"
    this.attribute = inflection.underscore(this.p.attribute)
  }

  href () {
    const qParams = Object.assign({}, this.tt.qParams)
    const {attribute, queryParams, searchKey, sortMode} = this.tt
    const newQueryParams = {...queryParams}

    qParams.s = `${attribute} ${sortMode == "asc" ? "desc" : "asc"}` // eslint-disable-line id-length

    newQueryParams[searchKey] = JSON.stringify(qParams)

    const newParams = qs.stringify(newQueryParams, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  render () {
    const {isSortedByAttribute, sortMode} = this.tt
    const LinkComponent = this.linkComponent()
    const {attribute, className, dataSet, defaultParams, linkComponent, onChanged, query, style, textProps, title, ...restProps} = this.props
    const actualDataSet = Object.assign(
      {
        attribute,
        class: className,
        component: "api-maker/bootstrap/sort-link",
        sortMode: this.tt.sortMode
      },
      dataSet
    )
    const actualStyle = Object.assign(
      {display: "flex", flexDirection: "row", alignItems: "center"},
      style
    )

    return (
      <LinkComponent
        dataSet={actualDataSet}
        style={actualStyle}
        to={this.href()}
        {...restProps}
      >
        <Text {...textProps}>
          {this.title()}
        </Text>
        {isSortedByAttribute && sortMode == "asc" &&
          <Icon name="chevron-down" size={14} style={this.cache("downIconStyle", {marginLeft: 3})} />
        }
        {isSortedByAttribute && sortMode == "desc" &&
          <Icon name="chevron-up" size={14} style={this.cache("upIconStyle", {marginLeft: 3})} />
        }
      </LinkComponent>
    )
  }

  linkComponent = () => this.props.linkComponent || Link

  title () {
    const {attribute, query} = this.p
    const {title} = this.props

    if (title) return title

    return query.modelClass().humanAttributeName(attribute)
  }
}))
