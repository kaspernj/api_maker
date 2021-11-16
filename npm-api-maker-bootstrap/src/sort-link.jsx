const {digg, digs} = require("diggerize")
const {LocationChanged} = require("on-location-changed/location-changed-component")
const inflection = require("inflection")
const {Link} = require("react-router-dom")
const PropTypes = require("prop-types")
const qs = require("qs")
const React = require("react")

export default class ApiMakerBootstrapSortLink extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string.isRequired,
    className: PropTypes.string,
    linkComponent: PropTypes.object,
    onChanged: PropTypes.func,
    query: PropTypes.object.isRequired,
    title: PropTypes.node
  }

  currentParams = this.calculatedCurrentParams()
  searchKey = digg(this, "props", "query", "queryArgs").searchKey || "q"

  state = {
    href: this.href(),
    sortMode: this.sortMode()
  }

  attribute() {
    return inflection.underscore(this.props.attribute)
  }

  calculatedCurrentParams() {
    return qs.parse(global.location.search.substr(1))
  }

  href() {
    const {currentParams, searchKey} = digs(this, "currentParams", "searchKey")

    if (!currentParams[searchKey]) currentParams[searchKey] = {}

    currentParams[searchKey].s = `${this.attribute()} ${this.sortMode()}` // eslint-disable-line id-length

    const newParams = qs.stringify(currentParams)
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute() {
    const {currentParams, searchKey} = digs(this, "currentParams", "searchKey")
    const params = currentParams[searchKey] || {}

    if (params.s == this.attribute()) return true
    if (params.s == `${this.attribute()} asc`) return true

    return false
  }

  render() {
    const LinkComponent = this.linkComponent()
    const {attribute, className, linkComponent, onChanged, query, title, ...restProps} = this.props
    const {href, sortMode} = digs(this.state, "href", "sortMode")

    return (
      <>
        <LocationChanged onChanged={this.onLocationChanged} />
        <LinkComponent
          className={this.className()}
          data-attribute={attribute}
          data-sort-mode={sortMode}
          to={href}
          {...restProps}
        >
          {this.title()}
        </LinkComponent>
      </>
    )
  }

  className() {
    const classNames = ["component-api-maker-bootstrap-sort-link"]

    if (this.props.className) classNames.push(this.props.className)

    return classNames.join(" ")
  }

  linkComponent() {
    if (this.props.linkComponent) return this.props.linkComponent

    return Link
  }

  onLocationChanged = () => {
    this.currentParams = this.calculatedCurrentParams()

    this.setState({
      href: this.href(),
      sortMode: this.sortMode()
    })
  }

  sortMode() {
    if (this.isSortedByAttribute()) return "desc"

    return "asc"
  }

  title() {
    const {attribute, query} = digs(this.props, "attribute", "query")
    const {title} = this.props

    if (title) return title

    return query.modelClass().humanAttributeName(attribute)
  }
}
