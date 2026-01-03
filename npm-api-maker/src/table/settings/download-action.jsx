/* eslint-disable implicit-arrow-linebreak, no-extra-parens, react/jsx-no-literals, sort-imports */
import BaseComponent from "../../base-component"
import ColumnContent from "../column-content"
import columnIdentifier from "../column-identifier.js"
import columnVisible from "../column-visible.js"
import {saveAs} from "file-saver"
import Icon from "../../utils/icon"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import {renderToString} from "react-dom/server" // eslint-disable-line import/no-unresolved
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import {Pressable} from "react-native"
import Text from "../../utils/text"

export default memo(shapeComponent(class ApiMakerTableSettingsDownloadAction extends BaseComponent {
  static propTypes = propTypesExact({
    l: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  render() {
    return (
      <Pressable
        dataSet={this.cache("pressableDataSet", {component: "api-maker/table/settings/download-action"})}
        onPress={this.tt.onDownloadPress}
        style={this.cache("pressableStyle", {flexDirection: "row", alignItems: "center"})}
      >
        <Icon name="download" size={20} />
        <Text style={this.cache("textStyle", {marginLeft: 5})}>
          Download
        </Text>
      </Pressable>
    )
  }

  onDownloadPress = () => {
    const {l, table} = this.p
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
                  {new ColumnContent({column, l, mode: "html", model, table}).content()}
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
