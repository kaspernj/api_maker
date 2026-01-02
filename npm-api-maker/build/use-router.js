import config from "./config.js";
import escapeStringRegexp from "escape-string-regexp";
import * as inflection from "inflection";
import PropTypes from "prop-types";
import propTypesExact from "prop-types-exact";
import { useCallback, useMemo } from "react";
import useShape from "set-state-compare/build/use-shape.js";
const useRouterPropTypes = propTypesExact({
    locales: PropTypes.array.isRequired,
    path: PropTypes.string,
    routeDefinitions: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired
});
const useRouter = (props) => {
    PropTypes.checkPropTypes(useRouterPropTypes, props, "prop", "useRouter");
    const s = useShape(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const findRouteParams = useCallback((routeDefinition) => {
        const result = [];
        const parts = routeDefinition.path.split("/");
        for (const part of parts) {
            if (part.match(/^:([a-z_]+)$/))
                result.push(part);
        }
        return result;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getPath = useCallback(() => {
        let path = s.p.path || window.location.pathname;
        path = path.replace(/[/]+$/, "");
        return path;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getRouteDefinitions = useCallback(() => s.p.routeDefinitions || config.getRouteDefinitions(), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getRoutes = useCallback(() => s.p.routes || config.getRoutes(), []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parseRouteDefinitions = useCallback(() => {
        const routeDefinitions = getRouteDefinitions();
        const routes = getRoutes();
        const regex = /:([A-z\d_]+)/;
        const parsedRouteDefinitions = [];
        for (const locale of s.p.locales) {
            for (const routeDefinition of routeDefinitions.routes) {
                const routePathName = `${inflection.camelize(routeDefinition.name, true)}Path`;
                const params = findRouteParams(routeDefinition);
                params.push({ locale });
                if (!(routePathName in routes))
                    throw new Error(`${routePathName} not found in routes: ${Object.keys(routes, ", ")}`);
                const routePath = routes[routePathName](...params).replace(/[/]+$/, "");
                const groups = [];
                let pathRegexString = "^";
                pathRegexString += escapeStringRegexp(routePath);
                while (true) {
                    const match = pathRegexString.match(regex);
                    if (!match)
                        break;
                    const variableName = match[1];
                    groups.push(variableName);
                    pathRegexString = pathRegexString.replace(match[0], "([^/]+)");
                }
                pathRegexString += "$";
                const pathRegex = new RegExp(pathRegexString);
                parsedRouteDefinitions.push({ groups, pathRegex, routeDefinition });
            }
        }
        return parsedRouteDefinitions;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parsedRouteDefinitions = useMemo(() => parseRouteDefinitions(), []);
    s.updateMeta({ parsedRouteDefinitions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const findMatchingRoute = useCallback(() => {
        const path = getPath();
        for (const parsedRouteDefinition of s.m.parsedRouteDefinitions) {
            const match = path.match(parsedRouteDefinition.pathRegex);
            let matched, params;
            if (match) {
                matched = true;
                params = {};
                for (const groupKey in parsedRouteDefinition.groups) {
                    const groupName = parsedRouteDefinition.groups[groupKey];
                    params[groupName] = match[Number(groupKey) + 1];
                }
            }
            if (path == "" && parsedRouteDefinition.routeDefinition.path == "/")
                matched = true; // eslint-disable-line eqeqeq
            if (matched) {
                return { params, parsedRouteDefinition };
            }
        }
    }, []);
    const matchingRoute = findMatchingRoute();
    const params = matchingRoute?.params || {};
    const match = {
        matchingRoute,
        params
    };
    return { match };
};
export default useRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLXJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsidXNlLXJvdXRlci5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sa0JBQWtCLE1BQU0sc0JBQXNCLENBQUE7QUFDckQsT0FBTyxLQUFLLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFDeEMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFBO0FBQ2xDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8sRUFBQyxXQUFXLEVBQUUsT0FBTyxFQUFDLE1BQU0sT0FBTyxDQUFBO0FBQzFDLE9BQU8sUUFBUSxNQUFNLHNDQUFzQyxDQUFBO0FBRTNELE1BQU0sa0JBQWtCLEdBQUcsY0FBYyxDQUFDO0lBQ3hDLE9BQU8sRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVU7SUFDbkMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBQ3RCLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtJQUM3QyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0NBQ3BDLENBQUMsQ0FBQTtBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDMUIsU0FBUyxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBRXhFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUV6Qix1REFBdUQ7SUFDdkQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUU7UUFDdEQsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO1FBQ2pCLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRTdDLEtBQUssTUFBTSxJ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LEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtnQkFDakQsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLElBQUksSUFBSSxFQUFFLElBQUkscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksSUFBSSxHQUFHO2dCQUFFLE9BQU8sR0FBRyxJQUFJLENBQUEsQ0FBQyw2QkFBNkI7WUFDakgsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDWixPQUFPLEVBQUMsTUFBTSxFQUFFLHFCQUFxQixFQUFDLENBQUE7WUFDeEMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixNQUFNLGFBQWEsR0FBRyxpQkFBaUIsRUFBRSxDQUFBO0lBQ3pDLE1BQU0sTUFBTSxHQUFHLGFBQWEsRUFBRSxNQUFNLElBQUksRUFBRSxDQUFBO0lBQzFDLE1BQU0sS0FBSyxHQUFHO1FBQ1osYUFBYTtRQUNiLE1BQU07S0FDUCxDQUFBO0lBRUQsT0FBTyxFQUFDLEtBQUssRUFBQyxDQUFBO0FBQ2hCLENBQUMsQ0FBQTtBQUVELGVBQWUsU0FBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNvbmZpZyBmcm9tIFwiLi9jb25maWcuanNcIlxuaW1wb3J0IGVzY2FwZVN0cmluZ1JlZ2V4cCBmcm9tIFwiZXNjYXBlLXN0cmluZy1yZWdleHBcIlxuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCJcbmltcG9ydCBwcm9wVHlwZXNFeGFjdCBmcm9tIFwicHJvcC10eXBlcy1leGFjdFwiXG5pbXBvcnQge3VzZUNhbGxiYWNrLCB1c2VNZW1vfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHVzZVNoYXBlIGZyb20gXCJzZXQtc3RhdGUtY29tcGFyZS9idWlsZC91c2Utc2hhcGUuanNcIlxuXG5jb25zdCB1c2VSb3V0ZXJQcm9wVHlwZXMgPSBwcm9wVHlwZXNFeGFjdCh7XG4gIGxvY2FsZXM6IFByb3BUeXBlcy5hcnJheS5pc1JlcXVpcmVkLFxuICBwYXRoOiBQcm9wVHlwZXMuc3RyaW5nLFxuICByb3V0ZURlZmluaXRpb25zOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIHJvdXRlczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkXG59KVxuXG5jb25zdCB1c2VSb3V0ZXIgPSAocHJvcHMpID0+IHtcbiAgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKHVzZVJvdXRlclByb3BUeXBlcywgcHJvcHMsIFwicHJvcFwiLCBcInVzZVJvdXRlclwiKVxuXG4gIGNvbnN0IHMgPSB1c2VTaGFwZShwcm9wcylcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIGNvbnN0IGZpbmRSb3V0ZVBhcmFtcyA9IHVzZUNhbGxiYWNrKChyb3V0ZURlZmluaXRpb24pID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgIGNvbnN0IHBhcnRzID0gcm91dGVEZWZpbml0aW9uLnBhdGguc3BsaXQoXCIvXCIpXG5cbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgIGlmIChwYXJ0Lm1hdGNoKC9eOihbYS16X10rKSQvKSlcbiAgICAgICAgcmVzdWx0LnB1c2gocGFydClcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sIFtdKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgZ2V0UGF0aCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBsZXQgcGF0aCA9IHMucC5wYXRoIHx8IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVxuXG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvWy9dKyQvLCBcIlwiKVxuXG4gICAgcmV0dXJuIHBhdGhcbiAgfSwgW10pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICBjb25zdCBnZXRSb3V0ZURlZmluaXRpb25zID0gdXNlQ2FsbGJhY2soKCkgPT4gcy5wLnJvdXRlRGVmaW5pdGlvbnMgfHwgY29uZmlnLmdldFJvdXRlRGVmaW5pdGlvbnMoKSwgW10pXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgZ2V0Um91dGVzID0gdXNlQ2FsbGJhY2soKCkgPT4gcy5wLnJvdXRlcyB8fCBjb25maWcuZ2V0Um91dGVzKCksIFtdKVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgcGFyc2VSb3V0ZURlZmluaXRpb25zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IHJvdXRlRGVmaW5pdGlvbnMgPSBnZXRSb3V0ZURlZmluaXRpb25zKClcbiAgICBjb25zdCByb3V0ZXMgPSBnZXRSb3V0ZXMoKVxuICAgIGNvbnN0IHJlZ2V4ID0gLzooW0EtelxcZF9dKykvXG4gICAgY29uc3QgcGFyc2VkUm91dGVEZWZpbml0aW9ucyA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IGxvY2FsZSBvZiBzLnAubG9jYWxlcykge1xuICAgICAgZm9yIChjb25zdCByb3V0ZURlZmluaXRpb24gb2Ygcm91dGVEZWZpbml0aW9ucy5yb3V0ZXMpIHtcbiAgICAgICAgY29uc3Qgcm91dGVQYXRoTmFtZSA9IGAke2luZmxlY3Rpb24uY2FtZWxpemUocm91dGVEZWZpbml0aW9uLm5hbWUsIHRydWUpfVBhdGhgXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IGZpbmRSb3V0ZVBhcmFtcyhyb3V0ZURlZmluaXRpb24pXG5cbiAgICAgICAgcGFyYW1zLnB1c2goe2xvY2FsZX0pXG5cbiAgICAgICAgaWYgKCEocm91dGVQYXRoTmFtZSBpbiByb3V0ZXMpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtyb3V0ZVBhdGhOYW1lfSBub3QgZm91bmQgaW4gcm91dGVzOiAke09iamVjdC5rZXlzKHJvdXRlcywgXCIsIFwiKX1gKVxuXG4gICAgICAgIGNvbnN0IHJvdXRlUGF0aCA9IHJvdXRlc1tyb3V0ZVBhdGhOYW1lXSguLi5wYXJhbXMpLnJlcGxhY2UoL1svXSskLywgXCJcIilcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gW11cbiAgICAgICAgbGV0IHBhdGhSZWdleFN0cmluZyA9IFwiXlwiXG5cbiAgICAgICAgcGF0aFJlZ2V4U3RyaW5nICs9IGVzY2FwZVN0cmluZ1JlZ2V4cChyb3V0ZVBhdGgpXG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IHBhdGhSZWdleFN0cmluZy5tYXRjaChyZWdleClcblxuICAgICAgICAgIGlmICghbWF0Y2gpIGJyZWFrXG5cbiAgICAgICAgICBjb25zdCB2YXJpYWJsZU5hbWUgPSBtYXRjaFsxXVxuXG4gICAgICAgICAgZ3JvdXBzLnB1c2godmFyaWFibGVOYW1lKVxuXG4gICAgICAgICAgcGF0aFJlZ2V4U3RyaW5nID0gcGF0aFJlZ2V4U3RyaW5nLnJlcGxhY2UobWF0Y2hbMF0sIFwiKFteL10rKVwiKVxuICAgICAgICB9XG5cbiAgICAgICAgcGF0aFJlZ2V4U3RyaW5nICs9IFwiJFwiXG5cbiAgICAgICAgY29uc3QgcGF0aFJlZ2V4ID0gbmV3IFJlZ0V4cChwYXRoUmVnZXhTdHJpbmcpXG5cbiAgICAgICAgcGFyc2VkUm91dGVEZWZpbml0aW9ucy5wdXNoKHtncm91cHMsIHBhdGhSZWdleCwgcm91dGVEZWZpbml0aW9ufSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VkUm91dGVEZWZpbml0aW9uc1xuICB9LCBbXSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIGNvbnN0IHBhcnNlZFJvdXRlRGVmaW5pdGlvbnMgPSB1c2VNZW1vKCgpID0+IHBhcnNlUm91dGVEZWZpbml0aW9ucygpLCBbXSlcblxuICBzLnVwZGF0ZU1ldGEoe3BhcnNlZFJvdXRlRGVmaW5pdGlvbnN9KVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgZmluZE1hdGNoaW5nUm91dGUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGdldFBhdGgoKVxuXG4gICAgZm9yIChjb25zdCBwYXJzZWRSb3V0ZURlZmluaXRpb24gb2Ygcy5tLnBhcnNlZFJvdXRlRGVmaW5pdGlvbnMpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gcGF0aC5tYXRjaChwYXJzZWRSb3V0ZURlZmluaXRpb24ucGF0aFJlZ2V4KVxuICAgICAgbGV0IG1hdGNoZWQsIHBhcmFtc1xuXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgbWF0Y2hlZCA9IHRydWVcbiAgICAgICAgcGFyYW1zID0ge31cblxuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwS2V5IGluIHBhcnNlZFJvdXRlRGVmaW5pdGlvbi5ncm91cHMpIHtcbiAgICAgICAgICBjb25zdCBncm91cE5hbWUgPSBwYXJzZWRSb3V0ZURlZmluaXRpb24uZ3JvdXBzW2dyb3VwS2V5XVxuXG4gICAgICAgICAgcGFyYW1zW2dyb3VwTmFtZV0gPSBtYXRjaFtOdW1iZXIoZ3JvdXBLZXkpICsgMV1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGF0aCA9PSBcIlwiICYmIHBhcnNlZFJvdXRlRGVmaW5pdGlvbi5yb3V0ZURlZmluaXRpb24ucGF0aCA9PSBcIi9cIikgbWF0Y2hlZCA9IHRydWUgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgIHJldHVybiB7cGFyYW1zLCBwYXJzZWRSb3V0ZURlZmluaXRpb259XG4gICAgICB9XG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBtYXRjaGluZ1JvdXRlID0gZmluZE1hdGNoaW5nUm91dGUoKVxuICBjb25zdCBwYXJhbXMgPSBtYXRjaGluZ1JvdXRlPy5wYXJhbXMgfHwge31cbiAgY29uc3QgbWF0Y2ggPSB7XG4gICAgbWF0Y2hpbmdSb3V0ZSxcbiAgICBwYXJhbXNcbiAgfVxuXG4gIHJldHVybiB7bWF0Y2h9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVJvdXRlclxuIl19