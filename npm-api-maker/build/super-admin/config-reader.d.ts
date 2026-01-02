export default class ApiMakerSuperAdminConfigReader {
    static forModel(modelClass: any): ApiMakerSuperAdminConfigReader;
    constructor(modelClass: any, modelConfig: any);
    modelClass: any;
    modelConfig: any;
    attributesToShow(): any;
    defaultAttributesToShow(): any[];
    tableColumns(): {
        columns: {
            attribute: any;
        }[];
        select: {};
    } | {
        columns: any;
    };
    defaultTableColumns(): {
        columns: {
            attribute: any;
        }[];
        select: {};
    };
}
//# sourceMappingURL=config-reader.d.ts.map