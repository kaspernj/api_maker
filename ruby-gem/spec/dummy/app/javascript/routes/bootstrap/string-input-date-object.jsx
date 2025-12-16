import Input from "@kaspernj/api-maker/dist/bootstrap/input"
import Layout from "components/layout"
import React from "react"

export default class BootstrapStringInputDateObject extends React.PureComponent {
  render() {
    return (
      <Layout>
        <div className="content-container">
          <form>
            <Input defaultValue={new Date(2020, 0, 1)} id="date_object" label="Birthday" type="date" />
          </form>
        </div>
      </Layout>
    )
  }
}