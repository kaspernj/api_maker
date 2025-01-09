import BaseComponent from "../base-component"
import {digs} from "diggerize"
import memo from "set-state-compare/src/memo"
import {View} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import SortLink from "../bootstrap/sort-link"
import Text from "../utils/text"

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    sortLinkProps: PropTypes.object,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  render() {
    const {column, table, tableSettingColumn} = this.p
    const {defaultParams} = table.props
    const {styleForHeaderText} = table.tt
    const {query} = digs(table.collection, "query")
    const columnProps = table.columnProps(column)

    return (
      <View
        dataSet={{
          component: "api-maker/table/header-column-content",
          identifier: tableSettingColumn.identifier()
        }}
        style={{display: "flex", flexDirection: "row", alignItems: "center"}}
        {...columnProps}
      >
        {tableSettingColumn.hasSortKey() && query &&
          <SortLink
            attribute={tableSettingColumn.sortKey()}
            defaultParams={defaultParams}
            query={query}
            style={{whiteSpace: "nowrap", overflow: "hidden"}}
            textProps={{ellipsizeMode: "clip", numberOfLines: 1, style: styleForHeaderText()}}
            title={table.headerLabelForColumn(column)}
            {...this.props.sortLinkProps}
          />
        }
        {(!tableSettingColumn.hasSortKey() || !query) &&
          <Text ellipsizeMode="clip" numberOfLines={1} style={{fontWeight: "bold"}}>
            {table.headerLabelForColumn(column)}
          </Text>
        }
      </View>
    )
  }
}))
