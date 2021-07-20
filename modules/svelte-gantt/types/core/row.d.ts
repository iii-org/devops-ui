export interface RowModel {
    id: number;
    classes?: string | string[];
    contentHtml?: string;
    enableDragging?: boolean;
    height: number;
    children?: RowModel[];
    has_children?: boolean;
    click?: () => void;
}
export interface SvelteRow {
    model: RowModel;
    y: number;
    height: number;
    hidden?: boolean;
    children?: SvelteRow[];
    allChildren?: SvelteRow[];
    parent?: SvelteRow;
    allParents?: SvelteRow[];
    expanded?: boolean;
    childLevel?: number;
    has_children?: boolean;
    click?: () => void;
}
export declare class RowFactory {
    rowHeight: number;
    constructor();
    createRow(row: RowModel, y: number): SvelteRow;
    createRows(rows: RowModel[]): any[];
    createChildRows(rowModels: RowModel[], ctx: {
        y: number;
        result: SvelteRow[];
    }, parent?: SvelteRow, level?: number, parents?: SvelteRow[]): {
        rows: any[];
        allRows: any[];
    };
}
