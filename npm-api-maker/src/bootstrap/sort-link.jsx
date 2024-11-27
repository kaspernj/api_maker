import BaseComponent from "../base-component"
import * as inflection from "inflection"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import PropTypes from "prop-types"
import qs from "qs"
import {memo} from "react"
import Text from "../utils/text"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import urlEncode from "../url-encode.mjs"
import useSorting from "../table/use-sorting.mjs"

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
    const {attribute, className, defaultParams, linkComponent, onChanged, query, style, textProps, title, ...restProps} = this.props
    const actualStyle = Object.assign(
      {display: "flex", flexDirection: "row", alignItems: "center"},
      style
    )

    return (
      <LinkComponent
        dataSet={{
          attribute,
          class: className,
          component: "api-maker/bootstrap/sort-link",
          sortMode: this.tt.sortMode
        }}
        style={actualStyle}
        to={this.href()}
        {...restProps}
      >
        <Text {...textProps}>
          {this.title()}
        </Text>
        {isSortedByAttribute && sortMode == "asc" &&
          <FontAwesomeIcon name="chevron-down" size={14} style={{marginLeft: 3}} />
        }
        {isSortedByAttribute && sortMode == "desc" &&
          <FontAwesomeIcon name="chevron-up" size={14} style={{marginLeft: 3}} />
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
