import Collection from "../collection.mjs"
import EventConnection from "../event-connection"
import {simpleObjectDifferent} from "set-state-compare/src/diff-utils"
import {useEffect, useRef} from "react"

const Checkbox = (props) => {
  const {indeterminate, ...restProps} = props
  const checkboxRef = useRef()

  useEffect(() => {
    checkboxRef.current.indeterminate = indeterminate
  })

  return (
    <input ref={checkboxRef} type="checkbox" {...restProps} />
  )
}

export default class ApiMakerTableWorkerPluginsCheckAllCheckbox extends BaseComponent {
  static propTypes = PropTypesExact({
    currentWorkplace: PropTypes.object,
    query: PropTypes.instanceOf(Collection)
  })

  state = {
    checked: false,
    indeterminate: false
  }

  componentDidMount() {
    this.updateAllChecked()
  }

  componentDidUpdate(prevProps) {
    const previousParams = prevProps.query.params()
    const currentParams = this.props.query.params()

    if (simpleObjectDifferent(previousParams, currentParams)) {
      this.updateAllChecked()
    }
  }

  async updateAllChecked() {
    const {query, currentWorkplace} = this.props
    const queryLinksStatusResult = await currentWorkplace.queryLinksStatus({query})
    const allChecked = queryLinksStatusResult.all_checked
    const someChecked = queryLinksStatusResult.some_checked

    this.setState({
      checked: allChecked,
      indeterminate: someChecked
    })
  }

  render() {
    const {className, currentWorkplace} = this.props
    const {checked, indeterminate} = this.state

    return (
      <>
        <EventConnection event="workplace_links_created" model={currentWorkplace} onCall={this.onLinksCreated} />
        <EventConnection event="workplace_links_destroyed" model={currentWorkplace} onCall={this.onLinksDestroyed} />
        <Checkbox
          checked={checked}
          className={classNames("api-maker--table--worker-plugins-check-all-checkbox", className)}
          indeterminate={indeterminate}
          onChange={this.onCheckedChanged}
        />
      </>
    )
  }

  modelClassName = () => this.props.query.modelClass().modelClassData().name

  onCheckedChanged = async (e) => {
    e.preventDefault()

    const {currentWorkplace, query} = this.props
    const checkbox = e.target

    if (checkbox.checked) {
      await currentWorkplace.addQuery({query})
      this.setState({checked: true, indeterminate: false})
    } else {
      await currentWorkplace.removeQuery({query})
      this.setState({checked: false, indeterminate: false})
    }
  }

  onLinksCreated = ({args}) => {
    if (args.created[this.modelClassName()]) {
      this.updateAllChecked()
    }
  }

  onLinksDestroyed = ({args}) => {
    if (args.destroyed[this.modelClassName()]) {
      this.updateAllChecked()
    }
  }
}
