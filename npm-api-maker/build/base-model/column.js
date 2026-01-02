/**
 * @typedef {object} ColumnArgType
 * @property {string} type
 */
export default class ApiMakerBaseModelColumn {
    /** @param {ColumnArgType} columnData */
    constructor(columnData) {
        if (!columnData) {
            throw new Error("No column data was given");
        }
        this.columnData = columnData;
    }
    /** @returns {string} */
    getType() { return this.columnData.type; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJiYXNlLW1vZGVsL2NvbHVtbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxNQUFNLENBQUMsT0FBTyxPQUFPLHVCQUF1QjtJQUMxQyx3Q0FBd0M7SUFDeEMsWUFBWSxVQUFVO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDN0MsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0lBQzlCLENBQUM7SUFFRCx3QkFBd0I7SUFDeEIsT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUEsQ0FBQyxDQUFDO0NBQzFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBDb2x1bW5BcmdUeXBlXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwaU1ha2VyQmFzZU1vZGVsQ29sdW1uIHtcbiAgLyoqIEBwYXJhbSB7Q29sdW1uQXJnVHlwZX0gY29sdW1uRGF0YSAqL1xuICBjb25zdHJ1Y3Rvcihjb2x1bW5EYXRhKSB7XG4gICAgaWYgKCFjb2x1bW5EYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBjb2x1bW4gZGF0YSB3YXMgZ2l2ZW5cIilcbiAgICB9XG5cbiAgICB0aGlzLmNvbHVtbkRhdGEgPSBjb2x1bW5EYXRhXG4gIH1cblxuICAvKiogQHJldHVybnMge3N0cmluZ30gKi9cbiAgZ2V0VHlwZSgpIHsgcmV0dXJuIHRoaXMuY29sdW1uRGF0YS50eXBlIH1cbn1cbiJdfQ==