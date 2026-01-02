import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import BaseComponent from "./base-component";
import memo from "set-state-compare/build/memo.js";
import React from "react";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import { Modal, Pressable, View } from "react-native";
export default memo(shapeComponent(class ApiMakerModal extends BaseComponent {
    render() {
        const { children, onRequestClose, ...restProps } = this.props;
        return (_jsx(Modal, { onRequestClose: onRequestClose, ...restProps, children: _jsxs(View, { style: this.cache("rootViewStyle", {
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "100%",
                    minHeight: "100%",
                    padding: 20,
                }), children: [_jsx(Pressable, { dataSet: this.cache("pressableDataSet", { class: "modal-backdrop" }), onPress: onRequestClose, style: this.cache("pressableStyle", {
                            position: "absolute",
                            minWidth: "100%",
                            minHeight: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)"
                        }) }), children] }) }));
    }
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbIm1vZGFsLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxhQUFhLE1BQU0sa0JBQWtCLENBQUE7QUFDNUMsT0FBTyxJQUFJLE1BQU0saUNBQWlDLENBQUE7QUFDbEQsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQTtBQUN6RSxPQUFPLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsTUFBTSxjQUFjLENBQUE7QUFFbkQsZUFBZSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sYUFBYyxTQUFRLGFBQWE7SUFDMUUsTUFBTTtRQUNKLE1BQU0sRUFBQyxRQUFRLEVBQUUsY0FBYyxFQUFFLEdBQUcsU0FBUyxFQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUUzRCxPQUFPLENBQ0wsS0FBQyxLQUFLLElBQUMsY0FBYyxFQUFFLGNBQWMsS0FBTSxTQUFTLFlBQ2xELE1BQUMsSUFBSSxJQUNILEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRTtvQkFDakMsVUFBVSxFQUFFLFFBQVE7b0JBQ3BCLGNBQWMsRUFBRSxRQUFRO29CQUN4QixRQUFRLEVBQUUsTUFBTTtvQkFDaEIsU0FBUyxFQUFFLE1BQU07b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNaLENBQUMsYUFFRixLQUFDLFNBQVMsSUFDUixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxFQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLEVBQ2xFLE9BQU8sRUFBRSxjQUFjLEVBQ3ZCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFOzRCQUNsQyxRQUFRLEVBQUUsVUFBVTs0QkFDcEIsUUFBUSxFQUFFLE1BQU07NEJBQ2hCLFNBQVMsRUFBRSxNQUFNOzRCQUNqQixlQUFlLEVBQUUsb0JBQW9CO3lCQUN0QyxDQUFDLEdBQ0YsRUFDRCxRQUFRLElBQ0osR0FDRCxDQUNULENBQUE7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tIFwiLi9iYXNlLWNvbXBvbmVudFwiXG5pbXBvcnQgbWVtbyBmcm9tIFwic2V0LXN0YXRlLWNvbXBhcmUvYnVpbGQvbWVtby5qc1wiXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7c2hhcGVDb21wb25lbnR9IGZyb20gXCJzZXQtc3RhdGUtY29tcGFyZS9idWlsZC9zaGFwZS1jb21wb25lbnQuanNcIlxuaW1wb3J0IHtNb2RhbCwgUHJlc3NhYmxlLCBWaWV3fSBmcm9tIFwicmVhY3QtbmF0aXZlXCJcblxuZXhwb3J0IGRlZmF1bHQgbWVtbyhzaGFwZUNvbXBvbmVudChjbGFzcyBBcGlNYWtlck1vZGFsIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7Y2hpbGRyZW4sIG9uUmVxdWVzdENsb3NlLCAuLi5yZXN0UHJvcHN9ID0gdGhpcy5wcm9wc1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxNb2RhbCBvblJlcXVlc3RDbG9zZT17b25SZXF1ZXN0Q2xvc2V9IHsuLi5yZXN0UHJvcHN9PlxuICAgICAgICA8Vmlld1xuICAgICAgICAgIHN0eWxlPXt0aGlzLmNhY2hlKFwicm9vdFZpZXdTdHlsZVwiLCB7XG4gICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBtaW5XaWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBtaW5IZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgcGFkZGluZzogMjAsXG4gICAgICAgICAgfSl9XG4gICAgICAgID5cbiAgICAgICAgICA8UHJlc3NhYmxlXG4gICAgICAgICAgICBkYXRhU2V0PXt0aGlzLmNhY2hlKFwicHJlc3NhYmxlRGF0YVNldFwiLCB7Y2xhc3M6IFwibW9kYWwtYmFja2Ryb3BcIn0pfVxuICAgICAgICAgICAgb25QcmVzcz17b25SZXF1ZXN0Q2xvc2V9XG4gICAgICAgICAgICBzdHlsZT17dGhpcy5jYWNoZShcInByZXNzYWJsZVN0eWxlXCIsIHtcbiAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgbWluV2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICBtaW5IZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLCAwLCAwLCAwLjUpXCJcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgIC8+XG4gICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICA8L1ZpZXc+XG4gICAgICA8L01vZGFsPlxuICAgIClcbiAgfVxufSkpXG4iXX0=