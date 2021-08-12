const inflection = require("inflection")
const { Link } = require("react-router-dom")
const qs = require("qs")
const React = require("react")

export default class ApiMakerBootstrapSortLink extends React.Component {
  constructor(props) {
    super(props)
    const searchKey = this.props.query.queryArgs.searchKey || "q"
    this.state = {searchKey}
  }

  attribute() {
    return inflection.underscore(this.props.attribute)
  }

  href() {
    const currentParams = qs.parse(global.location.search.substr(1))

    if (!currentParams[this.state.searchKey])
      currentParams[this.state.searchKey] = {}

    currentParams[this.state.searchKey]["s"] = `${this.attribute()} ${this.sortMode()}`

    const newParams = qs.stringify(currentParams)
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  isSortedByAttribute() {
    if (this.props.query.queryArgs.ransack && this.props.query.queryArgs.ransack.s == this.attribute())
      return true

    if (this.props.query.queryArgs.ransack && this.props.query.queryArgs.ransack.s == `${this.attribute()} asc`)
      return true

    return false
  }

  render() {
    const LinkComponent = this.linkComponent()
    const { attribute, className, linkComponent, query, title, ...other } = this.props

    return (
      <LinkComponent {...other} className={this.className()} data-attribute={attribute} data-sort-mode={this.sortMode()} to={this.href()}>
        {this.title()}
      </LinkComponent>
    )
  }

  className() {
    const classNames = ["component-api-maker-bootstrap-sort-link"]

    if (this.props.className)
      classNames.push(this.props.className)

    return classNames.join(" ")
  }

  linkComponent() {
    if (this.props.linkComponent) {
      return this.props.linkComponent
    } else {
      return Link
    }
  }

  sortMode() {
    if (this.isSortedByAttribute()) {
      return "desc"
    } else {
      return "asc"
    }
  }

  title() {
    if (this.props.title)
      return this.props.title

    return this.props.query.modelClass().humanAttributeName(this.props.attribute)
  }
}
