export default class TableWidths {
    constructor({ columns, table, width }: {
        columns: any;
        table: any;
        width: any;
    });
    columns: any;
    tableWidth: any;
    table: any;
    setWidths(): void;
    columnsWidths: {};
    getWidthOfColumn(identifier: any): any;
    setWidthOfColumn({ identifier, width }: {
        identifier: any;
        width: any;
    }): void;
}
//# sourceMappingURL=widths.d.ts.map