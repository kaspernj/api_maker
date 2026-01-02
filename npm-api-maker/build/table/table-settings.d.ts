export default class ApiMakerTableSettings {
    constructor({ table }: {
        table: any;
    });
    table: any;
    setTableSettingsLock(): void;
    tableSettingsLock: any;
    columns: () => any;
    currentUser: () => any;
    identifier: () => any;
    preparedColumns: (tableSetting: any) => {
        columns: any[];
        preload: any[];
    };
    orderedTableSettingColumns: (tableSetting: any) => any;
    loadExistingOrCreateTableSettings: () => Promise<any>;
    loadTableSetting: () => Promise<any>;
    currentUserIdOrFallback(): any;
    currentUserTypeOrFallback(): any;
    anonymouseUserId(): any;
    createInitialTableSetting: () => Promise<any>;
    columnSaveData(column: any, { identifier, position }: {
        identifier: any;
        position: any;
    }): {
        attribute_name: any;
        identifier: any;
        path: any;
        position: any;
        sort_key: any;
        visible: any;
    };
    updateTableSetting: (tableSetting: any) => Promise<any>;
}
//# sourceMappingURL=table-settings.d.ts.map