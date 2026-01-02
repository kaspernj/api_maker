import * as inflection from "inflection";
import modelClassRequire from "./model-class-require.js";
import Preloaded from "./preloaded.js";
export default class ModelsResponseReader {
    static first(response) {
        return ModelsResponseReader.collection(response)[0];
    }
    static collection(response) {
        const reader = new ModelsResponseReader({ response });
        return reader.models();
    }
    constructor(args) {
        this.collection = args.collection;
        this.response = args.response;
    }
    models() {
        const preloaded = new Preloaded(this.response);
        const models = [];
        for (const modelType in this.response.data) {
            const modelClassName = inflection.classify(modelType);
            const ModelClass = modelClassRequire(modelClassName);
            const collectionName = ModelClass.modelClassData().collectionName;
            for (const modelId of this.response.data[modelType]) {
                const modelData = this.response.preloaded[collectionName][modelId];
                if (!modelData)
                    throw new Error(`Couldn't find model data for ${collectionName}(${modelId})`);
                const model = new ModelClass({
                    collection: this.collection,
                    data: modelData,
                    isNewRecord: false
                });
                model._readPreloadedRelationships(preloaded);
                models.push(model);
            }
        }
        return models;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxzLXJlc3BvbnNlLXJlYWRlci5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsibW9kZWxzLXJlc3BvbnNlLXJlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLGlCQUFpQixNQUFNLDBCQUEwQixDQUFBO0FBQ3hELE9BQU8sU0FBUyxNQUFNLGdCQUFnQixDQUFBO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sb0JBQW9CO0lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUUsUUFBUTtRQUNwQixPQUFPLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBRSxRQUFRO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQW9CLENBQUMsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFBO1FBQ25ELE9BQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ3hCLENBQUM7SUFFRCxZQUFhLElBQUk7UUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQy9CLENBQUM7SUFFRCxNQUFNO1FBQ0osTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtRQUVqQixLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0MsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUNyRCxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUNwRCxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsY0FBYyxDQUFBO1lBRWpFLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBRWxFLElBQUksQ0FBQyxTQUFTO29CQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLGNBQWMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFBO2dCQUUvRSxNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQztvQkFDM0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO29CQUMzQixJQUFJLEVBQUUsU0FBUztvQkFDZixXQUFXLEVBQUUsS0FBSztpQkFDbkIsQ0FBQyxDQUFBO2dCQUVGLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNwQixDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQgbW9kZWxDbGFzc1JlcXVpcmUgZnJvbSBcIi4vbW9kZWwtY2xhc3MtcmVxdWlyZS5qc1wiXG5pbXBvcnQgUHJlbG9hZGVkIGZyb20gXCIuL3ByZWxvYWRlZC5qc1wiXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsc1Jlc3BvbnNlUmVhZGVyIHtcbiAgc3RhdGljIGZpcnN0IChyZXNwb25zZSkge1xuICAgIHJldHVybiBNb2RlbHNSZXNwb25zZVJlYWRlci5jb2xsZWN0aW9uKHJlc3BvbnNlKVswXVxuICB9XG5cbiAgc3RhdGljIGNvbGxlY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgY29uc3QgcmVhZGVyID0gbmV3IE1vZGVsc1Jlc3BvbnNlUmVhZGVyKHtyZXNwb25zZX0pXG4gICAgcmV0dXJuIHJlYWRlci5tb2RlbHMoKVxuICB9XG5cbiAgY29uc3RydWN0b3IgKGFyZ3MpIHtcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBhcmdzLmNvbGxlY3Rpb25cbiAgICB0aGlzLnJlc3BvbnNlID0gYXJncy5yZXNwb25zZVxuICB9XG5cbiAgbW9kZWxzICgpIHtcbiAgICBjb25zdCBwcmVsb2FkZWQgPSBuZXcgUHJlbG9hZGVkKHRoaXMucmVzcG9uc2UpXG4gICAgY29uc3QgbW9kZWxzID0gW11cblxuICAgIGZvciAoY29uc3QgbW9kZWxUeXBlIGluIHRoaXMucmVzcG9uc2UuZGF0YSkge1xuICAgICAgY29uc3QgbW9kZWxDbGFzc05hbWUgPSBpbmZsZWN0aW9uLmNsYXNzaWZ5KG1vZGVsVHlwZSlcbiAgICAgIGNvbnN0IE1vZGVsQ2xhc3MgPSBtb2RlbENsYXNzUmVxdWlyZShtb2RlbENsYXNzTmFtZSlcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gTW9kZWxDbGFzcy5tb2RlbENsYXNzRGF0YSgpLmNvbGxlY3Rpb25OYW1lXG5cbiAgICAgIGZvciAoY29uc3QgbW9kZWxJZCBvZiB0aGlzLnJlc3BvbnNlLmRhdGFbbW9kZWxUeXBlXSkge1xuICAgICAgICBjb25zdCBtb2RlbERhdGEgPSB0aGlzLnJlc3BvbnNlLnByZWxvYWRlZFtjb2xsZWN0aW9uTmFtZV1bbW9kZWxJZF1cblxuICAgICAgICBpZiAoIW1vZGVsRGF0YSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgbW9kZWwgZGF0YSBmb3IgJHtjb2xsZWN0aW9uTmFtZX0oJHttb2RlbElkfSlgKVxuXG4gICAgICAgIGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsQ2xhc3Moe1xuICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcbiAgICAgICAgICBkYXRhOiBtb2RlbERhdGEsXG4gICAgICAgICAgaXNOZXdSZWNvcmQ6IGZhbHNlXG4gICAgICAgIH0pXG5cbiAgICAgICAgbW9kZWwuX3JlYWRQcmVsb2FkZWRSZWxhdGlvbnNoaXBzKHByZWxvYWRlZClcbiAgICAgICAgbW9kZWxzLnB1c2gobW9kZWwpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZGVsc1xuICB9XG59XG4iXX0=