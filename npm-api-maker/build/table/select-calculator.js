import { digg, digs } from "diggerize";
import * as inflection from "inflection";
import modelClassRequire from "../model-class-require.js";
class SelectCalculator {
    constructor({ table }) {
        this.table = table;
    }
    selects() {
        const { modelClass } = digs(this.table.props, "modelClass");
        const select = this.table.props.select || {};
        const { preparedColumns } = digs(this.table.state, "preparedColumns");
        // Ensure the primary key column is loader for the primary model class
        const className = digg(modelClass.modelClassData(), "name");
        const primaryKeyColumnName = modelClass.primaryKey();
        if (!(className in select))
            select[className] = [];
        if (!select[className].includes(primaryKeyColumnName))
            select[className].push(primaryKeyColumnName);
        // Ensure 'updatedAt' is selected if defined as an attribute, because it is used for cacheKey and updates in the table
        if (modelClass.hasAttribute("updatedAt")) {
            if (!(className in select))
                select[className] = [];
            if (!select[className].includes("updatedAt"))
                select[className].push("updatedAt");
        }
        // Ensure columns used for columns are loaded
        for (const preparedColumn of preparedColumns) {
            const { column } = digs(preparedColumn, "column");
            if (!column?.attribute)
                continue; // 'column' might not exist if has been removed in code but still saved in DB
            const { attribute } = digs(column, "attribute");
            const { path } = column;
            let currentModelClass = modelClass;
            if (path) {
                for (const pathPart of path) {
                    const relationships = digg(currentModelClass.modelClassData(), "relationships");
                    const relationship = relationships.find((relationshipInArray) => relationshipInArray.name == inflection.underscore(pathPart));
                    if (!relationship)
                        throw new Error(`No such relationship: ${currentModelClass.modelClassData().name}#${pathPart}`);
                    currentModelClass = modelClassRequire(digg(relationship, "resource_name"));
                }
            }
            const currentModelClassName = digg(currentModelClass.modelClassData(), "name");
            if (!(currentModelClassName in select))
                select[currentModelClassName] = [];
            if (!select[currentModelClassName].includes(attribute))
                select[currentModelClassName].push(attribute);
        }
        return select;
    }
}
export default function selectCalculator(...props) {
    return new SelectCalculator(...props).selects();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWNhbGN1bGF0b3IuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL3NlbGVjdC1jYWxjdWxhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLE1BQU0sV0FBVyxDQUFBO0FBQ3BDLE9BQU8sS0FBSyxVQUFVLE1BQU0sWUFBWSxDQUFBO0FBQ3hDLE9BQU8saUJBQWlCLE1BQU0sMkJBQTJCLENBQUE7QUFFekQsTUFBTSxnQkFBZ0I7SUFDcEIsWUFBWSxFQUFDLEtBQUssRUFBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtJQUNwQixDQUFDO0lBRUQsT0FBTztRQUNMLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDekQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtRQUM1QyxNQUFNLEVBQUMsZUFBZSxFQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUE7UUFHbkUsc0VBQXNFO1FBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDM0QsTUFBTSxvQkFBb0IsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUE7UUFFcEQsSUFBSSxDQUFDLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQztZQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUM7WUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFHbkcsc0hBQXNIO1FBQ3RILElBQUksVUFBVSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUM7Z0JBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuRixDQUFDO1FBR0QsNkNBQTZDO1FBQzdDLEtBQUssTUFBTSxjQUFjLElBQUksZUFBZSxFQUFFLENBQUM7WUFDN0MsTUFBTSxFQUFDLE1BQU0sRUFBQyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFFL0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTO2dCQUFFLFNBQVEsQ0FBQyw2RUFBNkU7WUFFOUcsTUFBTSxFQUFDLFNBQVMsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7WUFDN0MsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sQ0FBQTtZQUVyQixJQUFJLGlCQUFpQixHQUFHLFVBQVUsQ0FBQTtZQUVsQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNULEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQzVCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQTtvQkFDL0UsTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO29CQUU3SCxJQUFJLENBQUMsWUFBWTt3QkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQTtvQkFFbEgsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFBO2dCQUM1RSxDQUFDO1lBQ0gsQ0FBQztZQUVELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRTlFLElBQUksQ0FBQyxDQUFDLHFCQUFxQixJQUFJLE1BQU0sQ0FBQztnQkFBRSxNQUFNLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUE7WUFDMUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBQUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3ZHLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxPQUFPLFVBQVUsZ0JBQWdCLENBQUMsR0FBRyxLQUFLO0lBQy9DLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2RpZ2csIGRpZ3N9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQgbW9kZWxDbGFzc1JlcXVpcmUgZnJvbSBcIi4uL21vZGVsLWNsYXNzLXJlcXVpcmUuanNcIlxuXG5jbGFzcyBTZWxlY3RDYWxjdWxhdG9yIHtcbiAgY29uc3RydWN0b3Ioe3RhYmxlfSkge1xuICAgIHRoaXMudGFibGUgPSB0YWJsZVxuICB9XG5cbiAgc2VsZWN0cygpIHtcbiAgICBjb25zdCB7bW9kZWxDbGFzc30gPSBkaWdzKHRoaXMudGFibGUucHJvcHMsIFwibW9kZWxDbGFzc1wiKVxuICAgIGNvbnN0IHNlbGVjdCA9IHRoaXMudGFibGUucHJvcHMuc2VsZWN0IHx8IHt9XG4gICAgY29uc3Qge3ByZXBhcmVkQ29sdW1uc30gPSBkaWdzKHRoaXMudGFibGUuc3RhdGUsIFwicHJlcGFyZWRDb2x1bW5zXCIpXG5cblxuICAgIC8vIEVuc3VyZSB0aGUgcHJpbWFyeSBrZXkgY29sdW1uIGlzIGxvYWRlciBmb3IgdGhlIHByaW1hcnkgbW9kZWwgY2xhc3NcbiAgICBjb25zdCBjbGFzc05hbWUgPSBkaWdnKG1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG4gICAgY29uc3QgcHJpbWFyeUtleUNvbHVtbk5hbWUgPSBtb2RlbENsYXNzLnByaW1hcnlLZXkoKVxuXG4gICAgaWYgKCEoY2xhc3NOYW1lIGluIHNlbGVjdCkpIHNlbGVjdFtjbGFzc05hbWVdID0gW11cbiAgICBpZiAoIXNlbGVjdFtjbGFzc05hbWVdLmluY2x1ZGVzKHByaW1hcnlLZXlDb2x1bW5OYW1lKSkgc2VsZWN0W2NsYXNzTmFtZV0ucHVzaChwcmltYXJ5S2V5Q29sdW1uTmFtZSlcblxuXG4gICAgLy8gRW5zdXJlICd1cGRhdGVkQXQnIGlzIHNlbGVjdGVkIGlmIGRlZmluZWQgYXMgYW4gYXR0cmlidXRlLCBiZWNhdXNlIGl0IGlzIHVzZWQgZm9yIGNhY2hlS2V5IGFuZCB1cGRhdGVzIGluIHRoZSB0YWJsZVxuICAgIGlmIChtb2RlbENsYXNzLmhhc0F0dHJpYnV0ZShcInVwZGF0ZWRBdFwiKSkge1xuICAgICAgaWYgKCEoY2xhc3NOYW1lIGluIHNlbGVjdCkpIHNlbGVjdFtjbGFzc05hbWVdID0gW11cbiAgICAgIGlmICghc2VsZWN0W2NsYXNzTmFtZV0uaW5jbHVkZXMoXCJ1cGRhdGVkQXRcIikpIHNlbGVjdFtjbGFzc05hbWVdLnB1c2goXCJ1cGRhdGVkQXRcIilcbiAgICB9XG5cblxuICAgIC8vIEVuc3VyZSBjb2x1bW5zIHVzZWQgZm9yIGNvbHVtbnMgYXJlIGxvYWRlZFxuICAgIGZvciAoY29uc3QgcHJlcGFyZWRDb2x1bW4gb2YgcHJlcGFyZWRDb2x1bW5zKSB7XG4gICAgICBjb25zdCB7Y29sdW1ufSA9IGRpZ3MocHJlcGFyZWRDb2x1bW4sIFwiY29sdW1uXCIpXG5cbiAgICAgIGlmICghY29sdW1uPy5hdHRyaWJ1dGUpIGNvbnRpbnVlIC8vICdjb2x1bW4nIG1pZ2h0IG5vdCBleGlzdCBpZiBoYXMgYmVlbiByZW1vdmVkIGluIGNvZGUgYnV0IHN0aWxsIHNhdmVkIGluIERCXG5cbiAgICAgIGNvbnN0IHthdHRyaWJ1dGV9ID0gZGlncyhjb2x1bW4sIFwiYXR0cmlidXRlXCIpXG4gICAgICBjb25zdCB7cGF0aH0gPSBjb2x1bW5cblxuICAgICAgbGV0IGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1xuXG4gICAgICBpZiAocGF0aCkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhQYXJ0IG9mIHBhdGgpIHtcbiAgICAgICAgICBjb25zdCByZWxhdGlvbnNoaXBzID0gZGlnZyhjdXJyZW50TW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLCBcInJlbGF0aW9uc2hpcHNcIilcbiAgICAgICAgICBjb25zdCByZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBzLmZpbmQoKHJlbGF0aW9uc2hpcEluQXJyYXkpID0+IHJlbGF0aW9uc2hpcEluQXJyYXkubmFtZSA9PSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUocGF0aFBhcnQpKVxuXG4gICAgICAgICAgaWYgKCFyZWxhdGlvbnNoaXApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCByZWxhdGlvbnNoaXA6ICR7Y3VycmVudE1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKS5uYW1lfSMke3BhdGhQYXJ0fWApXG5cbiAgICAgICAgICBjdXJyZW50TW9kZWxDbGFzcyA9IG1vZGVsQ2xhc3NSZXF1aXJlKGRpZ2cocmVsYXRpb25zaGlwLCBcInJlc291cmNlX25hbWVcIikpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudE1vZGVsQ2xhc3NOYW1lID0gZGlnZyhjdXJyZW50TW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLCBcIm5hbWVcIilcblxuICAgICAgaWYgKCEoY3VycmVudE1vZGVsQ2xhc3NOYW1lIGluIHNlbGVjdCkpIHNlbGVjdFtjdXJyZW50TW9kZWxDbGFzc05hbWVdID0gW11cbiAgICAgIGlmICghc2VsZWN0W2N1cnJlbnRNb2RlbENsYXNzTmFtZV0uaW5jbHVkZXMoYXR0cmlidXRlKSkgc2VsZWN0W2N1cnJlbnRNb2RlbENsYXNzTmFtZV0ucHVzaChhdHRyaWJ1dGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlbGVjdENhbGN1bGF0b3IoLi4ucHJvcHMpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3RDYWxjdWxhdG9yKC4uLnByb3BzKS5zZWxlY3RzKClcbn1cbiJdfQ==