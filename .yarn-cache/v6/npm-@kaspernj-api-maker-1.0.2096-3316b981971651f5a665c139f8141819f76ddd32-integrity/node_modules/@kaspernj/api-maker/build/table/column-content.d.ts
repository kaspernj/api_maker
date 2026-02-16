export default class ApiMakerTableColumnContent {
    constructor({ column, l, mode, model, t, table }: {
        column: any;
        l: any;
        mode?: string;
        model: any;
        t: any;
        table: any;
    });
    column: any;
    l: any;
    mode: string;
    model: any;
    t: any;
    table: any;
    columnContentFromContentArg(): any;
    columnsContentFromAttributeAndPath(): any;
    content(): any;
    presentColumnValue: (value: any) => any;
    presentDateTime: ({ apiMakerType, value }: {
        apiMakerType: any;
        value: any;
    }) => any;
}
//# sourceMappingURL=column-content.d.ts.map