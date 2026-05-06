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

const formCheckboxDataSet = {testid: "utils-checkbox-form"}
const submitPressableProps = {testID: "utils-checkbox-submit"}
const uncontrolledDataSet = {testid: "utils-checkbox-uncontrolled"}

export default class RoutesUtilsCheckbox extends React.PureComponent {
  form = new FormInputs({})

  state = {
    savedFormValue: "",
    task: undefined
  }

  componentDidMount() {
    this.loadTask()
  }

  render() {
    const {savedFormValue, task} = this.state

    return (
      <Layout>
        <View dataSet={{testid: "utils-checkbox-wrapper"}}>
          <Checkbox
            dataSet={uncontrolledDataSet}
            defaultChecked={false}
            label="Uncontrolled checkbox"
          />
          {task &&
            <View testID="utils-checkbox-form-wrapper">
              <Form form={this.form} onSubmit={this.onSubmit}>
                <Checkbox
                  attribute="finished"
                  dataSet={formCheckboxDataSet}
                  model={task}
                />
                <Button
                  label="Save"
                  pressableProps={submitPressableProps}
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

  onSubmit = async () => {
    const {task} = this.state
    const formValue = this.form.getValue("task[finished]")

    await task.saveRaw(this.form.asObject())

    this.setState({savedFormValue: String(formValue)})
  }
}
