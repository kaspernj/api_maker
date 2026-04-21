// @ts-check
/* eslint-disable sort-imports */
import React, {useEffect, useMemo} from "react"
import {StyleSheet, View} from "react-native"
import Checkbox from "../../utils/checkbox"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useForm} from "../../form"

const styles = StyleSheet.create({
  checkbox: {
    marginRight: 4
  }
})

/**
 * @typedef {object} Props
 * @property {string} attributeName
 * @property {string} id
 * @property {string} label
 * @property {object} model
 * @property {string} name
 */
/**
 * @typedef {object} State
 * @property {any} checked
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class EditAttributeInput extends ShapeComponent {
  static propTypes = propTypesExact({
    attributeName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
  })

  state = {
    checked: this.defaultChecked()
  }

  setup() {
    const {attributeName, id, name} = this.p

    this.form = useForm()

    this.dataSet = useMemo(
      () => ({
        attribute: attributeName,
        id,
        name
      }),
      [attributeName, id, name]
    )

    useEffect(() => {
      if (this.form) {
        this.form.setValue(name, this.s.checked)
      }
    }, [])
  }

  defaultChecked() {
    return this.p.model[this.p.attributeName]() || false
  }

  render() {
    const {dataSet} = this.tt
    const {attributeName, label, model} = this.p
    const {checked} = this.s

    if (!(attributeName in model)) {
      throw new Error(`${attributeName} isn't set on the resource ${model.modelClassData().name}`)
    }

    return (
      <View
        dataSet={this.cache("rootViewDataSet", {component: "api-maker/super-admin/edit-page/edit-attribute-input"})}
        style={this.cache("rootViewStyle", {flexDirection: "row", alignItems: "center"})}
      >
        <Checkbox
          checked={checked}
          dataSet={dataSet}
          label={label}
          onCheckedChange={this.tt.onCheckedChange}
          style={styles.checkbox}
          testID={`api-maker/super-admin/edit-page/input-${this.p.id}`}
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
