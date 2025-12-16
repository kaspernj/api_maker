import React, {useMemo} from "react"
import {StyleSheet, View} from "react-native"
import Checkbox from "../../utils/checkbox.jsx"
import BaseComponent from "../../base-component.js"
import memo from "set-state-compare/src/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {useForm} from "../../form.jsx"

const styles = StyleSheet.create({
  checkbox: {
    marginRight: 4
  }
})

export default memo(shapeComponent(class EditAttributeInput extends BaseComponent {
  static propTypes = propTypesExact({
    attributeName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  setup() {
    const {attributeName, id, name} = this.p

    this.form = useForm()
    this.useStates({
      checked: this.tt.defaultChecked
    })

    this.dataSet = useMemo(
      () => ({
        attribute: attributeName,
        id,
        name
      }),
      [attributeName, id, name]
    )

    useMemo(() => {
      if (this.form) {
        this.form.setValue(name, this.s.checked)
      }
    }, [])
  }

  defaultChecked = () => this.p.model[this.p.attributeName]() || false

  render() {
    const {dataSet} = this.tt
    const {attributeName, label, model} = this.p
    const {checked} = this.s

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    return (
      <View
        dataSet={this.rootViewDataSet ||= {component: "api-maker/super-admin/edit-page/edit-attribute-input"}}
        style={this.rootViewStyle ||= {flexDirection: "row", alignItems: "center"}}
      >
        <Checkbox
          checked={checked}
          dataSet={dataSet}
          label={label}
          onCheckedChange={this.tt.onCheckedChange}
          style={styles.checkbox}
        />
      </View>
    )
  }

  onCheckedChange = (newChecked) => {
    if (this.form) {
      this.form.setValue(this.p.name, newChecked)
    }

    this.setState({checked: newChecked})
  }
}))
