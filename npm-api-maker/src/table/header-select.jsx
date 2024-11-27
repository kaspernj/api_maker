import {Pressable, View} from "react-native"
import BaseComponent from "../base-component"
import Collection from "../collection"
import HeaderColumnContent from "./header-column-content"
import memo from "set-state-compare/src/memo"
import Modal from "../utils/modal"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "../utils/text"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import useSorting from "./use-sorting"

export default memo(shapeComponent(class ApiMakerTableHeaderSelect extends BaseComponent {
  static propTypes = propTypesExact({
    preparedColumns: PropTypes.array.isRequired,
    query: PropTypes.instanceOf(Collection).isRequired,
    table: PropTypes.object
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.header_select"})
    const {preparedColumns, query} = this.p
    const {qParams, searchKey, sortAttribute, sortMode} = useSorting({query})

    this.useStates({
      modalOpen: false
    })
    this.setInstance({qParams, searchKey, sortAttribute, sortMode, t})
    this.sortedByPreparedColumn = preparedColumns.find((preparedColumn) => preparedColumn.tableSettingColumn.sortKey() == sortAttribute)
  }

  render() {
    const {sortedByPreparedColumn, sortMode, t} = this.tt
    const {table} = this.p
    const column = sortedByPreparedColumn?.column
    const columnLabel = column && table.headerLabelForColumn(column)

    return (
      <View dataSet={{component: "api-maker/table/header-select"}}>
        {this.s.modalOpen &&
          <Modal dataSet={{class: "table-header-select-modal"}} onRequestClose={this.tt.onModalRequestClose} transparent>
            {this.p.preparedColumns.map(({column, tableSettingColumn}) =>
              <View
                key={tableSettingColumn.identifier()}
                style={{marginVertical: 5}}
              >
                <HeaderColumnContent column={column} table={table} tableSettingColumn={tableSettingColumn} sortLinkProps={{usePressable: true}} />
              </View>
            )}
          </Modal>
        }
        <Pressable onPress={this.tt.onSortedByPress}>
          <Text>
            {sortedByPreparedColumn && sortMode == "asc" &&
              t(".sorted_by_column", {column: columnLabel, defaultValue: "Sorted by %{column}"})
            }
            {sortedByPreparedColumn && sortMode == "desc" &&
              t(".sorted_by_column_reversed", {column: columnLabel, defaultValue: "Sorted by %{column} reversed"})
            }
            {!sortedByPreparedColumn &&
              t(".not_sorted", {defaultValue: "Not sorted"})
            }
          </Text>
        </Pressable>
      </View>
    )
  }

  onModalRequestClose = () => this.setState({modalOpen: false})
  onSortedByPress = () => this.setState({modalOpen: true})
}))
