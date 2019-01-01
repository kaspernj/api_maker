import { Link } from "react-router-dom"
import qs from "qs"
import React from "react"

export default class extends React.Component {
  isPageActiveClass(pageNumber) {
    if (this.props.result.currentPage() == pageNumber)
      return "active"
  }

  pages() {
    let currentPage = this.props.result.currentPage()
    let pages = []
    let totalPages = this.props.result.totalPages()
    let pagesFrom = currentPage - 5
    let pagesTo = currentPage + 5

    if (pagesFrom < 1)
      pagesFrom = 1

    if (pagesTo > totalPages)
      pagesTo = totalPages

    for(let i = pagesFrom; i < pagesTo; i++) {
      pages.push(i)
    }

    return pages
  }

  pagePath(pageNumber) {
    let pageKey = this.props.result.data.collection.pageKeyValue
    if (!pageKey)
      pageKey = "page"

    let currentParams = qs.parse(window.location.search.substr(1))
    currentParams[pageKey] = pageNumber
    let newParams = qs.stringify(currentParams)
    let newPath = `${location.pathname}?${newParams}`

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
    let currentPage = this.props.result.currentPage()

    return (currentPage - 5 > 1)
  }

  showForwardsDots() {
    let currentPage = this.props.result.currentPage()
    let totalPages = this.props.result.totalPages()

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
        {this.pages().map((page) =>
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
