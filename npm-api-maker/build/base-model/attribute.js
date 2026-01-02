// @ts-check
import Column from "./column.js";
/**
 * @typedef AttributeArgType
 * @property {string} column
 * @property {string} name
 * @property {boolean} selected_by_default
 * @property {boolean} translated
 * @property {string} type
 */
export default class ApiMakerBaseModelAttribute {
    /** @param {AttributeArgType} attributeData */
    constructor(attributeData) {
        this.attributeData = attributeData;
    }
    /**
     * @returns {Column}
     */
    getColumn() {
        if (!this.column) {
            const columnData = this.attributeData.column;
            if (columnData) {
                this.column = new Column(columnData);
            }
        }
        return this.column;
    }
    /** @returns {boolean} */
    isColumn() { return Boolean(this.attributeData.column); }
    /** @returns {boolean} */
    isSelectedByDefault() {
        const isSelectedByDefault = this.attributeData.selected_by_default;
        if (isSelectedByDefault || isSelectedByDefault === null)
            return true;
        return false;
    }
    /** @returns {boolean} */
    isTranslated() { return this.attributeData.translated; }
    /** @returns {string} */
    name() { return this.attributeData.name; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlLmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJiYXNlLW1vZGVsL2F0dHJpYnV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZO0FBRVosT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFBO0FBRWhDOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLENBQUMsT0FBTyxPQUFPLDBCQUEwQjtJQUM3Qyw4Q0FBOEM7SUFDOUMsWUFBWSxhQUFhO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFBO1lBRTVDLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtZQUN0QyxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUNwQixDQUFDO0lBRUQseUJBQXlCO0lBQ3pCLFFBQVEsS0FBSyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUV4RCx5QkFBeUI7SUFDekIsbUJBQW1CO1FBQ2pCLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQTtRQUVsRSxJQUFJLG1CQUFtQixJQUFJLG1CQUFtQixLQUFLLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQTtRQUVwRSxPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsWUFBWSxLQUFLLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUEsQ0FBQyxDQUFDO0lBRXZELHdCQUF3QjtJQUN4QixJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQSxDQUFDLENBQUM7Q0FDMUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IENvbHVtbiBmcm9tIFwiLi9jb2x1bW4uanNcIlxuXG4vKipcbiAqIEB0eXBlZGVmIEF0dHJpYnV0ZUFyZ1R5cGVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjb2x1bW5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBuYW1lXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHNlbGVjdGVkX2J5X2RlZmF1bHRcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gdHJhbnNsYXRlZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHR5cGVcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcGlNYWtlckJhc2VNb2RlbEF0dHJpYnV0ZSB7XG4gIC8qKiBAcGFyYW0ge0F0dHJpYnV0ZUFyZ1R5cGV9IGF0dHJpYnV0ZURhdGEgKi9cbiAgY29uc3RydWN0b3IoYXR0cmlidXRlRGF0YSkge1xuICAgIHRoaXMuYXR0cmlidXRlRGF0YSA9IGF0dHJpYnV0ZURhdGFcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Q29sdW1ufVxuICAgKi9cbiAgZ2V0Q29sdW1uKCkge1xuICAgIGlmICghdGhpcy5jb2x1bW4pIHtcbiAgICAgIGNvbnN0IGNvbHVtbkRhdGEgPSB0aGlzLmF0dHJpYnV0ZURhdGEuY29sdW1uXG5cbiAgICAgIGlmIChjb2x1bW5EYXRhKSB7XG4gICAgICAgIHRoaXMuY29sdW1uID0gbmV3IENvbHVtbihjb2x1bW5EYXRhKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbHVtblxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtib29sZWFufSAqL1xuICBpc0NvbHVtbigpIHsgcmV0dXJuIEJvb2xlYW4odGhpcy5hdHRyaWJ1dGVEYXRhLmNvbHVtbikgfVxuXG4gIC8qKiBAcmV0dXJucyB7Ym9vbGVhbn0gKi9cbiAgaXNTZWxlY3RlZEJ5RGVmYXVsdCgpIHtcbiAgICBjb25zdCBpc1NlbGVjdGVkQnlEZWZhdWx0ID0gdGhpcy5hdHRyaWJ1dGVEYXRhLnNlbGVjdGVkX2J5X2RlZmF1bHRcblxuICAgIGlmIChpc1NlbGVjdGVkQnlEZWZhdWx0IHx8IGlzU2VsZWN0ZWRCeURlZmF1bHQgPT09IG51bGwpIHJldHVybiB0cnVlXG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7Ym9vbGVhbn0gKi9cbiAgaXNUcmFuc2xhdGVkKCkgeyByZXR1cm4gdGhpcy5hdHRyaWJ1dGVEYXRhLnRyYW5zbGF0ZWQgfVxuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuICBuYW1lKCkgeyByZXR1cm4gdGhpcy5hdHRyaWJ1dGVEYXRhLm5hbWUgfVxufVxuIl19