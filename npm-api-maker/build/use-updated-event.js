import { useCallback, useLayoutEffect, useMemo } from "react";
import debounceFunction from "debounce";
import ModelEvents from "./model-events.js";
import useShape from "set-state-compare/build/use-shape.js";
/**
 * @param {import("./base-model.js").default} model
 * @param {function} onUpdated
 * @param {object} props
 * @param {boolean} props.active
 * @param {number} props.debounce
 * @param {function} props.onConnected
 * @return {void}
 */
const apiMakerUseUpdatedEvent = (model, onUpdated, props = {}) => {
    const { active = true, debounce, onConnected, ...restProps } = props;
    if (Object.keys(restProps).length > 0) {
        throw new Error(`Unknown props given to useUpdatedEvent: ${Object.keys(restProps).join(", ")}`);
    }
    const s = useShape({ active, debounce, model, onUpdated });
    const debounceCallback = useMemo(() => {
        if (typeof debounce == "number") {
            return debounceFunction(s.p.onUpdated, debounce);
        }
        else {
            return debounceFunction(s.p.onUpdated);
        }
    }, [debounce]); // eslint-disable-line react-hooks/exhaustive-deps
    s.updateMeta({ debounceCallback });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onUpdatedCallback = useCallback((...args) => {
        if (!s.p.active) {
            return;
        }
        if (s.p.debounce) {
            s.m.debounceCallback(...args);
        }
        else {
            s.p.onUpdated(...args);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
        let connectUpdated, onConnectedListener;
        if (model) {
            connectUpdated = ModelEvents.connectUpdated(model, onUpdatedCallback);
            if (onConnected) {
                onConnectedListener = connectUpdated.events.addListener("connected", onConnected);
            }
        }
        return () => {
            if (onConnectedListener) {
                connectUpdated.events.removeListener("connected", onConnected);
            }
            if (connectUpdated) {
                connectUpdated.unsubscribe();
            }
        };
    }, [model?.id()]); // eslint-disable-line react-hooks/exhaustive-deps
};
export default apiMakerUseUpdatedEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLXVwZGF0ZWQtZXZlbnQuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInVzZS11cGRhdGVkLWV2ZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBQyxNQUFNLE9BQU8sQ0FBQTtBQUMzRCxPQUFPLGdCQUFnQixNQUFNLFVBQVUsQ0FBQTtBQUN2QyxPQUFPLFdBQVcsTUFBTSxtQkFBbUIsQ0FBQTtBQUMzQyxPQUFPLFFBQVEsTUFBTSxzQ0FBc0MsQ0FBQTtBQUUzRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUMvRCxNQUFNLEVBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsU0FBUyxFQUFDLEdBQUcsS0FBSyxDQUFBO0lBRWxFLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2pHLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFBO0lBRXhELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRTtRQUNwQyxJQUFJLE9BQU8sUUFBUSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbEQsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDeEMsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUEsQ0FBQyxrREFBa0Q7SUFFakUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQTtJQUVoQyxzREFBc0Q7SUFDdEQsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2hCLE9BQU07UUFDUixDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUMvQixDQUFDO2FBQU0sQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDeEIsQ0FBQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFDLGtEQUFrRDtJQUV6RCxzREFBc0Q7SUFDdEQsZUFBZSxDQUFDLEdBQUcsRUFBRTtRQUNuQixJQUFJLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQTtRQUV2QyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUE7WUFFckUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDaEIsbUJBQW1CLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1lBQ25GLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxHQUFHLEVBQUU7WUFDVixJQUFJLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3hCLGNBQWMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUNoRSxDQUFDO1lBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBQzlCLENBQUM7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBLENBQUMsa0RBQWtEO0FBQ3RFLENBQUMsQ0FBQTtBQUVELGVBQWUsdUJBQXVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VzZUNhbGxiYWNrLCB1c2VMYXlvdXRFZmZlY3QsIHVzZU1lbW99IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgZGVib3VuY2VGdW5jdGlvbiBmcm9tIFwiZGVib3VuY2VcIlxuaW1wb3J0IE1vZGVsRXZlbnRzIGZyb20gXCIuL21vZGVsLWV2ZW50cy5qc1wiXG5pbXBvcnQgdXNlU2hhcGUgZnJvbSBcInNldC1zdGF0ZS1jb21wYXJlL2J1aWxkL3VzZS1zaGFwZS5qc1wiXG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gbW9kZWxcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9uVXBkYXRlZFxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHByb3BzLmFjdGl2ZVxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLmRlYm91bmNlXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9wcy5vbkNvbm5lY3RlZFxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuY29uc3QgYXBpTWFrZXJVc2VVcGRhdGVkRXZlbnQgPSAobW9kZWwsIG9uVXBkYXRlZCwgcHJvcHMgPSB7fSkgPT4ge1xuICBjb25zdCB7YWN0aXZlID0gdHJ1ZSwgZGVib3VuY2UsIG9uQ29ubmVjdGVkLCAuLi5yZXN0UHJvcHN9ID0gcHJvcHNcblxuICBpZiAoT2JqZWN0LmtleXMocmVzdFByb3BzKS5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3BzIGdpdmVuIHRvIHVzZVVwZGF0ZWRFdmVudDogJHtPYmplY3Qua2V5cyhyZXN0UHJvcHMpLmpvaW4oXCIsIFwiKX1gKVxuICB9XG5cbiAgY29uc3QgcyA9IHVzZVNoYXBlKHthY3RpdmUsIGRlYm91bmNlLCBtb2RlbCwgb25VcGRhdGVkfSlcblxuICBjb25zdCBkZWJvdW5jZUNhbGxiYWNrID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBkZWJvdW5jZSA9PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gZGVib3VuY2VGdW5jdGlvbihzLnAub25VcGRhdGVkLCBkZWJvdW5jZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRlYm91bmNlRnVuY3Rpb24ocy5wLm9uVXBkYXRlZClcbiAgICB9XG4gIH0sIFtkZWJvdW5jZV0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgcy51cGRhdGVNZXRhKHtkZWJvdW5jZUNhbGxiYWNrfSlcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgY29uc3Qgb25VcGRhdGVkQ2FsbGJhY2sgPSB1c2VDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgIGlmICghcy5wLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHMucC5kZWJvdW5jZSkge1xuICAgICAgcy5tLmRlYm91bmNlQ2FsbGJhY2soLi4uYXJncylcbiAgICB9IGVsc2Uge1xuICAgICAgcy5wLm9uVXBkYXRlZCguLi5hcmdzKVxuICAgIH1cbiAgfSwgW10pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL3J1bGVzLW9mLWhvb2tzXG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGNvbm5lY3RVcGRhdGVkLCBvbkNvbm5lY3RlZExpc3RlbmVyXG5cbiAgICBpZiAobW9kZWwpIHtcbiAgICAgIGNvbm5lY3RVcGRhdGVkID0gTW9kZWxFdmVudHMuY29ubmVjdFVwZGF0ZWQobW9kZWwsIG9uVXBkYXRlZENhbGxiYWNrKVxuXG4gICAgICBpZiAob25Db25uZWN0ZWQpIHtcbiAgICAgICAgb25Db25uZWN0ZWRMaXN0ZW5lciA9IGNvbm5lY3RVcGRhdGVkLmV2ZW50cy5hZGRMaXN0ZW5lcihcImNvbm5lY3RlZFwiLCBvbkNvbm5lY3RlZClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKG9uQ29ubmVjdGVkTGlzdGVuZXIpIHtcbiAgICAgICAgY29ubmVjdFVwZGF0ZWQuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKFwiY29ubmVjdGVkXCIsIG9uQ29ubmVjdGVkKVxuICAgICAgfVxuXG4gICAgICBpZiAoY29ubmVjdFVwZGF0ZWQpIHtcbiAgICAgICAgY29ubmVjdFVwZGF0ZWQudW5zdWJzY3JpYmUoKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW21vZGVsPy5pZCgpXSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXBpTWFrZXJVc2VVcGRhdGVkRXZlbnRcbiJdfQ==