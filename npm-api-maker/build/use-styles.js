import config from "./config.js";
import { digg } from "diggerize";
import * as inflection from "inflection";
import useBreakpoint from "./use-breakpoint.js";
import { useMemo } from "react";
function handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, arg) {
    if (!(arg in styles)) {
        throw new Error(`No such styling '${arg}' in given styles: ${Object.keys(styles).join(", ")}`);
    }
    listOfStyles.push(styles[arg]);
    for (const breakpointData of breakpointsReverse) {
        const breakpointName = breakpointData[0];
        const breakpointStyleNameUp = `${arg}${inflection.camelize(breakpointName)}Up`;
        const breakpointStyleNameDown = `${arg}${inflection.camelize(breakpointName)}Down`;
        const breakpointIsUp = digg(breakpoint, `${breakpointName}Up`);
        const breakpointIsDown = digg(breakpoint, `${breakpointName}Down`);
        if (breakpointStyleNameUp in styles && breakpointIsUp) {
            listOfStyles.push(styles[breakpointStyleNameUp]);
        }
        if (breakpointStyleNameDown in styles && breakpointIsDown) {
            listOfStyles.push(styles[breakpointStyleNameDown]);
        }
    }
}
export default function useStyles(styles, args, dependencies = []) {
    const breakpoint = useBreakpoint();
    const breakpointName = digg(breakpoint, "name");
    const actualDependencies = [...dependencies, breakpointName];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const listOfStyles = useMemo(() => {
        const listOfStyles = [];
        const breakpointsReverse = [...config.getBreakpoints()].reverse();
        if (!Array.isArray(args)) {
            args = [args]; // eslint-disable-line no-param-reassign
        }
        for (const arg of args) {
            if (typeof arg == "string") {
                handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, arg);
            }
            else if (typeof arg == "object") {
                for (const key in arg) {
                    const value = arg[key];
                    if (value) {
                        handleStringStyle(styles, listOfStyles, breakpoint, breakpointsReverse, key);
                    }
                }
            }
            else {
                throw new Error(`Unhandled type: ${typeof arg}`);
            }
        }
        return listOfStyles;
    }, actualDependencies); // eslint-disable-line react-hooks/exhaustive-deps
    return listOfStyles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLXN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsidXNlLXN0eWxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLGFBQWEsTUFBTSxxQkFBcUIsQ0FBQTtBQUMvQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sT0FBTyxDQUFBO0FBRTdCLFNBQVMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsR0FBRztJQUNsRixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixHQUFHLHNCQUFzQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUVELFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFFOUIsS0FBSyxNQUFNLGNBQWMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hELE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4QyxNQUFNLHFCQUFxQixHQUFHLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQTtRQUM5RSxNQUFNLHVCQUF1QixHQUFHLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQTtRQUNsRixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsY0FBYyxJQUFJLENBQUMsQ0FBQTtRQUM5RCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxjQUFjLE1BQU0sQ0FBQyxDQUFBO1FBRWxFLElBQUkscUJBQXFCLElBQUksTUFBTSxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ3RELFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtRQUNsRCxDQUFDO1FBRUQsSUFBSSx1QkFBdUIsSUFBSSxNQUFNLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUMxRCxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUE7UUFDcEQsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsTUFBTSxDQUFDLE9BQU8sVUFBVSxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEdBQUcsRUFBRTtJQUMvRCxNQUFNLFVBQVUsR0FBRyxhQUFhLEVBQUUsQ0FBQTtJQUNsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQy9DLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQTtJQUU1RCx1REFBdUQ7SUFDdkQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNoQyxNQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7UUFDdkIsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7UUFFakUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN6QixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDLHdDQUF3QztRQUN4RCxDQUFDO1FBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN2QixJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUMzQixpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUM5RSxDQUFDO2lCQUFNLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2xDLEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ3RCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFFdEIsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDVixpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtvQkFDOUUsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQTtZQUNsRCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sWUFBWSxDQUFBO0lBQ3JCLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO0lBRXpFLE9BQU8sWUFBWSxDQUFBO0FBQ3JCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY29uZmlnIGZyb20gXCIuL2NvbmZpZy5qc1wiXG5pbXBvcnQge2RpZ2d9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQgdXNlQnJlYWtwb2ludCBmcm9tIFwiLi91c2UtYnJlYWtwb2ludC5qc1wiXG5pbXBvcnQge3VzZU1lbW99IGZyb20gXCJyZWFjdFwiXG5cbmZ1bmN0aW9uIGhhbmRsZVN0cmluZ1N0eWxlKHN0eWxlcywgbGlzdE9mU3R5bGVzLCBicmVha3BvaW50LCBicmVha3BvaW50c1JldmVyc2UsIGFyZykgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGZ1bmMtc3R5bGUsIG1heC1wYXJhbXNcbiAgaWYgKCEoYXJnIGluIHN0eWxlcykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc3R5bGluZyAnJHthcmd9JyBpbiBnaXZlbiBzdHlsZXM6ICR7T2JqZWN0LmtleXMoc3R5bGVzKS5qb2luKFwiLCBcIil9YClcbiAgfVxuXG4gIGxpc3RPZlN0eWxlcy5wdXNoKHN0eWxlc1thcmddKVxuXG4gIGZvciAoY29uc3QgYnJlYWtwb2ludERhdGEgb2YgYnJlYWtwb2ludHNSZXZlcnNlKSB7XG4gICAgY29uc3QgYnJlYWtwb2ludE5hbWUgPSBicmVha3BvaW50RGF0YVswXVxuICAgIGNvbnN0IGJyZWFrcG9pbnRTdHlsZU5hbWVVcCA9IGAke2FyZ30ke2luZmxlY3Rpb24uY2FtZWxpemUoYnJlYWtwb2ludE5hbWUpfVVwYFxuICAgIGNvbnN0IGJyZWFrcG9pbnRTdHlsZU5hbWVEb3duID0gYCR7YXJnfSR7aW5mbGVjdGlvbi5jYW1lbGl6ZShicmVha3BvaW50TmFtZSl9RG93bmBcbiAgICBjb25zdCBicmVha3BvaW50SXNVcCA9IGRpZ2coYnJlYWtwb2ludCwgYCR7YnJlYWtwb2ludE5hbWV9VXBgKVxuICAgIGNvbnN0IGJyZWFrcG9pbnRJc0Rvd24gPSBkaWdnKGJyZWFrcG9pbnQsIGAke2JyZWFrcG9pbnROYW1lfURvd25gKVxuXG4gICAgaWYgKGJyZWFrcG9pbnRTdHlsZU5hbWVVcCBpbiBzdHlsZXMgJiYgYnJlYWtwb2ludElzVXApIHtcbiAgICAgIGxpc3RPZlN0eWxlcy5wdXNoKHN0eWxlc1ticmVha3BvaW50U3R5bGVOYW1lVXBdKVxuICAgIH1cblxuICAgIGlmIChicmVha3BvaW50U3R5bGVOYW1lRG93biBpbiBzdHlsZXMgJiYgYnJlYWtwb2ludElzRG93bikge1xuICAgICAgbGlzdE9mU3R5bGVzLnB1c2goc3R5bGVzW2JyZWFrcG9pbnRTdHlsZU5hbWVEb3duXSlcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXNlU3R5bGVzKHN0eWxlcywgYXJncywgZGVwZW5kZW5jaWVzID0gW10pIHtcbiAgY29uc3QgYnJlYWtwb2ludCA9IHVzZUJyZWFrcG9pbnQoKVxuICBjb25zdCBicmVha3BvaW50TmFtZSA9IGRpZ2coYnJlYWtwb2ludCwgXCJuYW1lXCIpXG4gIGNvbnN0IGFjdHVhbERlcGVuZGVuY2llcyA9IFsuLi5kZXBlbmRlbmNpZXMsIGJyZWFrcG9pbnROYW1lXVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgY29uc3QgbGlzdE9mU3R5bGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3QgbGlzdE9mU3R5bGVzID0gW11cbiAgICBjb25zdCBicmVha3BvaW50c1JldmVyc2UgPSBbLi4uY29uZmlnLmdldEJyZWFrcG9pbnRzKCldLnJldmVyc2UoKVxuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICBhcmdzID0gW2FyZ3NdIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGhhbmRsZVN0cmluZ1N0eWxlKHN0eWxlcywgbGlzdE9mU3R5bGVzLCBicmVha3BvaW50LCBicmVha3BvaW50c1JldmVyc2UsIGFyZylcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGFyZykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXJnW2tleV1cblxuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgaGFuZGxlU3RyaW5nU3R5bGUoc3R5bGVzLCBsaXN0T2ZTdHlsZXMsIGJyZWFrcG9pbnQsIGJyZWFrcG9pbnRzUmV2ZXJzZSwga2V5KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmhhbmRsZWQgdHlwZTogJHt0eXBlb2YgYXJnfWApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3RPZlN0eWxlc1xuICB9LCBhY3R1YWxEZXBlbmRlbmNpZXMpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgcmV0dXJuIGxpc3RPZlN0eWxlc1xufVxuIl19