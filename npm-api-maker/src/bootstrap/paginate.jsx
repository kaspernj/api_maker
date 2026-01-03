import React, {useMemo} from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import BaseComponent from "../base-component" // eslint-disable-line sort-imports
import Link from "../link"
import PropTypes from "prop-types"
import Result from "../result.js"
import Text from "../utils/text"
import instanceOfClassName from "../instance-of-class-name.js"
import memo from "set-state-compare/build/memo.js"
import propTypesExact from "prop-types-exact"
import qs from "qs"
import urlEncode from "../url-encode.js"

const FIRST_PAGE_LABEL = "⇤"
const PREVIOUS_PAGE_LABEL = "←"
const NEXT_PAGE_LABEL = "→"
const LAST_PAGE_LABEL = "⇥"
const ELLIPSIS_LABEL = "…"

export default memo(shapeComponent(class ApiMakerBootstrapPaginate extends BaseComponent {
  static propTypes = propTypesExact({
    result: PropTypes.oneOfType([
      instanceOfClassName("ApiMakerResult"),
      PropTypes.instanceOf(Result)
    ]).isRequired
  })

  setup() {
    const {result} = this.p

    this.totalPages = useMemo(
      () => Math.ceil(result.count() / result.perPage()),
      [result.count(), result.perPage()]
    )
    this.pages = useMemo(
      () => this.calculatePages(),
      [result.currentPage(), this.totalPages]
    )
  }

  calculatePages () {
    const {result} = this.p
    const {totalPages} = this.tt
    const currentPage = result.currentPage()
    const pages = []

    let pagesFrom = currentPage - 5
    let pagesTo = currentPage + 5

    if (pagesFrom < 1) {
      pagesFrom = 1
    }

    if (pagesTo > totalPages) {
      pagesTo = totalPages
    }

    for (let i = pagesFrom; i <= pagesTo; i++) {
      pages.push(i)
    }

    return pages
  }

  isPageActiveClass = (pageNumber) => {
    if (this.p.result.currentPage() == pageNumber) {
      return "active"
    }

    return "not-active"
  }

  pagePath (pageNumber) {
    let pageKey = this.p.result.data.collection.queryArgs.pageKey

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
    const {result} = this.p
    let previousPage

    if (result.currentPage() > 1) {
      previousPage = result.currentPage() - 1
    } else {
      previousPage = result.currentPage()
    }

    return this.pagePath(previousPage)
  }

  nextPagePath () {
    const {result} = this.p
    let nextPage

    if (result.currentPage() < this.tt.totalPages) {
      nextPage = result.currentPage() + 1
    } else {
      nextPage = result.currentPage()
    }

    return this.pagePath(nextPage)
  }

  showBackwardsDots = () => this.p.result.currentPage() - 5 > 1
  showForwardsDots = () => this.p.result.currentPage() + 5 < this.tt.totalPages

  render () {
    const {result} = this.p
    const {pages, totalPages} = this.tt
    const showNextPage = result.currentPage() < totalPages
    const showLastPage = result.currentPage() < totalPages
    const showPreviousPage = result.currentPage() > 1
    const showFirstPage = result.currentPage() > 1

    const previousPageDisabled = !showPreviousPage
    const firstPageDisabled = !showFirstPage
    const nextPageDisabled = !showNextPage
    const lastPageDisabled = !showLastPage

    return (
      <ul className="pagination" data-pages-length={pages.length}>
        <li className={`page-item ${previousPageDisabled ? "disabled" : ""}`} key="page-first">
          {previousPageDisabled &&
            <Text>
              {FIRST_PAGE_LABEL}
            </Text>
          }
          {showPreviousPage &&
            <Link dataSet={{class: "page-link"}} to={this.pagePath(1)}>
              <Text>
                {FIRST_PAGE_LABEL}
              </Text>
            </Link>
          }
        </li>
        <li className={`page-item ${firstPageDisabled ? "disabled" : ""}`} key="page-previous">
          {firstPageDisabled &&
            <Text>
              {PREVIOUS_PAGE_LABEL}
            </Text>
          }
          {showFirstPage &&
            <Link dataSet={{class: "page-link"}} to={this.previousPagePath()}>
              <Text>
                {PREVIOUS_PAGE_LABEL}
              </Text>
            </Link>
          }
        </li>
        {this.showBackwardsDots() &&
          <li className="page-item disabled">
            <Text>
              {ELLIPSIS_LABEL}
            </Text>
          </li>
        }
        {pages.map((page) => ( // eslint-disable-line no-extra-parens
          <li
            className={`page-item ${this.isPageActiveClass(page)}`}
            data-active={this.isPageActiveClass(page) == "active"}
            data-page={page}
            key={`page-${page}`}
          >
            {this.isPageActiveClass(page) == "active" &&
              <Text>
                {page}
              </Text>
            }
            {this.isPageActiveClass(page) == "not-active" &&
              <Link dataSet={{class: "page-link"}} to={this.pagePath(page)}>
                <Text>
                  {page}
                </Text>
              </Link>
            }
          </li>
        ))}
        {this.showForwardsDots() &&
          <li className="page-item disabled">
            <Text>
              {ELLIPSIS_LABEL}
            </Text>
          </li>
        }
        <li className={`page-item ${nextPageDisabled ? "disabled" : ""}`} key="page-next">
          {nextPageDisabled &&
            <Text>
              {NEXT_PAGE_LABEL}
            </Text>
          }
          {showNextPage &&
            <Link dataSet={{class: "page-link"}} to={this.nextPagePath()}>
              <Text>
                {NEXT_PAGE_LABEL}
              </Text>
            </Link>
          }
        </li>
        <li className={`page-item ${lastPageDisabled ? "disabled" : ""}`} key="page-last">
          {lastPageDisabled &&
            <Text>
              {LAST_PAGE_LABEL}
            </Text>
          }
          {showLastPage &&
            <Link dataSet={{class: "page-link"}} to={this.pagePath(totalPages)}>
              <Text>
                {LAST_PAGE_LABEL}
              </Text>
            </Link>
          }
        </li>
      </ul>
    )
  }
}))
