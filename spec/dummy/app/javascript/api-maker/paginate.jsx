import { Link } from "react-router-dom"
import qs from "qs"
import React from "react"

export default class extends React.Component {
  isPageActiveClass(pageNumber) {
    if (this.props.result.currentPage() == pageNumber)
      return "active"
  }

  pages() {
    const currentPage = this.props.result.currentPage()
    const pages = []
    const totalPages = this.props.result.totalPages()
    const pagesFrom = currentPage - 5
    const pagesTo = currentPage + 5

    if (pagesFrom < 1)
      pagesFrom = 1

    if (pagesTo > totalPages)
      pagesTo = totalPages

    for(const i = pagesFrom; i <= pagesTo; i++) {
      pages.push(i)
    }

    return pages
  }

  pagePath(pageNumber) {
    const pageKey = this.props.result.data.collection.queryArgs.pageKey
    if (!pageKey)
      pageKey = "page"

    const currentParams = qs.parse(window.location.search.substr(1))
    currentParams[pageKey] = pageNumber
    const newParams = qs.stringify(currentParams)
    const newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  previousPagePath() {
    let previousPage

    if (this.props.result.currentPage() > 1) {
      previousPage = this.props.result.currentPage() - 1
    } else {
      previousPage = this.props.result.currentPage()
    }

    return this.pagePath(previousPage)
  }

  nextPagePath() {
    let nextPage

    if (this.props.result.currentPage() < this.props.result.totalPages()) {
      nextPage = this.props.result.currentPage() + 1
    } else {
      nextPage = this.props.result.currentPage()
    }

    return this.pagePath(nextPage)
  }

  showBackwardsDots() {
    const currentPage = this.props.result.currentPage()
    return (currentPage - 5 > 1)
  }

  showForwardsDots() {
    const currentPage = this.props.result.currentPage()
    const totalPages = this.props.result.totalPages()
    return (currentPage + 5 < totalPages)
  }

  render() {
    return (
      <ul className="pagination">
        <li className={`page-item ${this.props.result.currentPage() <= 1 ? "disabled" : ""}`} key="page-first">
          <Link className="page-link" to={this.pagePath(1)}>
            ⇤
          </Link>
        </li>
        <li className={`page-item ${this.props.result.currentPage() <= 1 ? "disabled" : ""}`} key="page-previous">
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
        {this.pages().map(page =>
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
        <li className={`page-item ${this.props.result.currentPage() >= this.props.result.totalPages() ? "disabled" : ""}`} key="page-next">
          <Link className="page-link" to={this.nextPagePath()}>
            →
          </Link>
        </li>
        <li className={`page-item ${this.props.result.currentPage() >= this.props.result.totalPages() ? "disabled" : ""}`} key="page-last">
          <Link className="page-link" to={this.pagePath(this.props.result.totalPages())}>
            ⇥
          </Link>
        </li>
      </ul>
    )
  }
}
