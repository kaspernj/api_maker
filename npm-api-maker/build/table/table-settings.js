import columnIdentifier from "./column-identifier.js";
import columnVisible from "./column-visible.js";
import { digg } from "diggerize";
import * as inflection from "inflection";
import Logger from "../logger.js";
import { ReadersWriterLock } from "epic-locks";
import { serialize as objectToFormData } from "object-to-formdata";
import { TableSetting } from "models.js";
import { v4 as uuidv4 } from "uuid";
const logger = new Logger({ name: "ApiMaker / TableSettings" });
// Have a lock for each unique table identifier
const tableSettingsLocks = {};
export default class ApiMakerTableSettings {
    constructor({ table }) {
        this.table = table;
        this.setTableSettingsLock();
    }
    setTableSettingsLock() {
        const identifier = this.identifier();
        if (!(identifier in tableSettingsLocks)) {
            tableSettingsLocks[identifier] = new ReadersWriterLock();
        }
        this.tableSettingsLock = digg(tableSettingsLocks, identifier);
    }
    columns = () => digg(this, "table", "columnsAsArray")();
    currentUser = () => digg(this, "table", "props", "currentUser");
    identifier = () => digg(this, "table", "state", "identifier");
    preparedColumns = (tableSetting) => {
        const columns = this.table.columnsAsArray();
        const ordered = this.orderedTableSettingColumns(tableSetting);
        const result = {
            columns: [],
            preload: []
        };
        if (!ordered)
            return;
        for (const tableSettingColumn of ordered) {
            const column = columns.find((column) => columnIdentifier(column) == tableSettingColumn.identifier());
            result.columns.push({ column, tableSettingColumn });
            // Add needed preloads if column is visible
            if (columnVisible(column, tableSettingColumn)) {
                if (column.path) {
                    const preload = column.path.map((pathPart) => inflection.underscore(pathPart)).join(".");
                    if (!result.preload.includes(preload))
                        result.preload.push(preload);
                }
            }
        }
        return result;
    };
    orderedTableSettingColumns = (tableSetting) => {
        return tableSetting
            .columns()
            .loaded()
            .sort((tableSettingColumn1, tableSettingColumn2) => tableSettingColumn1.position() - tableSettingColumn2.position());
    };
    loadExistingOrCreateTableSettings = async () => {
        return await this.tableSettingsLock.write(async () => {
            let tableSetting = await this.loadTableSetting();
            if (tableSetting) {
                tableSetting = await this.updateTableSetting(tableSetting);
            }
            else {
                tableSetting = await this.createInitialTableSetting();
            }
            return tableSetting;
        });
    };
    loadTableSetting = async () => {
        if (!TableSetting)
            throw new Error("TableSetting model isn't globally available");
        const tableSetting = await TableSetting
            .ransack({
            identifier_eq: this.identifier(),
            user_id_eq: this.currentUserIdOrFallback(),
            user_type_eq: this.currentUserTypeOrFallback()
        })
            .preload("columns")
            .first();
        return tableSetting;
    };
    currentUserIdOrFallback() {
        const currentUser = this.currentUser();
        if (currentUser)
            return currentUser.id();
        return this.anonymouseUserId();
    }
    currentUserTypeOrFallback() {
        const currentUser = this.currentUser();
        if (currentUser)
            return digg(currentUser.modelClassData(), "name");
        return null;
    }
    anonymouseUserId() {
        const variableName = `ApiMakerTableAnonymousUserId-${this.identifier()}`;
        if (!(variableName in localStorage)) {
            const generatedId = uuidv4();
            localStorage[variableName] = generatedId;
        }
        return digg(localStorage, variableName);
    }
    createInitialTableSetting = async () => {
        const tableSettingData = {
            identifier: this.identifier(),
            user_id: this.currentUserIdOrFallback(),
            user_type: this.currentUserTypeOrFallback(),
            columns_attributes: {}
        };
        const columns = this.columns();
        for (const columnKey in columns) {
            const column = digg(columns, columnKey);
            const identifier = columnIdentifier(column);
            const columnData = this.columnSaveData(column, { identifier, position: columnKey });
            tableSettingData.columns_attributes[columnKey] = columnData;
        }
        const tableSetting = new TableSetting();
        const tableSettingFormData = objectToFormData({ table_setting: tableSettingData });
        await tableSetting.saveRaw(tableSettingFormData);
        const reloadedTableSetting = await this.loadTableSetting();
        return reloadedTableSetting;
    };
    columnSaveData(column, { identifier, position }) {
        return {
            attribute_name: column.attribute,
            identifier,
            path: column.path,
            position,
            sort_key: column.sortKey,
            visible: null
        };
    }
    updateTableSetting = async (tableSetting) => {
        const changedAttributesList = ["attributeName", "sortKey"];
        const columns = this.columns();
        const columnsData = {};
        const tableSettingData = { columns_attributes: columnsData };
        let columnsKeyCount = 0;
        let changed = false;
        // Add missing columns
        for (const column of columns) {
            const identifier = columnIdentifier(column);
            const tableSettingColumn = tableSetting.columns().loaded().find((tableSettingColumn) => tableSettingColumn.identifier() == identifier);
            if (!tableSettingColumn) {
                const columnKey = ++columnsKeyCount;
                columnsData[columnKey] = this.columnSaveData(column, {
                    identifier,
                    position: tableSetting.columns().loaded().length + columnKey
                });
                logger.debug(() => `Changed because of new column: ${column.label}`);
                changed = true;
            }
        }
        for (const tableSettingColumn of tableSetting.columns().loaded()) {
            const column = columns.find((column) => columnIdentifier(column) == tableSettingColumn.identifier());
            if (column) {
                // TODO: Update column if changed
                let columnChanged = false;
                for (const changedAttribute of changedAttributesList) {
                    let columnAttributeName;
                    if (changedAttribute == "attributeName") {
                        columnAttributeName = "attribute";
                    }
                    else {
                        columnAttributeName = changedAttribute;
                    }
                    const oldAttributeValue = tableSettingColumn[changedAttribute]();
                    const newAttributeValue = column[columnAttributeName];
                    if (oldAttributeValue != newAttributeValue) {
                        logger.debug(() => `${changedAttribute} changed from ${oldAttributeValue} to ${newAttributeValue} on column: ${column.label}`);
                        columnChanged = true;
                    }
                }
                const columnPathAsString = JSON.stringify(column.path);
                const tableSettingColumnPathAsString = tableSettingColumn.path();
                if (columnPathAsString != tableSettingColumnPathAsString) {
                    logger.debug(() => `Path changed on ${column.label} from ${columnPathAsString} to ${tableSettingColumnPathAsString}`);
                    columnChanged = true;
                }
                if (columnChanged) {
                    const columnKey = ++columnsKeyCount;
                    changed = true;
                    columnsData[columnKey] = {
                        attribute_name: column.attributeName,
                        id: tableSettingColumn.id(),
                        path: column.path,
                        sort_key: column.sortKey
                    };
                }
            }
            else {
                // Removed saved columns no longer found
                const columnKey = ++columnsKeyCount;
                columnsData[columnKey] = {
                    id: tableSettingColumn.id(),
                    _destroy: true
                };
                changed = true;
                logger.debug(() => `Column got removed: ${tableSettingColumn.identifier()}`);
            }
        }
        if (changed) {
            const tableSettingFormData = objectToFormData({ table_setting: tableSettingData });
            await tableSetting.saveRaw(tableSettingFormData);
        }
        return tableSetting;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtc2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL3RhYmxlLXNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sZ0JBQWdCLE1BQU0sd0JBQXdCLENBQUE7QUFDckQsT0FBTyxhQUFhLE1BQU0scUJBQXFCLENBQUE7QUFDL0MsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLE1BQU0sTUFBTSxjQUFjLENBQUE7QUFDakMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzVDLE9BQU8sRUFBQyxTQUFTLElBQUksZ0JBQWdCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sV0FBVyxDQUFBO0FBQ3RDLE9BQU8sRUFBQyxFQUFFLElBQUksTUFBTSxFQUFDLE1BQU0sTUFBTSxDQUFBO0FBRWpDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFDLENBQUMsQ0FBQTtBQUU3RCwrQ0FBK0M7QUFDL0MsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUE7QUFFN0IsTUFBTSxDQUFDLE9BQU8sT0FBTyxxQkFBcUI7SUFDeEMsWUFBWSxFQUFDLEtBQUssRUFBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUNsQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtJQUM3QixDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUVwQyxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksa0JBQWtCLENBQUMsRUFBRSxDQUFDO1lBQ3hDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksaUJBQWlC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QkFBdUIsa0JBQWtCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQzlFLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE1BQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMsRUFBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFBO1lBRWhGLE1BQU0sWUFBWSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ2xELENBQUM7UUFFRCxPQUFPLFlBQVksQ0FBQTtJQUNyQixDQUFDLENBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb2x1bW5JZGVudGlmaWVyIGZyb20gXCIuL2NvbHVtbi1pZGVudGlmaWVyLmpzXCJcbmltcG9ydCBjb2x1bW5WaXNpYmxlIGZyb20gXCIuL2NvbHVtbi12aXNpYmxlLmpzXCJcbmltcG9ydCB7ZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4uL2xvZ2dlci5qc1wiXG5pbXBvcnQge1JlYWRlcnNXcml0ZXJMb2NrfSBmcm9tIFwiZXBpYy1sb2Nrc1wiXG5pbXBvcnQge3NlcmlhbGl6ZSBhcyBvYmplY3RUb0Zvcm1EYXRhfSBmcm9tIFwib2JqZWN0LXRvLWZvcm1kYXRhXCJcbmltcG9ydCB7VGFibGVTZXR0aW5nfSBmcm9tIFwibW9kZWxzLmpzXCJcbmltcG9ydCB7djQgYXMgdXVpZHY0fSBmcm9tIFwidXVpZFwiXG5cbmNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoe25hbWU6IFwiQXBpTWFrZXIgLyBUYWJsZVNldHRpbmdzXCJ9KVxuXG4vLyBIYXZlIGEgbG9jayBmb3IgZWFjaCB1bmlxdWUgdGFibGUgaWRlbnRpZmllclxuY29uc3QgdGFibGVTZXR0aW5nc0xvY2tzID0ge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBpTWFrZXJUYWJsZVNldHRpbmdzIHtcbiAgY29uc3RydWN0b3Ioe3RhYmxlfSkge1xuICAgIHRoaXMudGFibGUgPSB0YWJsZVxuICAgIHRoaXMuc2V0VGFibGVTZXR0aW5nc0xvY2soKVxuICB9XG5cbiAgc2V0VGFibGVTZXR0aW5nc0xvY2soKSB7XG4gICAgY29uc3QgaWRlbnRpZmllciA9IHRoaXMuaWRlbnRpZmllcigpXG5cbiAgICBpZiAoIShpZGVudGlmaWVyIGluIHRhYmxlU2V0dGluZ3NMb2NrcykpIHtcbiAgICAgIHRhYmxlU2V0dGluZ3NMb2Nrc1tpZGVudGlmaWVyXSA9IG5ldyBSZWFkZXJzV3JpdGVyTG9jaygpXG4gICAgfVxuXG4gICAgdGhpcy50YWJsZVNldHRpbmdzTG9jayA9IGRpZ2codGFibGVTZXR0aW5nc0xvY2tzLCBpZGVudGlmaWVyKVxuICB9XG5cbiAgY29sdW1ucyA9ICgpID0+IGRpZ2codGhpcywgXCJ0YWJsZVwiLCBcImNvbHVtbnNBc0FycmF5XCIpKClcbiAgY3VycmVudFVzZXIgPSAoKSA9PiBkaWdnKHRoaXMsIFwidGFibGVcIiwgXCJwcm9wc1wiLCBcImN1cnJlbnRVc2VyXCIpXG4gIGlkZW50aWZpZXIgPSAoKSA9PiBkaWdnKHRoaXMsIFwidGFibGVcIiwgXCJzdGF0ZVwiLCBcImlkZW50aWZpZXJcIilcblxuICBwcmVwYXJlZENvbHVtbnMgPSAodGFibGVTZXR0aW5nKSA9PiB7XG4gICAgY29uc3QgY29sdW1ucyA9IHRoaXMudGFibGUuY29sdW1uc0FzQXJyYXkoKVxuICAgIGNvbnN0IG9yZGVyZWQgPSB0aGlzLm9yZGVyZWRUYWJsZVNldHRpbmdDb2x1bW5zKHRhYmxlU2V0dGluZylcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBjb2x1bW5zOiBbXSxcbiAgICAgIHByZWxvYWQ6IFtdXG4gICAgfVxuXG4gICAgaWYgKCFvcmRlcmVkKSByZXR1cm5cblxuICAgIGZvciAoY29uc3QgdGFibGVTZXR0aW5nQ29sdW1uIG9mIG9yZGVyZWQpIHtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW5JZGVudGlmaWVyKGNvbHVtbikgPT0gdGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKSlcblxuICAgICAgcmVzdWx0LmNvbHVtbnMucHVzaCh7Y29sdW1uLCB0YWJsZVNldHRpbmdDb2x1bW59KVxuXG4gICAgICAvLyBBZGQgbmVlZGVkIHByZWxvYWRzIGlmIGNvbHVtbiBpcyB2aXNpYmxlXG4gICAgICBpZiAoY29sdW1uVmlzaWJsZShjb2x1bW4sIHRhYmxlU2V0dGluZ0NvbHVtbikpIHtcbiAgICAgICAgaWYgKGNvbHVtbi5wYXRoKSB7XG4gICAgICAgICAgY29uc3QgcHJlbG9hZCA9IGNvbHVtbi5wYXRoLm1hcCgocGF0aFBhcnQpID0+IGluZmxlY3Rpb24udW5kZXJzY29yZShwYXRoUGFydCkpLmpvaW4oXCIuXCIpXG5cbiAgICAgICAgICBpZiAoIXJlc3VsdC5wcmVsb2FkLmluY2x1ZGVzKHByZWxvYWQpKSByZXN1bHQucHJlbG9hZC5wdXNoKHByZWxvYWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBvcmRlcmVkVGFibGVTZXR0aW5nQ29sdW1ucyA9ICh0YWJsZVNldHRpbmcpID0+IHtcbiAgICByZXR1cm4gdGFibGVTZXR0aW5nXG4gICAgICAuY29sdW1ucygpXG4gICAgICAubG9hZGVkKClcbiAgICAgIC5zb3J0KCh0YWJsZVNldHRpbmdDb2x1bW4xLCB0YWJsZVNldHRpbmdDb2x1bW4yKSA9PiB0YWJsZVNldHRpbmdDb2x1bW4xLnBvc2l0aW9uKCkgLSB0YWJsZVNldHRpbmdDb2x1bW4yLnBvc2l0aW9uKCkpXG4gIH1cblxuICBsb2FkRXhpc3RpbmdPckNyZWF0ZVRhYmxlU2V0dGluZ3MgPSBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMudGFibGVTZXR0aW5nc0xvY2sud3JpdGUoYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IHRhYmxlU2V0dGluZyA9IGF3YWl0IHRoaXMubG9hZFRhYmxlU2V0dGluZygpXG5cbiAgICAgIGlmICh0YWJsZVNldHRpbmcpIHtcbiAgICAgICAgdGFibGVTZXR0aW5nID0gYXdhaXQgdGhpcy51cGRhdGVUYWJsZVNldHRpbmcodGFibGVTZXR0aW5nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFibGVTZXR0aW5nID0gYXdhaXQgdGhpcy5jcmVhdGVJbml0aWFsVGFibGVTZXR0aW5nKClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRhYmxlU2V0dGluZ1xuICAgIH0pXG4gIH1cblxuICBsb2FkVGFibGVTZXR0aW5nID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghVGFibGVTZXR0aW5nKSB0aHJvdyBuZXcgRXJyb3IoXCJUYWJsZVNldHRpbmcgbW9kZWwgaXNuJ3QgZ2xvYmFsbHkgYXZhaWxhYmxlXCIpXG5cbiAgICBjb25zdCB0YWJsZVNldHRpbmcgPSBhd2FpdCBUYWJsZVNldHRpbmdcbiAgICAgIC5yYW5zYWNrKHtcbiAgICAgICAgaWRlbnRpZmllcl9lcTogdGhpcy5pZGVudGlmaWVyKCksXG4gICAgICAgIHVzZXJfaWRfZXE6IHRoaXMuY3VycmVudFVzZXJJZE9yRmFsbGJhY2soKSxcbiAgICAgICAgdXNlcl90eXBlX2VxOiB0aGlzLmN1cnJlbnRVc2VyVHlwZU9yRmFsbGJhY2soKVxuICAgICAgfSlcbiAgICAgIC5wcmVsb2FkKFwiY29sdW1uc1wiKVxuICAgICAgLmZpcnN0KClcblxuICAgIHJldHVybiB0YWJsZVNldHRpbmdcbiAgfVxuXG4gIGN1cnJlbnRVc2VySWRPckZhbGxiYWNrKCkge1xuICAgIGNvbnN0IGN1cnJlbnRVc2VyID0gdGhpcy5jdXJyZW50VXNlcigpXG5cbiAgICBpZiAoY3VycmVudFVzZXIpIHJldHVybiBjdXJyZW50VXNlci5pZCgpXG5cbiAgICByZXR1cm4gdGhpcy5hbm9ueW1vdXNlVXNlcklkKClcbiAgfVxuXG4gIGN1cnJlbnRVc2VyVHlwZU9yRmFsbGJhY2soKSB7XG4gICAgY29uc3QgY3VycmVudFVzZXIgPSB0aGlzLmN1cnJlbnRVc2VyKClcblxuICAgIGlmIChjdXJyZW50VXNlcikgcmV0dXJuIGRpZ2coY3VycmVudFVzZXIubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgYW5vbnltb3VzZVVzZXJJZCgpIHtcbiAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBgQXBpTWFrZXJUYWJsZUFub255bW91c1VzZXJJZC0ke3RoaXMuaWRlbnRpZmllcigpfWBcblxuICAgIGlmICghKHZhcmlhYmxlTmFtZSBpbiBsb2NhbFN0b3JhZ2UpKSB7XG4gICAgICBjb25zdCBnZW5lcmF0ZWRJZCA9IHV1aWR2NCgpXG5cbiAgICAgIGxvY2FsU3RvcmFnZVt2YXJpYWJsZU5hbWVdID0gZ2VuZXJhdGVkSWRcbiAgICB9XG5cbiAgICByZXR1cm4gZGlnZyhsb2NhbFN0b3JhZ2UsIHZhcmlhYmxlTmFtZSlcbiAgfVxuXG4gIGNyZWF0ZUluaXRpYWxUYWJsZVNldHRpbmcgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGFibGVTZXR0aW5nRGF0YSA9IHtcbiAgICAgIGlkZW50aWZpZXI6IHRoaXMuaWRlbnRpZmllcigpLFxuICAgICAgdXNlcl9pZDogdGhpcy5jdXJyZW50VXNlcklkT3JGYWxsYmFjaygpLFxuICAgICAgdXNlcl90eXBlOiB0aGlzLmN1cnJlbnRVc2VyVHlwZU9yRmFsbGJhY2soKSxcbiAgICAgIGNvbHVtbnNfYXR0cmlidXRlczoge31cbiAgICB9XG5cbiAgICBjb25zdCBjb2x1bW5zID0gdGhpcy5jb2x1bW5zKClcblxuICAgIGZvciAoY29uc3QgY29sdW1uS2V5IGluIGNvbHVtbnMpIHtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IGRpZ2coY29sdW1ucywgY29sdW1uS2V5KVxuICAgICAgY29uc3QgaWRlbnRpZmllciA9IGNvbHVtbklkZW50aWZpZXIoY29sdW1uKVxuICAgICAgY29uc3QgY29sdW1uRGF0YSA9IHRoaXMuY29sdW1uU2F2ZURhdGEoY29sdW1uLCB7aWRlbnRpZmllciwgcG9zaXRpb246IGNvbHVtbktleX0pXG5cbiAgICAgIHRhYmxlU2V0dGluZ0RhdGEuY29sdW1uc19hdHRyaWJ1dGVzW2NvbHVtbktleV0gPSBjb2x1bW5EYXRhXG4gICAgfVxuXG4gICAgY29uc3QgdGFibGVTZXR0aW5nID0gbmV3IFRhYmxlU2V0dGluZygpXG4gICAgY29uc3QgdGFibGVTZXR0aW5nRm9ybURhdGEgPSBvYmplY3RUb0Zvcm1EYXRhKHt0YWJsZV9zZXR0aW5nOiB0YWJsZVNldHRpbmdEYXRhfSlcblxuICAgIGF3YWl0IHRhYmxlU2V0dGluZy5zYXZlUmF3KHRhYmxlU2V0dGluZ0Zvcm1EYXRhKVxuXG4gICAgY29uc3QgcmVsb2FkZWRUYWJsZVNldHRpbmcgPSBhd2FpdCB0aGlzLmxvYWRUYWJsZVNldHRpbmcoKVxuXG4gICAgcmV0dXJuIHJlbG9hZGVkVGFibGVTZXR0aW5nXG4gIH1cblxuICBjb2x1bW5TYXZlRGF0YShjb2x1bW4sIHtpZGVudGlmaWVyLCBwb3NpdGlvbn0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgYXR0cmlidXRlX25hbWU6IGNvbHVtbi5hdHRyaWJ1dGUsXG4gICAgICBpZGVudGlmaWVyLFxuICAgICAgcGF0aDogY29sdW1uLnBhdGgsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIHNvcnRfa2V5OiBjb2x1bW4uc29ydEtleSxcbiAgICAgIHZpc2libGU6IG51bGxcbiAgICB9XG4gIH1cblxuICB1cGRhdGVUYWJsZVNldHRpbmcgPSBhc3luYyAodGFibGVTZXR0aW5nKSA9PiB7XG4gICAgY29uc3QgY2hhbmdlZEF0dHJpYnV0ZXNMaXN0ID0gW1wiYXR0cmlidXRlTmFtZVwiLCBcInNvcnRLZXlcIl1cbiAgICBjb25zdCBjb2x1bW5zID0gdGhpcy5jb2x1bW5zKClcbiAgICBjb25zdCBjb2x1bW5zRGF0YSA9IHt9XG4gICAgY29uc3QgdGFibGVTZXR0aW5nRGF0YSA9IHtjb2x1bW5zX2F0dHJpYnV0ZXM6IGNvbHVtbnNEYXRhfVxuICAgIGxldCBjb2x1bW5zS2V5Q291bnQgPSAwXG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZVxuXG4gICAgLy8gQWRkIG1pc3NpbmcgY29sdW1uc1xuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHVtbnMpIHtcbiAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSBjb2x1bW5JZGVudGlmaWVyKGNvbHVtbilcbiAgICAgIGNvbnN0IHRhYmxlU2V0dGluZ0NvbHVtbiA9IHRhYmxlU2V0dGluZy5jb2x1bW5zKCkubG9hZGVkKCkuZmluZCgodGFibGVTZXR0aW5nQ29sdW1uKSA9PiB0YWJsZVNldHRpbmdDb2x1bW4uaWRlbnRpZmllcigpID09IGlkZW50aWZpZXIpXG5cbiAgICAgIGlmICghdGFibGVTZXR0aW5nQ29sdW1uKSB7XG4gICAgICAgIGNvbnN0IGNvbHVtbktleSA9ICsrY29sdW1uc0tleUNvdW50XG5cbiAgICAgICAgY29sdW1uc0RhdGFbY29sdW1uS2V5XSA9IHRoaXMuY29sdW1uU2F2ZURhdGEoXG4gICAgICAgICAgY29sdW1uLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkZW50aWZpZXIsXG4gICAgICAgICAgICBwb3NpdGlvbjogdGFibGVTZXR0aW5nLmNvbHVtbnMoKS5sb2FkZWQoKS5sZW5ndGggKyBjb2x1bW5LZXlcbiAgICAgICAgICB9XG4gICAgICAgIClcblxuICAgICAgICBsb2dnZXIuZGVidWcoKCkgPT4gYENoYW5nZWQgYmVjYXVzZSBvZiBuZXcgY29sdW1uOiAke2NvbHVtbi5sYWJlbH1gKVxuICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgdGFibGVTZXR0aW5nQ29sdW1uIG9mIHRhYmxlU2V0dGluZy5jb2x1bW5zKCkubG9hZGVkKCkpIHtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW5JZGVudGlmaWVyKGNvbHVtbikgPT0gdGFibGVTZXR0aW5nQ29sdW1uLmlkZW50aWZpZXIoKSlcblxuICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAvLyBUT0RPOiBVcGRhdGUgY29sdW1uIGlmIGNoYW5nZWRcbiAgICAgICAgbGV0IGNvbHVtbkNoYW5nZWQgPSBmYWxzZVxuXG4gICAgICAgIGZvciAoY29uc3QgY2hhbmdlZEF0dHJpYnV0ZSBvZiBjaGFuZ2VkQXR0cmlidXRlc0xpc3QpIHtcbiAgICAgICAgICBsZXQgY29sdW1uQXR0cmlidXRlTmFtZVxuXG4gICAgICAgICAgaWYgKGNoYW5nZWRBdHRyaWJ1dGUgPT0gXCJhdHRyaWJ1dGVOYW1lXCIpIHtcbiAgICAgICAgICAgIGNvbHVtbkF0dHJpYnV0ZU5hbWUgPSBcImF0dHJpYnV0ZVwiXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbHVtbkF0dHJpYnV0ZU5hbWUgPSBjaGFuZ2VkQXR0cmlidXRlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgb2xkQXR0cmlidXRlVmFsdWUgPSB0YWJsZVNldHRpbmdDb2x1bW5bY2hhbmdlZEF0dHJpYnV0ZV0oKVxuICAgICAgICAgIGNvbnN0IG5ld0F0dHJpYnV0ZVZhbHVlID0gY29sdW1uW2NvbHVtbkF0dHJpYnV0ZU5hbWVdXG5cbiAgICAgICAgICBpZiAob2xkQXR0cmlidXRlVmFsdWUgIT0gbmV3QXR0cmlidXRlVmFsdWUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygoKSA9PiBgJHtjaGFuZ2VkQXR0cmlidXRlfSBjaGFuZ2VkIGZyb20gJHtvbGRBdHRyaWJ1dGVWYWx1ZX0gdG8gJHtuZXdBdHRyaWJ1dGVWYWx1ZX0gb24gY29sdW1uOiAke2NvbHVtbi5sYWJlbH1gKVxuICAgICAgICAgICAgY29sdW1uQ2hhbmdlZCA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb2x1bW5QYXRoQXNTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShjb2x1bW4ucGF0aClcbiAgICAgICAgY29uc3QgdGFibGVTZXR0aW5nQ29sdW1uUGF0aEFzU3RyaW5nID0gdGFibGVTZXR0aW5nQ29sdW1uLnBhdGgoKVxuXG4gICAgICAgIGlmIChjb2x1bW5QYXRoQXNTdHJpbmcgIT0gdGFibGVTZXR0aW5nQ29sdW1uUGF0aEFzU3RyaW5nKSB7XG4gICAgICAgICAgbG9nZ2VyLmRlYnVnKCgpID0+IGBQYXRoIGNoYW5nZWQgb24gJHtjb2x1bW4ubGFiZWx9IGZyb20gJHtjb2x1bW5QYXRoQXNTdHJpbmd9IHRvICR7dGFibGVTZXR0aW5nQ29sdW1uUGF0aEFzU3RyaW5nfWApXG4gICAgICAgICAgY29sdW1uQ2hhbmdlZCA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2x1bW5DaGFuZ2VkKSB7XG4gICAgICAgICAgY29uc3QgY29sdW1uS2V5ID0gKytjb2x1bW5zS2V5Q291bnRcblxuICAgICAgICAgIGNoYW5nZWQgPSB0cnVlXG4gICAgICAgICAgY29sdW1uc0RhdGFbY29sdW1uS2V5XSA9IHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZV9uYW1lOiBjb2x1bW4uYXR0cmlidXRlTmFtZSxcbiAgICAgICAgICAgIGlkOiB0YWJsZVNldHRpbmdDb2x1bW4uaWQoKSxcbiAgICAgICAgICAgIHBhdGg6IGNvbHVtbi5wYXRoLFxuICAgICAgICAgICAgc29ydF9rZXk6IGNvbHVtbi5zb3J0S2V5XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZW1vdmVkIHNhdmVkIGNvbHVtbnMgbm8gbG9uZ2VyIGZvdW5kXG4gICAgICAgIGNvbnN0IGNvbHVtbktleSA9ICsrY29sdW1uc0tleUNvdW50XG5cbiAgICAgICAgY29sdW1uc0RhdGFbY29sdW1uS2V5XSA9IHtcbiAgICAgICAgICBpZDogdGFibGVTZXR0aW5nQ29sdW1uLmlkKCksXG4gICAgICAgICAgX2Rlc3Ryb3k6IHRydWVcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2VkID0gdHJ1ZVxuXG4gICAgICAgIGxvZ2dlci5kZWJ1ZygoKSA9PiBgQ29sdW1uIGdvdCByZW1vdmVkOiAke3RhYmxlU2V0dGluZ0NvbHVtbi5pZGVudGlmaWVyKCl9YClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZCkge1xuICAgICAgY29uc3QgdGFibGVTZXR0aW5nRm9ybURhdGEgPSBvYmplY3RUb0Zvcm1EYXRhKHt0YWJsZV9zZXR0aW5nOiB0YWJsZVNldHRpbmdEYXRhfSlcblxuICAgICAgYXdhaXQgdGFibGVTZXR0aW5nLnNhdmVSYXcodGFibGVTZXR0aW5nRm9ybURhdGEpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRhYmxlU2V0dGluZ1xuICB9XG59XG4iXX0=