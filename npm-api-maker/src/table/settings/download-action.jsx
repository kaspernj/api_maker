import BaseComponent from "../../base-component"
import ColumnContent from "../column-content"
import columnIdentifier from "../column-identifier.mjs"
import columnVisible from "../column-visible.mjs"
import {saveAs} from "file-saver"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import {memo} from "react"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {renderToString} from "react-dom/server"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Pressable, Text} from "react-native"

export default memo(shapeComponent(class ApiMakerTableSettingsDownloadAction extends BaseComponent {
  static propTypes = propTypesExact({
    table: PropTypes.object.isRequired
  })

  render() {
    return (
      <Pressable onPress={this.tt.onDownloadPress} style={{flexDirection: "row", alignItems: "center"}}>
        <FontAwesomeIcon name="download" size={20} />
        <Text style={{marginLeft: 5}}>
          Download
        </Text>
      </Pressable>
    )
  }

  onDownloadPress = () => {
    const {table} = this.p
    const {modelClass} = table.p
    const {collection} = table.tt
    const {models} = collection
    const {preparedColumns} = table.s
    const tableElement = (
      <table>
        <thead>
          <tr>
            {preparedColumns?.map(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn) &&
              <th key={columnIdentifier(column)}>
                {table.headerLabelForColumn(column)}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {models.map((model) =>
            <tr key={model.id()}>
              {preparedColumns?.map(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn) &&
                <td key={columnIdentifier(column)}>
                  {new ColumnContent({column, mode: "html", model, table}).content()}
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    )
    const tableHTML = renderToString(tableElement)
    const blob = new Blob([tableHTML], {type: "text/html;charset=utf-8"})
    const fileName = `${modelClass.modelName().human({count: 2})}.html`

    saveAs(blob, fileName)
  }
}))