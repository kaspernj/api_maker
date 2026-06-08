// @ts-check
/* eslint-disable sort-imports */
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {FlashNotifications} from "flash-notifications"
import {Pressable, View} from "react-native"
import apiMakerConfig from "../../config.js"
import ApiMakerTableExporter, {ApiMakerTableExportAbortedError} from "../export/table-exporter"
import Icon from "../../utils/icon"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Text from "../../utils/text"
import useI18n from "i18n-on-steroids/build/src/use-i18n.js"

/**
 * Streams the whole table result set to a file (CSV / HTML / Excel) instead of building one big string in
 * memory. Excel is only offered when the host app has registered an xlsx serializer via
 * apiMakerConfig.setExportXlsxSerializer.
 *
 * @typedef {object} Props
 * @property {Function} l
 * @property {object} table
 */
/** @typedef {{exporting: boolean}} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerTableSettingsDownloadAction extends ShapeComponent {
  static propTypes = propTypesExact({
    l: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired
  })

  state = {
    exporting: false
  }

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.download_action"})

    this.t = t
  }

  render() {
    const excelAvailable = Boolean(apiMakerConfig.getExportXlsxSerializer())

    return (
      <View dataSet={this.cache("rootViewDataSet", {component: "api-maker/table/settings/download-action"})}>
        <Text style={this.cache("labelStyle", {fontWeight: "bold", marginBottom: 4})}>
          {this.t(".download", {defaultValue: "Download"})}
        </Text>
        {this.formatButton({format: "csv", label: "CSV", onPress: this.tt.onDownloadCsv})}
        {this.formatButton({format: "html", label: "HTML", onPress: this.tt.onDownloadHtml})}
        {excelAvailable && this.formatButton({format: "xlsx", label: "Excel", onPress: this.tt.onDownloadXlsx})}
      </View>
    )
  }

  /**
   * @param {{format: "csv" | "html" | "xlsx", label: string, onPress: () => void}} args
   * @returns {import("react").ReactNode}
   */
  formatButton({format, label, onPress}) {
    return (
      <Pressable
        dataSet={this.cache(`download${format}DataSet`, {component: `api-maker/table/settings/download-action/${format}`})}
        disabled={this.s.exporting}
        onPress={onPress}
        style={this.cache("formatButtonStyle", {flexDirection: "row", alignItems: "center", paddingVertical: 3})}
        testID={`download-action-${format}`}
      >
        <Icon name="download" size={18} />
        <Text style={this.cache("formatLabelStyle", {marginLeft: 5})}>
          {label}
        </Text>
      </Pressable>
    )
  }

  onDownloadCsv = () => this.startExport("csv")
  onDownloadHtml = () => this.startExport("html")
  onDownloadXlsx = () => this.startExport("xlsx")

  /** @param {"csv" | "html" | "xlsx"} format */
  startExport = async (format) => {
    if (this.s.exporting) return

    this.s.exporting = true

    const exporter = new ApiMakerTableExporter({format, l: this.p.l, table: this.p.table})

    try {
      await exporter.run()
    } catch (error) {
      if (error instanceof ApiMakerTableExportAbortedError) return
      if (error && /** @type {Error} */ (error).name === "AbortError") return

      FlashNotifications.errorResponse(error)
    } finally {
      this.s.exporting = false
    }
  }
}))
