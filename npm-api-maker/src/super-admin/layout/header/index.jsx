/* eslint-disable indent, no-return-assign, react/jsx-closing-bracket-location, react/jsx-closing-tag-location */
/* eslint-disable react/jsx-indent, react/jsx-indent-props, sort-imports */
import React, {useCallback, useRef} from "react"
import BaseComponent from "../../../base-component"
import Icon from "../../../utils/icon"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../../../utils/text"
import {Pressable, View} from "react-native"
import {useBreakpoint} from "responsive-breakpoints"
import useEventListener from "ya-use-event-listener"

const dataSets = {}

// Hook for consistent action button styling across breakpoints
export const useHeaderActionButtonStyle = () => {
  const {mdUp} = useBreakpoint()

  return useCallback(({stackedIndex = 0} = {}) => {
    const base = mdUp
      ? {
          alignSelf: "flex-start",
          paddingVertical: 7,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: "#cbd5e1",
          marginRight: 4,
          marginBottom: 4,
          borderRadius: 5,
          fontSize: 13
        }
      : {
          alignSelf: "stretch",
          padding: 11
        }

    if (!mdUp && stackedIndex > 0) {
      base.borderTopWidth = 1
      base.borderTopColor = "#c9c9c9"
    }

    return base
  }, [mdUp])
}

export default memo(shapeComponent(class ApiMakerSuperAdminLayoutHeader extends BaseComponent {
  static propTypes = PropTypesExact({ // eslint-disable-line new-cap
    actions: PropTypes.any,
    onTriggerMenu: PropTypes.func.isRequired,
    title: PropTypes.string
  })

  setup() {
    const {name: breakpoint, mdUp} = useBreakpoint()

    this.headerActionsRef = useRef()
    this.setInstance({breakpoint, mdUp})
    this.useStates({
      headerActionsActive: false
    })

    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)
  }

  render() {
    const {breakpoint, mdUp} = this.tt
    const {actions, onTriggerMenu, title} = this.props

    const headerStyle = {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      zIndex: 9,
      height: 100,
      paddingRight: 30,
      paddingLeft: 30,
      backgroundColor: "#fff"
    }

    const headerActionsContainerStyle = {}
    const headerActionsStyle = {
      flexDirection: mdUp ? "row" : "column",
      alignItems: mdUp ? "flex-start" : "stretch",
      gap: mdUp ? 8 : 0
    }

    if (breakpoint == "xs" || breakpoint == "sm") {
      headerStyle.position = "absolute"
      headerStyle.width = "100%"

      Object.assign(headerActionsContainerStyle, {
        position: "fixed",
        top: 0,
        left: 0,

        display: "flex",
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "rgba(0, 0, 0, 0.8)"
      })

      if (!this.s.headerActionsActive) {
        headerActionsContainerStyle.display = "none"
      }

      Object.assign(headerActionsStyle, {
        minWidth: "80vw",
        maxWidth: "100vw",
        backgroundColor: "#fff"
      })
    } else if (breakpoint == "md") {
      headerStyle.position = "fixed"
      headerStyle.left = 250
      headerStyle.width = "calc(100% - 250px)"
    } else if (breakpoint == "lg" || breakpoint == "xl" || breakpoint == "xxl") {
      headerStyle.position = "fixed"
      headerStyle.left = 290
      headerStyle.width = "calc(100% - 290px)"
    }

    if (breakpoint == "md" || breakpoint == "lg" || breakpoint == "xl" || breakpoint == "xxl") {
      headerActionsContainerStyle.marginLeft = "auto"
    }

    const actionsText = `actions: ${actions ? "YES" : "NO"}`

    return (
      <View dataSet={this.cache("rootViewDataSet", {component: "super-admin--layout--header"})} style={headerStyle}>
        <View dataSet={this.cache("headerTitleViewDataSet", {class: "header-title-container"})}>
          <Text style={this.cache("headerTitleTextStyle", {color: "#282a33", fontSize: 22})}>
            {title}
          </Text>
        </View>
        <Text>
          {actionsText}
        </Text>
        {actions &&
          <View
            dataSet={dataSets[`headerActionsContainer-${this.s.headerActionsActive}`] ||= {
              active: this.s.headerActionsActive,
              class: "header-actions-container"
            }}
            style={headerActionsContainerStyle}
          >
            <View
              dataSet={this.cache("headerActionsViewDataSet", {class: "header-actions"})}
              ref={this.tt.headerActionsRef}
              style={headerActionsStyle}
            >
              {actions}
            </View>
          </View>
        }
        {!mdUp &&
          <View
            dataSet={this.cache("burgerMenuContainerDataSet", {class: "burger-menu-container"})}
            style={this.cache("burgerMenuContainerStyle", {
              flexDirection: "row",
              marginLeft: "auto"
            })}
          >
            {actions &&
              <Pressable
                dataSet={this.cache("actionsLinkDataSet", {class: "actions-link"})}
                onPress={this.tt.onGearsClicked}
                style={this.cache("actionsLinkStyle", {marginRight: 8, fontSize: 22})}
              >
                <Icon name="gear" size={20} />
              </Pressable>
            }
            <Pressable dataSet={this.cache("burgerMenuLinkDataSet", {class: "burger-menu-link"})} onPress={onTriggerMenu}>
              <Icon name="bars" size={20} />
            </Pressable>
          </View>
        }
      </View>
    )
  }

  onGearsClicked = () => this.setState({headerActionsActive: !this.s.headerActionsActive})

  onWindowMouseUp = (e) => {
    // Close the header actions menu if clicked happened outside
    if (this.s.headerActionsActive && this.tt.headerActionsRef.current && !this.tt.headerActionsRef.current.contains(e.target)) {
      this.setState({headerActionsActive: false})
    }
  }
}))
