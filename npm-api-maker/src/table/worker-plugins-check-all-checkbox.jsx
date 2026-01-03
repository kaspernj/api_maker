/* eslint-disable import/no-unresolved, sort-imports */
import React, {useEffect, useMemo, useRef} from "react"
import BaseComponent from "../base-component"
import classNames from "classnames"
import Collection from "../collection.js"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {simpleObjectDifferent} from "set-state-compare/build/diff-utils.js"
import useModelEvent from "../use-model-event.js"

const Checkbox = memo(shapeComponent(class Checkbox extends BaseComponent {
  render() {
    const {indeterminate, ...restProps} = this.props
    const checkboxRef = useRef()

    useEffect(() => {
      checkboxRef.current.indeterminate = indeterminate
    })

    return (
      <input ref={checkboxRef} type="checkbox" {...restProps} />
    )
  }
}))

export default memo(shapeComponent(class ApiMakerTableWorkerPluginsCheckAllCheckbox extends BaseComponent {
  static propTypes = propTypesExact({
    currentWorkplace: PropTypes.object,
    query: PropTypes.instanceOf(Collection),
    style: PropTypes.object
  })

  setup() {
    this.useStates({
      checked: false,
      indeterminate: false
    })

    useMemo(() => {
      this.updateAllChecked()
    }, [])

    useModelEvent(this.props.currentWorkplace, "workplace_links_created", this.tt.onLinksCreated)
    useModelEvent(this.props.currentWorkplace, "workplace_links_destroyed", this.tt.onLinksDestroyed)
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
    const {className, style} = this.props
    const {checked, indeterminate} = this.state

    return (
      <Checkbox
        checked={checked}
        className={classNames("api-maker--table--worker-plugins-check-all-checkbox", className)}
        indeterminate={indeterminate}
        onChange={this.onCheckedChanged}
        style={style}
      />
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
}))
