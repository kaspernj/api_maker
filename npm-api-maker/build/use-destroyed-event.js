import { useCallback, useLayoutEffect, useMemo } from "react"; // eslint-disable-line sort-imports
import debounceFunction from "debounce";
import ModelEvents from "./model-events.js";
import useShape from "set-state-compare/build/use-shape.js";
/**
 * @param {object} model
 * @param {function} onDestroyed
 * @param {object} props
 * @param {boolean} props.active
 * @param {number} props.debounce
 * @param {function} props.onConnected
 * @returns {void}
 */
const apiMakerUseDestroyedEvent = (model, onDestroyed, props) => {
    const { active = true, debounce, onConnected, ...restProps } = props || {};
    if (Object.keys(restProps).length > 0) {
        throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`);
    }
    const s = useShape({ active, debounce, model, onDestroyed }); // eslint-disable-line react-hooks/rules-of-hooks
    const debounceCallback = useMemo(() => {
        if (typeof debounce == "number") {
            return debounceFunction(s.p.onDestroyed, debounce);
        }
        else {
            return debounceFunction(s.p.onDestroyed);
        }
    }, [debounce]); // eslint-disable-line react-hooks/exhaustive-deps
    s.updateMeta({ debounceCallback });
    const onDestroyedCallback = useCallback((...args) => {
        if (!s.p.active) {
            return;
        }
        if (s.p.debounce) {
            s.m.debounceCallback(...args);
        }
        else {
            s.p.onDestroyed(...args);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        let connectDestroyed, onConnectedListener;
        if (model) {
            connectDestroyed = ModelEvents.connectDestroyed(model, onDestroyedCallback);
            if (onConnected) {
                onConnectedListener = connectDestroyed.events.addListener("connected", onConnected);
            }
        }
        return () => {
            if (onConnectedListener) {
                connectDestroyed.events.removeListener("connected", onConnected);
            }
            if (connectDestroyed) {
                connectDestroyed.unsubscribe();
            }
        };
    }, [model?.id()]);
};
export default apiMakerUseDestroyedEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLWRlc3Ryb3llZC1ldmVudC5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsidXNlLWRlc3Ryb3llZC1ldmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUMsTUFBTSxPQUFPLENBQUEsQ0FBQyxtQ0FBbUM7QUFDL0YsT0FBTyxnQkFBZ0IsTUFBTSxVQUFVLENBQUE7QUFDdkMsT0FBTyxXQUFXLE1BQU0sbUJBQW1CLENBQUE7QUFDM0MsT0FBTyxRQUFRLE1BQU0sc0NBQXNDLENBQUE7QUFFM0Q7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLHlCQUF5QixHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM5RCxNQUFNLEVBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsU0FBUyxFQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUUsQ0FBQTtJQUV4RSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNuRyxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQSxDQUFDLGlEQUFpRDtJQUU1RyxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDcEMsSUFBSSxPQUFPLFFBQVEsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNoQyxPQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ3BELENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQzFDLENBQUM7SUFDSCxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO0lBRWpFLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBQyxnQkFBZ0IsRUFBQyxDQUFDLENBQUE7SUFFaEMsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ2xELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLE9BQU07UUFDUixDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUMvQixDQUFDO2FBQU0sQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDMUIsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFDLGtEQUFrRDtJQUV6RCxlQUFlLENBQUMsR0FBRyxFQUFFO1FBQ25CLElBQUksZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUE7UUFFekMsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNWLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtZQUUzRSxJQUFJLFdBQVcsRUFBRSxDQUFDO2dCQUNoQixtQkFBbUIsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUNyRixDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sR0FBRyxFQUFFO1lBQ1YsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO2dCQUN4QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUNsRSxDQUFDO1lBRUQsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNyQixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtZQUNoQyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNuQixDQUFDLENBQUE7QUFFRCxlQUFlLHlCQUF5QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt1c2VDYWxsYmFjaywgdXNlTGF5b3V0RWZmZWN0LCB1c2VNZW1vfSBmcm9tIFwicmVhY3RcIiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHNvcnQtaW1wb3J0c1xuaW1wb3J0IGRlYm91bmNlRnVuY3Rpb24gZnJvbSBcImRlYm91bmNlXCJcbmltcG9ydCBNb2RlbEV2ZW50cyBmcm9tIFwiLi9tb2RlbC1ldmVudHMuanNcIlxuaW1wb3J0IHVzZVNoYXBlIGZyb20gXCJzZXQtc3RhdGUtY29tcGFyZS9idWlsZC91c2Utc2hhcGUuanNcIlxuXG4vKipcbiAqIEBwYXJhbSB7b2JqZWN0fSBtb2RlbFxuICogQHBhcmFtIHtmdW5jdGlvbn0gb25EZXN0cm95ZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICogQHBhcmFtIHtib29sZWFufSBwcm9wcy5hY3RpdmVcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5kZWJvdW5jZVxuICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvcHMub25Db25uZWN0ZWRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5jb25zdCBhcGlNYWtlclVzZURlc3Ryb3llZEV2ZW50ID0gKG1vZGVsLCBvbkRlc3Ryb3llZCwgcHJvcHMpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuICBjb25zdCB7YWN0aXZlID0gdHJ1ZSwgZGVib3VuY2UsIG9uQ29ubmVjdGVkLCAuLi5yZXN0UHJvcHN9ID0gcHJvcHMgfHwge31cblxuICBpZiAoT2JqZWN0LmtleXMocmVzdFByb3BzKS5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3BzIGdpdmVuIHRvIHVzZURlc3Ryb3llZEV2ZW50OiAke09iamVjdC5rZXlzKHJlc3RQcm9wcykuam9pbihcIiwgXCIpfWApXG4gIH1cblxuICBjb25zdCBzID0gdXNlU2hhcGUoe2FjdGl2ZSwgZGVib3VuY2UsIG1vZGVsLCBvbkRlc3Ryb3llZH0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcblxuICBjb25zdCBkZWJvdW5jZUNhbGxiYWNrID0gdXNlTWVtbygoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgICBpZiAodHlwZW9mIGRlYm91bmNlID09IFwibnVtYmVyXCIpIHtcbiAgICAgIHJldHVybiBkZWJvdW5jZUZ1bmN0aW9uKHMucC5vbkRlc3Ryb3llZCwgZGVib3VuY2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBkZWJvdW5jZUZ1bmN0aW9uKHMucC5vbkRlc3Ryb3llZClcbiAgICB9XG4gIH0sIFtkZWJvdW5jZV0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgcy51cGRhdGVNZXRhKHtkZWJvdW5jZUNhbGxiYWNrfSlcblxuICBjb25zdCBvbkRlc3Ryb3llZENhbGxiYWNrID0gdXNlQ2FsbGJhY2soKC4uLmFyZ3MpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuICAgIGlmICghcy5wLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHMucC5kZWJvdW5jZSkge1xuICAgICAgcy5tLmRlYm91bmNlQ2FsbGJhY2soLi4uYXJncylcbiAgICB9IGVsc2Uge1xuICAgICAgcy5wLm9uRGVzdHJveWVkKC4uLmFyZ3MpXG4gICAgfVxuICB9LCBbXSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL3J1bGVzLW9mLWhvb2tzXG4gICAgbGV0IGNvbm5lY3REZXN0cm95ZWQsIG9uQ29ubmVjdGVkTGlzdGVuZXJcblxuICAgIGlmIChtb2RlbCkge1xuICAgICAgY29ubmVjdERlc3Ryb3llZCA9IE1vZGVsRXZlbnRzLmNvbm5lY3REZXN0cm95ZWQobW9kZWwsIG9uRGVzdHJveWVkQ2FsbGJhY2spXG5cbiAgICAgIGlmIChvbkNvbm5lY3RlZCkge1xuICAgICAgICBvbkNvbm5lY3RlZExpc3RlbmVyID0gY29ubmVjdERlc3Ryb3llZC5ldmVudHMuYWRkTGlzdGVuZXIoXCJjb25uZWN0ZWRcIiwgb25Db25uZWN0ZWQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChvbkNvbm5lY3RlZExpc3RlbmVyKSB7XG4gICAgICAgIGNvbm5lY3REZXN0cm95ZWQuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKFwiY29ubmVjdGVkXCIsIG9uQ29ubmVjdGVkKVxuICAgICAgfVxuXG4gICAgICBpZiAoY29ubmVjdERlc3Ryb3llZCkge1xuICAgICAgICBjb25uZWN0RGVzdHJveWVkLnVuc3Vic2NyaWJlKClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFttb2RlbD8uaWQoKV0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFwaU1ha2VyVXNlRGVzdHJveWVkRXZlbnRcbiJdfQ==