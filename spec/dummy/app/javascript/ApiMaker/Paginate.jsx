import { Link } from "react-router-dom"
import qs from "qs"
import React from "react"

export default class extends React.Component {
  isPageActiveClass(pageNumber) {
    if (this.props.result.currentPage() == pageNumber)
      return "active"
  }

  pages() {
    var pages = []
    for(var i = 0; i < this.props.result.totalPages(); i++) {
      pages.push(i + 1)
    }

    return pages
  }

  pagePath(pageNumber) {
    var currentParams = qs.parse(window.location.search.substr(1))
    currentParams["page"] = pageNumber
    var newParams = qs.stringify(currentParams)
    var newPath = `${location.pathname}?${newParams}`

    return newPath
  }

  previousPagePath() {
    if (this.props.result.currentPage() > 1) {
      var previousPage = this.props.result.currentPage() - 1
    } else {
      var previousPage = this.props.result.currentPage()
    }

    return this.pagePath(previousPage)
  }

  nextPagePath() {
    if (this.props.result.currentPage() < this.props.result.totalPages()) {
      var nextPage = this.props.result.currentPage() + 1
    } else {
      var nextPage = this.props.result.currentPage()
    }

    return this.pagePath(nextPage)
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
        {this.pages().map((page) =>
          <li className={`page-item ${this.isPageActiveClass(page)}`} key={`page-${page}`}>
            <Link className="page-link" to={this.pagePath(page)}>
              {page}
            </Link>
          </li>
        )}
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
