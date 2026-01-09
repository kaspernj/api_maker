/* eslint-disable import/no-unresolved, no-return-assign, sort-imports */
import React, {useMemo} from "react"
import BaseComponent from "../base-component"
import classNames from "classnames"
import Header from "./components/header"
import HeaderColumnContent from "./header-column-content"
import Icon from "../utils/icon"
import memo from "set-state-compare/build/memo.js"
import {Animated, PanResponder} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import useBreakpoint from "../use-breakpoint.js"
import Widths from "./widths"

const dataSets = {}

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    active: PropTypes.bool.isRequired,
    animatedWidth: PropTypes.instanceOf(Animated.Value).isRequired,
    animatedZIndex: PropTypes.instanceOf(Animated.Value).isRequired,
    column: PropTypes.object.isRequired,
    resizing: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired,
    touchProps: PropTypes.object.isRequired,
    widths: PropTypes.instanceOf(Widths).isRequired
  })

  setup() {
    const {name: breakpoint, mdUp, smDown} = useBreakpoint()

    this.setInstance({breakpoint, mdUp, smDown})
    this.useStates({
      resizing: false
    })

    this.resizePanResponder = useMemo(
      () => PanResponder.create({
        onStartShouldSetPanResponder: (_e) => {
          this.originalWidth = this.currentWidth
          this.setState({resizing: true})
          this.p.table.setState({resizing: true})

          return true
        },
        onPanResponderMove: (_e, gestate) => {
          const newWidth = this.tt.originalWidth + gestate.dx

          this.p.widths.setWidthOfColumn({
            identifier: this.p.tableSettingColumn.identifier(),
            width: newWidth
          })
        },
        onPanResponderRelease: this.tt.onResizeEnd,
        onPanResponderTerminate: this.tt.onResizeEnd,
        onPanResponderTerminationRequest: () => false // Don't let another PanResponder steal focus and stop resizing until release
      }),
      []
    )
  }

  onResizeEnd = async () => {
    this.p.table.setState({lastUpdate: new Date(), resizing: false})
    this.setState({resizing: false})

    const width = this.p.widths.getWidthOfColumn(this.p.tableSettingColumn.identifier())

    await this.p.tableSettingColumn.update({width})
  }

  render() {
    const {mdUp} = this.tt
    const {active, animatedWidth, column, resizing, table, tableSettingColumn, touchProps} = this.p
    const {styleForHeader} = table.tt
    const headerProps = table.headerProps(column)
    const {style, ...restColumnProps} = headerProps
    const headerIdentifier = tableSettingColumn.identifier()
    const actualStyle = useMemo(
      () => {
        // eslint-disable-next-line prefer-object-spread
        const actualStyle = Object.assign(
          {
            cursor: resizing ? "col-resize" : undefined,
            width: mdUp ? animatedWidth : "100%",
            height: mdUp ? "100%" : undefined
          },
          style
        )

        return actualStyle
      },
      [active, animatedWidth, mdUp, resizing, style]
    )

    return (
      <Header
        dataSet={dataSets[`header-${headerIdentifier}`] ||= {
          className: classNames(...table.headerClassNameForColumn(column)),
          identifier: headerIdentifier
        }}
        onLayout={this.tt.onLayout}
        style={styleForHeader({style: actualStyle})}
        {...restColumnProps}
      >
        {mdUp &&
          <Icon name="bars" style={this.cache("barsIconStyle", {marginRight: 3, fontSize: 12})} {...touchProps} />
        }
        <HeaderColumnContent column={column} table={table} tableSettingColumn={tableSettingColumn} />
        {mdUp &&
          <Animated.View
            style={this.cache("resizeColumnViewStyle", {
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: "100%",
              cursor: "col-resize",
              zIndex: 9999
            })}
            {...this.tt.resizePanResponder.panHandlers}
          />
        }
      </Header>
    )
  }

  onLayout = (e) => {
    const {width} = e.nativeEvent.layout

    this.currentWidth = width
  }
}))
