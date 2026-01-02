export default class ApiMakerSuperAdminConfigReader {
    static forModel(modelClass: any): ApiMakerSuperAdminConfigReader;
    constructor(modelClass: any, modelConfig: any);
    modelClass: any;
    modelConfig: any;
    attributesToShow(): any;
    defaultAttributesToShow(): any[];
    tableColumns(): {
        columns: {
            attribute: string;
        }[];
        select: {};
    } | {
        columns: any;
    };
    defaultTableColumns(): {
        columns: {
            attribute: string;
        }[];
        select: {};
    };
}
//# sourceMappingURL=config-reader.d.ts.map