import { jsx as _jsx } from "react/jsx-runtime";
import BaseComponent from "./base-component";
import PropTypes from "prop-types";
import propTypesExact from "prop-types-exact";
import React, { memo, Suspense } from "react";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import usePath from "on-location-changed/build/use-path.js";
import useRouter from "./use-router";
export default memo(shapeComponent(class ApiMakerRouter extends BaseComponent {
    static propTypes = propTypesExact({
        history: PropTypes.object,
        locales: PropTypes.array.isRequired,
        notFoundComponent: PropTypes.elementType,
        requireComponent: PropTypes.func.isRequired,
        routeDefinitions: PropTypes.object,
        routes: PropTypes.object
    });
    render() {
        const path = usePath();
        const { locales, notFoundComponent, requireComponent, routeDefinitions, routes } = this.props;
        const { match } = useRouter({ locales, path, routes, routeDefinitions });
        const { matchingRoute } = match;
        if (!matchingRoute) {
            if (notFoundComponent) {
                const NotFoundComponent = notFoundComponent;
                return (_jsx(Suspense, { fallback: _jsx("div", {}), children: _jsx(NotFoundComponent, { match: match }) }));
            }
            else {
                return null;
            }
        }
        const Component = requireComponent({ routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition });
        return (_jsx(Suspense, { fallback: _jsx("div", {}), children: _jsx(Component, { match: match }) }));
    }
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJyb3V0ZXIuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLGFBQWEsTUFBTSxrQkFBa0IsQ0FBQTtBQUM1QyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUE7QUFDbEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUE7QUFDN0MsT0FBTyxLQUFLLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLE1BQU0sT0FBTyxDQUFBO0FBQzNDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSw0Q0FBNEMsQ0FBQTtBQUN6RSxPQUFPLE9BQU8sTUFBTSx1Q0FBdUMsQ0FBQTtBQUMzRCxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUE7QUFFcEMsZUFBZSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sY0FBZSxTQUFRLGFBQWE7SUFDM0UsTUFBTSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7UUFDaEMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLE9BQU8sRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVU7UUFDbkMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLFdBQVc7UUFDeEMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO1FBQzNDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxNQUFNO1FBQ2xDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtLQUN6QixDQUFDLENBQUE7SUFFRixNQUFNO1FBQ0osTUFBTSxJQUFJLEdBQUcsT0FBTyxFQUFFLENBQUE7UUFDdEIsTUFBTSxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQzNGLE1BQU0sRUFBQyxLQUFLLEVBQUMsR0FBRyxTQUFTLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUE7UUFDcEUsTUFBTSxFQUFDLGFBQWEsRUFBQyxHQUFHLEtBQUssQ0FBQTtRQUU3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDbkIsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2dCQUN0QixNQUFNLGlCQUFpQixHQUFHLGlCQUFpQixDQUFBO2dCQUUzQyxPQUFPLENBQ0wsS0FBQyxRQUFRLElBQUMsUUFBUSxFQUFFLGVBQU8sWUFDekIsS0FBQyxpQkFBaUIsSUFBQyxLQUFLLEVBQUUsS0FBSyxHQUFJLEdBQzFCLENBQ1osQ0FBQTtZQUNILENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLElBQUksQ0FBQTtZQUNiLENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsRUFBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsRUFBQyxDQUFDLENBQUE7UUFFMUcsT0FBTyxDQUNMLEtBQUMsUUFBUSxJQUFDLFFBQVEsRUFBRSxlQUFPLFlBQ3pCLEtBQUMsU0FBUyxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksR0FDbEIsQ0FDWixDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSBcIi4vYmFzZS1jb21wb25lbnRcIlxuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiXG5pbXBvcnQgcHJvcFR5cGVzRXhhY3QgZnJvbSBcInByb3AtdHlwZXMtZXhhY3RcIlxuaW1wb3J0IFJlYWN0LCB7bWVtbywgU3VzcGVuc2V9IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQge3NoYXBlQ29tcG9uZW50fSBmcm9tIFwic2V0LXN0YXRlLWNvbXBhcmUvYnVpbGQvc2hhcGUtY29tcG9uZW50LmpzXCJcbmltcG9ydCB1c2VQYXRoIGZyb20gXCJvbi1sb2NhdGlvbi1jaGFuZ2VkL2J1aWxkL3VzZS1wYXRoLmpzXCJcbmltcG9ydCB1c2VSb3V0ZXIgZnJvbSBcIi4vdXNlLXJvdXRlclwiXG5cbmV4cG9ydCBkZWZhdWx0IG1lbW8oc2hhcGVDb21wb25lbnQoY2xhc3MgQXBpTWFrZXJSb3V0ZXIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHByb3BUeXBlc0V4YWN0KHtcbiAgICBoaXN0b3J5OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGxvY2FsZXM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICAgIG5vdEZvdW5kQ29tcG9uZW50OiBQcm9wVHlwZXMuZWxlbWVudFR5cGUsXG4gICAgcmVxdWlyZUNvbXBvbmVudDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByb3V0ZURlZmluaXRpb25zOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHJvdXRlczogUHJvcFR5cGVzLm9iamVjdFxuICB9KVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBwYXRoID0gdXNlUGF0aCgpXG4gICAgY29uc3Qge2xvY2FsZXMsIG5vdEZvdW5kQ29tcG9uZW50LCByZXF1aXJlQ29tcG9uZW50LCByb3V0ZURlZmluaXRpb25zLCByb3V0ZXN9ID0gdGhpcy5wcm9wc1xuICAgIGNvbnN0IHttYXRjaH0gPSB1c2VSb3V0ZXIoe2xvY2FsZXMsIHBhdGgsIHJvdXRlcywgcm91dGVEZWZpbml0aW9uc30pXG4gICAgY29uc3Qge21hdGNoaW5nUm91dGV9ID0gbWF0Y2hcblxuICAgIGlmICghbWF0Y2hpbmdSb3V0ZSkge1xuICAgICAgaWYgKG5vdEZvdW5kQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbnN0IE5vdEZvdW5kQ29tcG9uZW50ID0gbm90Rm91bmRDb21wb25lbnRcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxTdXNwZW5zZSBmYWxsYmFjaz17PGRpdiAvPn0+XG4gICAgICAgICAgICA8Tm90Rm91bmRDb21wb25lbnQgbWF0Y2g9e21hdGNofSAvPlxuICAgICAgICAgIDwvU3VzcGVuc2U+XG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgQ29tcG9uZW50ID0gcmVxdWlyZUNvbXBvbmVudCh7cm91dGVEZWZpbml0aW9uOiBtYXRjaGluZ1JvdXRlLnBhcnNlZFJvdXRlRGVmaW5pdGlvbi5yb3V0ZURlZmluaXRpb259KVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxTdXNwZW5zZSBmYWxsYmFjaz17PGRpdiAvPn0+XG4gICAgICAgIDxDb21wb25lbnQgbWF0Y2g9e21hdGNofSAvPlxuICAgICAgPC9TdXNwZW5zZT5cbiAgICApXG4gIH1cbn0pKVxuIl19