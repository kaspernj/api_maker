import Attachment from "@kaspernj/api-maker/build/inputs/attachment"
import Layout from "components/layout"
import React from "react"

export default class BootstrapAttachmentInput extends React.PureComponent {
  render() {
    return (
      <Layout>
        <div className="content-container">
          <form>
            <Attachment
              contentType="text/plain"
              id="attachment_input"
              name="attachment[image]"
              url="/favicon.ico"
            />
          </form>
        </div>
      </Layout>
    )
  }
}
