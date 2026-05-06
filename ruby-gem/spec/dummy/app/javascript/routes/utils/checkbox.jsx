// @ts-check
import {Form, FormInputs} from "@kaspernj/api-maker/build/form"
import {Task} from "models.js"
import {View} from "react-native"
import Button from "@kaspernj/api-maker/build/utils/button"
import Checkbox from "@kaspernj/api-maker/build/utils/checkbox"
import Layout from "components/layout"
import Params from "@kaspernj/api-maker/build/params.js"
import React from "react"
import Text from "@kaspernj/api-maker/build/utils/text"

/** @type {Record<string, object>} */
const dataSets = {}
/** @type {Record<string, object>} */
const pressableProps = {}

export default class RoutesUtilsCheckbox extends React.PureComponent {
  form = new FormInputs({})

  state = {
    savedFormValue: "",
    showFormCheckbox: true,
    task: undefined
  }

  componentDidMount() {
    this.loadTask()
  }

  render() {
    const {savedFormValue, showFormCheckbox, task} = this.state

    return (
      <Layout>
        <View dataSet={dataSets.wrapper ||= {testid: "utils-checkbox-wrapper"}}>
          <Checkbox
            dataSet={dataSets.uncontrolledCheckbox ||= {testid: "utils-checkbox-uncontrolled"}}
            defaultChecked={false}
            label="Uncontrolled checkbox"
          />
          {task &&
            <View testID="utils-checkbox-form-wrapper">
              <Form form={this.form} onSubmit={this.onSubmit}>
                {showFormCheckbox &&
                  <Checkbox
                    attribute="finished"
                    dataSet={dataSets.formCheckbox ||= {testid: "utils-checkbox-form"}}
                    model={task}
                  />
                }
                <Button
                  label="Hide"
                  onPress={this.onHideFormCheckbox}
                  pressableProps={pressableProps.hide ||= {testID: "utils-checkbox-hide"}}
                />
                <Button
                  label="Save"
                  pressableProps={pressableProps.submit ||= {testID: "utils-checkbox-submit"}}
                  submit
                />
              </Form>
              <Text testID="utils-checkbox-saved-form-value">
                {savedFormValue}
              </Text>
            </View>
          }
        </View>
      </Layout>
    )
  }

  async loadTask() {
    const {task_id: taskId} = Params.parse()

    if (taskId) {
      const task = await Task.find(taskId)

      this.setState({task})
    }
  }

  onHideFormCheckbox = () => this.setState({showFormCheckbox: false})

  onSubmit = async () => {
    const {task} = this.state
    const formParams = this.form.asObject()
    const formValue = this.form.getValue("task[finished]")
    const savedFormValue = typeof formValue == "undefined" ? "unset" : String(formValue)

    if (formParams.task) {
      await task.saveRaw(formParams)
    }

    this.setState({savedFormValue})
  }
}
