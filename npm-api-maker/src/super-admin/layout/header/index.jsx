import "./style"
import BaseComponent from "../../../base-component"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import {memo, useRef} from "react"
import PropTypes from "prop-types"
import PropTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Pressable, Text, View} from "react-native"
import useBreakpoint from "../../../use-breakpoint"
import useEventListener from "../../../use-event-listener"

export default memo(shapeComponent(class ApiMakerSuperAdminLayoutHeader extends BaseComponent {
  static propTypes = PropTypesExact({
    actions: PropTypes.node,
    onTriggerMenu: PropTypes.func.isRequired,
    title: PropTypes.string
  })

  setup() {
    const {name: breakpoint} = useBreakpoint()

    this.headerActionsRef = useRef()
    this.setInstance({breakpoint})
    this.useStates({
      headerActionsActive: false
    })

    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)
  }

  render() {
    const {breakpoint} = this.tt
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
    const headerActionsStyle = {}

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

        background: "rgba(#000, .8)"
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

    return (
      <View dataSet={{component: "super-admin--layout--header"}} style={headerStyle}>
        <View dataSet={{class: "header-title-container"}}>
          <Text style={{color: "#282a33", fontSize: 22}}>
            {title}
          </Text>
        </View>
        {actions &&
          <View dataSet={{active: this.s.headerActionsActive, class: "header-actions-container"}} style={headerActionsContainerStyle}>
            <View
              dataSet={{class: "header-actions"}}
              ref={this.tt.headerActionsRef}
              style={headerActionsStyle}
            >
              {actions}
            </View>
          </View>
        }
        <View dataSet={{class: "burger-menu-container"}}>
          {actions &&
            <Pressable dataSet={{class: "actions-link"}} onPress={this.tt.onGearsClicked} style={{marginRight: 8, fontSize: 22}}>
              <FontAwesomeIcon name="gear" size={20} />
            </Pressable>
          }
          <Pressable dataSet={{class: "burger-menu-link"}} onPress={onTriggerMenu}>
            <FontAwesomeIcon icon="bars" size={20} />
          </Pressable>
        </View>
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
