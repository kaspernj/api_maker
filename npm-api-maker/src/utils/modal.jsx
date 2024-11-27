import {Modal, Pressable, View} from "react-native"
import BaseComponent from "../base-component"
import Card from "./card"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useBreakpoint from "../use-breakpoint"

export default memo(shapeComponent(class ApiMakerUtilsComponent extends BaseComponent {
  render() {
    const {xs, sm} = useBreakpoint()
    const {children, dataSet, ...restProps} = this.props
    const actualDataSet = Object.assign(
      {
        component: "api-maker/utils/modal"
      },
      dataSet
    )
    let width, maxWidth

    if (xs || sm) {
      width = "95%"
    } else {
      width = "80%"
      maxWidth = 800
    }

    return (
      <Modal dataSet={actualDataSet} {...restProps}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)"
          }}
        >
          <Card
            controls={this.cardHeaderControls()}
            style={{width, maxWidth}}
          >
            {children}
          </Card>
        </View>
      </Modal>
    )
  }

  cardHeaderControls() {
    return (
      <Pressable onPress={this.tt.onModalClosePress} style={{marginLeft: "auto", padding: 5}}>
        <FontAwesomeIcon name="remove" />
      </Pressable>
    )
  }

  onModalClosePress = () => this.props.onRequestClose && this.props.onRequestClose()
}))
