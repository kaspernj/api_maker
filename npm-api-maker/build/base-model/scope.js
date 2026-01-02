import { digg } from "diggerize";
import * as inflection from "inflection";
export default class ApiMakerBaseModelScope {
    /**
     * @param {object} scopeData
     * @param {string} scopeData.name
     */
    constructor(scopeData) {
        this.scopeData = scopeData;
    }
    /** @returns {string} */
    name() {
        return inflection.camelize(digg(this, "scopeData", "name"), true);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbImJhc2UtbW9kZWwvc2NvcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUV4QyxNQUFNLENBQUMsT0FBTyxPQUFPLHNCQUFzQjtJQUN6Qzs7O09BR0c7SUFDSCxZQUFZLFNBQVM7UUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7SUFDNUIsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixJQUFJO1FBQ0YsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ25FLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBpTWFrZXJCYXNlTW9kZWxTY29wZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdH0gc2NvcGVEYXRhXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY29wZURhdGEubmFtZVxuICAgKi9cbiAgY29uc3RydWN0b3Ioc2NvcGVEYXRhKSB7XG4gICAgdGhpcy5zY29wZURhdGEgPSBzY29wZURhdGFcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuICBuYW1lKCkge1xuICAgIHJldHVybiBpbmZsZWN0aW9uLmNhbWVsaXplKGRpZ2codGhpcywgXCJzY29wZURhdGFcIiwgXCJuYW1lXCIpLCB0cnVlKVxuICB9XG59XG4iXX0=