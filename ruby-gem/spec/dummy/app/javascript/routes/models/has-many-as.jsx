import {digg, digs} from "diggerize"
import models from "@kaspernj/api-maker/build/models"
import Params from "@kaspernj/api-maker/build/params"
import React from "react"

const {Task} = models

export default class ModelsHasManyAs extends React.PureComponent {
  params = Params.parse()
  state = {
    comments: undefined,
    task: undefined
  }
  taskId = digg(this, "params", "task_id")

  componentDidMount() {
    this.loadTask()
  }

  async loadTask() {
    const {taskId} = digs(this, "taskId")
    const task = await Task.find(taskId)
    const comments = await task.comments().toArray()

    this.setState({
      comments,
      task
    })
  }

  render() {
    const {comments} = digs(this.state, "comments")

    return (
      <div className="routes-models-has-many-as">
        {comments && comments.map((comment) =>
          <div className="comment-container" data-comment-id={comment.id()} key={comment.id()}>
            {comment.comment()}
          </div>
        )}
      </div>
    )
  }
}
