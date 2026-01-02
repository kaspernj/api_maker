export default class ApiMakerResult {
    /**
     * @param {object} data
     * @param {import("./collection.js").default} data.collection
     * @param {object} data.response
     */
    constructor(data) {
        this.data = data;
    }
    /** @returns {number} */
    count() { return this.data.response.meta.count; }
    /** @returns {number} */
    currentPage() { return this.data.response.meta.currentPage; }
    /** @returns {Array<import("./base-model.js").default>} */
    models() { return this.data.models; }
    /** @returns {typeof import("./base-model.js").default} */
    modelClass() { return this.data.collection.modelClass(); }
    /** @returns {number} */
    perPage() { return this.data.response.meta.perPage; }
    /** @returns {number} */
    totalCount() { return this.data.response.meta.totalCount; }
    /** @returns {number} */
    totalPages() { return this.data.response.meta.totalPages; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJyZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQ2pDOzs7O09BSUc7SUFDSCxZQUFhLElBQUk7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsd0JBQXdCO0lBQ3hCLEtBQUssS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUEsQ0FBQyxDQUFDO0lBRWhELHdCQUF3QjtJQUN4QixXQUFXLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBLENBQUMsQ0FBQztJQUU1RCwwREFBMEQ7SUFDMUQsTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUEsQ0FBQyxDQUFDO0lBRXBDLDBEQUEwRDtJQUMxRCxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQSxDQUFDLENBQUM7SUFFekQsd0JBQXdCO0lBQ3hCLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUEsQ0FBQyxDQUFDO0lBRXBELHdCQUF3QjtJQUN4QixVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFBLENBQUMsQ0FBQztJQUUxRCx3QkFBd0I7SUFDeEIsVUFBVSxLQUFLLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQSxDQUFDLENBQUM7Q0FDM0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBBcGlNYWtlclJlc3VsdCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuICAgKiBAcGFyYW0ge2ltcG9ydChcIi4vY29sbGVjdGlvbi5qc1wiKS5kZWZhdWx0fSBkYXRhLmNvbGxlY3Rpb25cbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGEucmVzcG9uc2VcbiAgICovXG4gIGNvbnN0cnVjdG9yIChkYXRhKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtudW1iZXJ9ICovXG4gIGNvdW50KCkgeyByZXR1cm4gdGhpcy5kYXRhLnJlc3BvbnNlLm1ldGEuY291bnQgfVxuXG4gIC8qKiBAcmV0dXJucyB7bnVtYmVyfSAqL1xuICBjdXJyZW50UGFnZSgpIHsgcmV0dXJuIHRoaXMuZGF0YS5yZXNwb25zZS5tZXRhLmN1cnJlbnRQYWdlIH1cblxuICAvKiogQHJldHVybnMge0FycmF5PGltcG9ydChcIi4vYmFzZS1tb2RlbC5qc1wiKS5kZWZhdWx0Pn0gKi9cbiAgbW9kZWxzKCkgeyByZXR1cm4gdGhpcy5kYXRhLm1vZGVscyB9XG5cbiAgLyoqIEByZXR1cm5zIHt0eXBlb2YgaW1wb3J0KFwiLi9iYXNlLW1vZGVsLmpzXCIpLmRlZmF1bHR9ICovXG4gIG1vZGVsQ2xhc3MoKSB7IHJldHVybiB0aGlzLmRhdGEuY29sbGVjdGlvbi5tb2RlbENsYXNzKCkgfVxuXG4gIC8qKiBAcmV0dXJucyB7bnVtYmVyfSAqL1xuICBwZXJQYWdlKCkgeyByZXR1cm4gdGhpcy5kYXRhLnJlc3BvbnNlLm1ldGEucGVyUGFnZSB9XG5cbiAgLyoqIEByZXR1cm5zIHtudW1iZXJ9ICovXG4gIHRvdGFsQ291bnQoKSB7IHJldHVybiB0aGlzLmRhdGEucmVzcG9uc2UubWV0YS50b3RhbENvdW50IH1cblxuICAvKiogQHJldHVybnMge251bWJlcn0gKi9cbiAgdG90YWxQYWdlcygpIHsgcmV0dXJuIHRoaXMuZGF0YS5yZXNwb25zZS5tZXRhLnRvdGFsUGFnZXMgfVxufVxuIl19