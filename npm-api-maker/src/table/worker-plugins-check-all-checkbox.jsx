import Collection from "../collection.mjs"

export default class ApiMakerTableWorkerPluginsCheckAllCheckbox extends BaseComponent {
  static propTypes = PropTypesExact({
    currentWorkplace: PropTypes.object,
    query: PropTypes.instanceOf(Collection)
  })

  render() {
    const {className} = this.props

    return (
      <input
        className={classNames("api-maker--table--worker-plugins-checkbox", className)}
        onChange={this.onCheckedChanged}
        type="checkbox"
      />
    )
  }

  onCheckedChanged = async (e) => {
    e.preventDefault()

    const {currentWorkplace, query} = this.props

    await currentWorkplace.addCollection({query})
    e.target.checked = true
  }
}
