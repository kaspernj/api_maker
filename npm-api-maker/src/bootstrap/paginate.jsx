import instanceOfClassName from "../instance-of-class-name"
import Link from "../link"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import qs from "qs"
import React, {memo} from "react"
import Result from "../result"
import {shapeComponent, ShapeComponent} from "set-state-compare/src/shape-component.js"
import urlEncode from "../url-encode.mjs"

export default memo(shapeComponent(class ApiMakerBootstrapPaginate extends ShapeComponent {
  static propTypes = propTypesExact({
    result: PropTypes.oneOfType([
      instanceOfClassName("ApiMakerResult"),
      PropTypes.instanceOf(Result)
    ]).isRequired
  })

  setup() {
    this.useStates({
      pages: () => this.pages()
    })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.result != this.props.result) {
      this.setState({pages: this.pages()})
    }
  }

  isPageActiveClass (pageNumber) {
    if (this.props.result.currentPage() == pageNumber)
      return "active"
  }

  pages () {
    const currentPage = this.props.result.currentPage()
    const pages = []
    const totalPages = this.props.result.totalPages()
    let pagesFrom = currentPage - 5
    let pagesTo = currentPage + 5

    if (pagesFrom < 1)
      pagesFrom = 1

    if (pagesTo > totalPages)
      pagesTo = totalPages

    for (let i = pagesFrom; i <= pagesTo; i++) {
      pages.push(i)
    }

    return pages
  }

  pagePath (pageNumber) {
    let pageKey = this.props.result.data.collection.queryArgs.pageKey

    if (!pageKey) {
      pageKey = "page"
    }

    const currentParams = qs.parse(globalThis.location.search.substr(1))
    currentParams[pageKey] = pageNumber
    const newParams = qs.stringify(currentParams, {encoder: urlEncode})
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  previousPagePath () {
    let previousPage

    if (this.props.result.currentPage() > 1) {
      previousPage = this.props.result.currentPage() - 1
    } else {
      previousPage = this.props.result.currentPage()
    }

    return this.pagePath(previousPage)
  }

  nextPagePath () {
    let nextPage

    if (this.props.result.currentPage() < this.props.result.totalPages()) {
      nextPage = this.props.result.currentPage() + 1
    } else {
      nextPage = this.props.result.currentPage()
    }

    return this.pagePath(nextPage)
  }

  showBackwardsDots () {
    const currentPage = this.props.result.currentPage()
    return (currentPage - 5 > 1)
  }

  showForwardsDots () {
    const currentPage = this.props.result.currentPage()
    const totalPages = this.props.result.totalPages()
    return (currentPage + 5 < totalPages)
  }

  render () {
    const {result} = this.props
    const {pages} = this.state

    return (
      <>
        <ul className="pagination" data-pages-length={pages.length}>
          <li className={`page-item ${result.currentPage() <= 1 ? "disabled" : ""}`} key="page-first">
            <Link className="page-link" to={this.pagePath(1)}>
              ⇤
            </Link>
          </li>
          <li className={`page-item ${result.currentPage() <= 1 ? "disabled" : ""}`} key="page-previous">
            <Link className="page-link" to={this.previousPagePath()}>
              ←
            </Link>
          </li>
          {this.showBackwardsDots() &&
            <li className="page-item">
              <a className="page-link disabled" href="#">
                &hellip;
              </a>
            </li>
          }
          {pages.map((page) =>
            <li className={`page-item ${this.isPageActiveClass(page)}`} key={`page-${page}`}>
              <Link className="page-link" to={this.pagePath(page)}>
                {page}
              </Link>
            </li>
          )}
          {this.showForwardsDots() &&
            <li className="page-item">
              <a className="page-link disabled" href="#">
                &hellip;
              </a>
            </li>
          }
          <li className={`page-item ${result.currentPage() >= result.totalPages() ? "disabled" : ""}`} key="page-next">
            <Link className="page-link" to={this.nextPagePath()}>
              →
            </Link>
          </li>
          <li className={`page-item ${result.currentPage() >= result.totalPages() ? "disabled" : ""}`} key="page-last">
            <Link className="page-link" to={this.pagePath(result.totalPages())}>
              ⇥
            </Link>
          </li>
        </ul>
      </>
    )
  }
}))
