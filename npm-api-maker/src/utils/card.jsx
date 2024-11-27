import BaseComponent from "../base-component"
import memo from "set-state-compare/src/memo"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "./text"

export default memo(shapeComponent(class ApiMakerUtilsCard extends BaseComponent {
  static propTypes = propTypesExact({
    children: PropTypes.node,
    controls: PropTypes.node,
    dataSet: PropTypes.object,
    header: PropTypes.string,
    style: PropTypes.object
  })

  render() {
    const {children, controls, dataSet, header, style} = this.props
    const {component, ...restDataSet} = dataSet || {}
    const actualDataSet = Object.assign(
      {component: classNames("api-maker/utils/card", component)},
      restDataSet
    )
    const actualStyle = Object.assign(
      {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 30
      },
      style
    )

    return (
      <View dataSet={actualDataSet} style={actualStyle}>
        {controls &&
          <View style={{position: "absolute", top: 15, right: 15}}>
            {controls}
          </View>
        }
        {header &&
          <Text style={{fontSize: 24}}>
            {header}
          </Text>
        }
        {children}
      </View>
    )
  }
}))
