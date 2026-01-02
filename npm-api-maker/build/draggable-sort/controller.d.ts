export default class DraggableSortController {
    constructor({ data, events, keyExtractor }: {
        data: any;
        events: any;
        keyExtractor: any;
    });
    data: any;
    currentOrder: any[];
    events: any;
    keyExtractor: any;
    draggedItem: any;
    draggedItemData: any;
    draggedItemNewPosition: number;
    draggedOverItem: any;
    draggedOverItemData: any;
    itemData: {};
    getEvents: () => any;
    getItemDataForItem: (item: any) => any;
    getItemDataForKey: (key: any) => any;
    getItemDataForIndex: (index: any) => any;
    onDragStart: ({ item, itemIndex }: {
        item: any;
        itemIndex: any;
    }) => void;
    draggedItemIndex: any;
    draggedItemPosition: any;
    onDragEnd: () => void;
    onItemLayout: ({ events, index, item, layout }: {
        events: any;
        index: any;
        item: any;
        layout: any;
    }) => void;
    onMove: ({ gestate }: {
        gestate: any;
    }) => void;
    setInitialDragPosition: (initialDragPosition: any) => void;
    initialDragPosition: any;
    updatePositionOfItems(): void;
}
//# sourceMappingURL=controller.d.ts.map