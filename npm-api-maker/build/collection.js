import cloneDeep from "clone-deep";
import CommandsPool from "./commands-pool.js";
import { digg } from "diggerize";
import * as inflection from "inflection";
import { incorporate } from "incorporator";
import Result from "./result.js";
import uniqunize from "uniqunize";
/**
 * @template {typeof import("./base-model.js").default} MC
 * @typedef {InstanceType<MC>} ModelOf
 */
/**
 * @template {typeof import("./base-model.js").default} MC
 * @typedef {object} CollectionArgsType
 * @property {ModelOf<MC>} [model]
 * @property {MC} modelClass
 * @property {string} [reflectionName]
 */
/**
 * @typedef {object} QueryArgsType
 * @property {Record<string, string[]>} [abilities]
 * @property {string} [accessibleBy]
 * @property {number} [count]
 * @property {string} [distinct]
 * @property {string[]} [groupBy]
 * @property {number} [limit]
 * @property {number} [page]
 * @property {Record<string, any>} [params]
 * @property {number} [per]
 * @property {string[]} [preload]
 * @property {Record<string, any>} [ransack]
 * @property {Record<string, any>} [search]
 * @property {Record<string, string[]>} [select]
 * @property {Record<string, string[]>} [selectColumns]
 */
/**
 * @template {typeof import("./base-model.js").default} MC
 */
export default class ApiMakerCollection {
    static apiMakerType = "Collection";
    /**
     * @param {CollectionArgsType<MC>} args
     * @param {QueryArgsType} queryArgs
     */
    constructor(args, queryArgs = {}) {
        if (!args.modelClass)
            throw new Error(`No modelClass given in ${Object.keys(args).join(", ")}`);
        this.queryArgs = queryArgs;
        this.args = args;
    }
    abilities(originalAbilities) {
        const newAbilities = {};
        for (const originalAbilityName in originalAbilities) {
            const newModelName = inflection.underscore(originalAbilityName);
            const newValues = [];
            const originalValues = originalAbilities[originalAbilityName];
            for (const originalAbilityName of originalValues) {
                const newAbilityName = inflection.underscore(originalAbilityName);
                newValues.push(newAbilityName);
            }
            newAbilities[newModelName] = newValues;
        }
        return this._merge({ abilities: newAbilities });
    }
    /**
     * @param {string} abilityName
     * @returns {this}
     */
    accessibleBy(abilityName) {
        return this._merge({ accessibleBy: inflection.underscore(abilityName) });
    }
    /**
     * @returns {Promise<number>}
     */
    async count() {
        const response = await this.clone()._merge({ count: true })._response();
        return digg(response, "count");
    }
    /**
     * @returns {this}
     */
    distinct() {
        return this._merge({ distinct: true });
    }
    /**
     * @param {function(import("./base-model.js").default) : void} callback
     * @returns {Promise<void>}
     */
    async each(callback) {
        const array = await this.toArray();
        for (const model in array) {
            callback.call(model);
        }
    }
    /**
     * @param {...string} keys
     * @returns {this}
     */
    except(...keys) {
        for (const key of keys) {
            if (key == "page") {
                delete this.queryArgs[key];
            }
            else {
                throw new Error(`Unhandled key: ${key}`);
            }
        }
        return this;
    }
    /**
     * @returns {Promise<ModelOf<MC>>}
     */
    async first() {
        const models = await this.toArray();
        return models[0];
    }
    groupBy(...arrayOfTablesAndColumns) {
        const arrayOfTablesAndColumnsWithLowercaseColumns = arrayOfTablesAndColumns.map((tableAndColumn) => {
            if (Array.isArray(tableAndColumn)) {
                return [tableAndColumn[0], tableAndColumn[1].toLowerCase()];
            }
            else {
                return tableAndColumn.toLowerCase();
            }
        });
        const currentGroupBy = this.queryArgs.groupBy || [];
        const newGroupBy = currentGroupBy.concat(arrayOfTablesAndColumnsWithLowercaseColumns);
        return this._merge({
            groupBy: newGroupBy
        });
    }
    async ensureLoaded() {
        if (!this.isLoaded()) {
            const models = await this.toArray();
            this.set(models);
        }
        return this.loaded();
    }
    /**
     * @returns {boolean}
     */
    isLoaded() {
        const { model, reflectionName } = this.args;
        if (reflectionName in model.relationshipsCache) {
            return true;
        }
        else if (reflectionName in model.relationships) {
            return true;
        }
        return false;
    }
    /**
     * @param {number} amount
     * @returns {this}
     */
    limit(amount) {
        return this._merge({ limit: amount });
    }
    /**
     * @returns {Array<ModelOf<MC>>}
     */
    preloaded() {
        if (!(this.args.reflectionName in this.args.model.relationshipsCache)) {
            throw new Error(`${this.args.reflectionName} hasnt been loaded yet`);
        }
        return this.args.model.relationshipsCache[this.args.reflectionName];
    }
    /**
     * @returns {ModelOf<MC> | Array<ModelOf<MC>>}
     */
    loaded() {
        const { model, reflectionName } = this.args;
        if (reflectionName in model.relationships) {
            return model.relationships[reflectionName];
        }
        else if (reflectionName in model.relationshipsCache) {
            return model.relationshipsCache[reflectionName];
        }
        else if (model.isNewRecord()) {
            const reflectionNameUnderscore = inflection.underscore(reflectionName);
            // Initialize as empty and try again to return the empty result
            this.set([]);
            return digg(model.relationships, reflectionNameUnderscore);
        }
        else {
            const relationshipsLoaded = uniqunize(Object.keys(model.relationships).concat(Object.keys(model.relationshipsCache)));
            throw new Error(`${reflectionName} hasnt been loaded yet on ${model.modelClassData().name}. Loaded was: ${relationshipsLoaded.join(", ")}`);
        }
    }
    /** @returns {Array<ModelOf<MC>>} */
    loadedArray() {
        const loaded = this.loaded();
        if (Array.isArray(loaded)) {
            return loaded;
        }
        else {
            throw new Error("'loaded' wasn't an array");
        }
    }
    // Replaces the relationships with the given new collection.
    set(newCollection) {
        this.args.model.relationships[this.args.reflectionName] = newCollection;
    }
    // Pushes another model onto the given collection.
    push(newModel) {
        const { model, reflectionName } = this.args;
        if (!(reflectionName in model.relationships)) {
            model.relationships[reflectionName] = [];
        }
        if (!model.relationships[reflectionName].includes(newModel)) {
            model.relationships[reflectionName].push(newModel);
        }
    }
    // Array shortcuts
    /**
     * @param {function(import("./base-model.js").default): boolean} callback
     * @returns {import("./base-model.js").default}
     */
    find(callback) { return this.loadedArray().find(callback); }
    /**
     * @param {function(import("./base-model.js").default): void} callback
     * @returns {void}
     */
    forEach(callback) { return this.loadedArray().forEach(callback); }
    /**
     * @param {function(import("./base-model.js").default): void} callback
     * @returns {any[]}
     */
    map(callback) { return this.loadedArray().map(callback); }
    /**
     * @param {string[]} preloadValue
     * @returns {this}
     */
    preload(preloadValue) {
        return this._merge({ preload: preloadValue });
    }
    /**
     * @param {number} page
     * @returns {this}
     */
    page(page) {
        if (!page)
            page = 1;
        return this._merge({ page });
    }
    /**
     * @param {string} pageKey
     * @returns {this}
     */
    pageKey(pageKey) {
        return this._merge({ pageKey });
    }
    /**
     * @returns {boolean}
     */
    isFiltered() {
        const { queryArgs } = this;
        if (queryArgs.accessibleBy ||
            queryArgs.count ||
            queryArgs.limit ||
            queryArgs.page ||
            queryArgs.params ||
            queryArgs.per ||
            queryArgs.ransack ||
            queryArgs.search) {
            return true;
        }
        return false;
    }
    /**
     * @returns {Record<string, any>}
     */
    params() {
        let params = {};
        if (this.queryArgs.params)
            params = incorporate(params, this.queryArgs.params);
        if (this.queryArgs.abilities)
            params.abilities = this.queryArgs.abilities;
        if (this.queryArgs.accessibleBy)
            params.accessible_by = inflection.underscore(this.queryArgs.accessibleBy);
        if (this.queryArgs.count)
            params.count = this.queryArgs.count;
        if (this.queryArgs.distinct)
            params.distinct = this.queryArgs.distinct;
        if (this.queryArgs.groupBy)
            params.group_by = this.queryArgs.groupBy;
        if (this.queryArgs.ransack)
            params.q = this.queryArgs.ransack;
        if (this.queryArgs.limit)
            params.limit = this.queryArgs.limit;
        if (this.queryArgs.preload)
            params.preload = this.queryArgs.preload;
        if (this.queryArgs.page)
            params.page = this.queryArgs.page;
        if (this.queryArgs.per)
            params.per = this.queryArgs.per;
        if (this.queryArgs.search)
            params.search = this.queryArgs.search;
        if (this.queryArgs.select)
            params.select = this.queryArgs.select;
        if (this.queryArgs.selectColumns)
            params.select_columns = this.queryArgs.selectColumns;
        return params;
    }
    /**
     * @param {number} per
     * @returns {this}
     */
    per(per) {
        return this._merge({ per });
    }
    /**
     * @param {string} perKey
     * @returns {this}
     */
    perKey(perKey) {
        return this._merge({ perKey });
    }
    /**
     * @param {Record<string, any>} params
     * @returns {this}
     */
    ransack(params) {
        if (params)
            this._merge({ ransack: params });
        return this;
    }
    /**
     * @returns {Promise<Result>}
     */
    async result() {
        const response = await this._response();
        const models = digg(response, "collection");
        this._addQueryToModels(models);
        const result = new Result({ collection: this, models, response });
        return result;
    }
    /**
     * @param {Record<string, any>} params
     * @returns {this}
     */
    search(params) {
        if (params)
            this._merge({ search: params });
        return this;
    }
    /**
     * @param {string} searchKey
     * @returns {this}
     */
    searchKey(searchKey) {
        return this._merge({ searchKey });
    }
    /**
     * @param {Record<string, string[]>} originalSelect
     * @returns {this}
     */
    select(originalSelect) {
        const newSelect = {};
        for (const originalModelName in originalSelect) {
            const newModelName = inflection.underscore(originalModelName);
            const newValues = [];
            const originalValues = originalSelect[originalModelName];
            for (const originalAttributeName of originalValues) {
                const newAttributeName = inflection.underscore(originalAttributeName);
                newValues.push(newAttributeName);
            }
            newSelect[newModelName] = newValues;
        }
        return this._merge({ select: newSelect });
    }
    /**
     * @param {Record<string, string[]>} originalSelect
     * @returns {this}
     */
    selectColumns(originalSelect) {
        const newSelect = {};
        for (const originalModelName in originalSelect) {
            const newModelName = inflection.underscore(inflection.underscore(originalModelName));
            const newValues = [];
            const originalValues = originalSelect[originalModelName];
            for (const originalAttributeName of originalValues) {
                const newAttributeName = inflection.underscore(originalAttributeName);
                newValues.push(newAttributeName);
            }
            newSelect[newModelName] = newValues;
        }
        return this._merge({ selectColumns: newSelect });
    }
    /**
     * @param {string} sortBy
     * @returns {this}
     */
    sort(sortBy) {
        return this._merge({ ransack: { s: sortBy } });
    }
    /**
     * @returns {Promise<Array<ModelOf<MC>>>}
     */
    async toArray() {
        const response = await this._response();
        const models = digg(response, "collection");
        this._addQueryToModels(models);
        return models;
    }
    /**
     * @returns {MC}
     */
    modelClass() {
        if (!this.args.modelClass) {
            throw new Error("No model class given in args");
        }
        return this.args.modelClass;
    }
    /**
     * @returns {ApiMakerCollection}
     */
    clone() {
        const clonedQueryArgs = cloneDeep(this.queryArgs);
        return new ApiMakerCollection(this.args, clonedQueryArgs);
    }
    // This is needed when reloading a version of the model with the same selected attributes and preloads
    _addQueryToModels(models) {
        for (const model of models) {
            model.collection = this;
        }
    }
    _merge(newQueryArgs) {
        incorporate(this.queryArgs, newQueryArgs);
        return this;
    }
    _response() {
        if (!this.args)
            throw new Error("No args?");
        if (!this.args.modelClass)
            throw new Error("No modelClass in args");
        if (!this.args.modelClass.modelClassData)
            throw new Error(`No modelClassData on modelClass ${this.args.modelClass?.name} (${typeof this.args.modelClass})`);
        const modelClassData = this.args.modelClass.modelClassData();
        return CommandsPool.addCommand({
            args: this.params(),
            command: `${modelClassData.collectionName}-index`,
            collectionName: modelClassData.collectionName,
            type: "index"
        }, {});
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsiY29sbGVjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUE7QUFDbEMsT0FBTyxZQUFZLE1BQU0sb0JBQW9CLENBQUE7QUFDN0MsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sY0FBYyxDQUFBO0FBQ3hDLE9BQU8sTUFBTSxNQUFNLGFBQWEsQ0FBQTtBQUNoQyxPQUFPLFNBQVMsTUFBTSxXQUFXLENBQUE7QUFFakM7OztHQUdHO0FBRUg7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sa0JBQWtCO0lBQ3JDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0lBRWxDOzs7T0FHRztJQUNILFlBQVksSUFBSSxFQUFFLFNBQVMsR0FBRyxFQUFFO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUUvRixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsU0FBUyxDQUFDLGlCQUFpQjtRQUN6QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7UUFFdkIsS0FBSyxNQUFNLG1CQUFtQixJQUFJLGlCQUFpQixFQUFFLENBQUM7WUFDcEQsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxD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SSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07WUFBRSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzlFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTO1lBQUUsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQTtRQUN6RSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWTtZQUFFLE1BQU0sQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQzFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLO1lBQUUsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQTtRQUM3RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUTtZQUFFLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUE7UUFDdEUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87WUFBRSxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFBO1FBQ3BFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPO1lBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQTtRQUM3RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSztZQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUE7UUFDN0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU87WUFBRSxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFBO1FBQ25FLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO1lBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQTtRQUMxRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRztZQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUE7UUFDdkQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07WUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO1FBQ2hFLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNO1lBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQTtRQUNoRSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYTtZQUFFLE1BQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUE7UUFFdEYsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsR0FBRyxDQUFDLEdBQUc7UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBTTtRQUNYLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUE7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE9BQU8sQ0FBQyxNQUFNO1FBQ1osSUFBSSxNQUFNO1lBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFBO1FBQzFDLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtRQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBRTNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUU5QixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUE7UUFFL0QsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLE1BQU07UUFDWCxJQUFJLE1BQU07WUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUE7UUFDekMsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLFNBQVM7UUFDakIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLGNBQWM7UUFDbkIsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO1FBRXBCLEtBQUssTUFBTSxpQkFBaUIsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUMvQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDN0QsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO1lBQ3BCLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1lBRXhELEtBQUssTUFBTSxxQkFBcUIsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUE7Z0JBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtZQUNsQyxDQUFDO1lBRUQsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLFNBQVMsQ0FBQTtRQUNyQyxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxjQUFjO1FBQzFCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtRQUVwQixLQUFLLE1BQU0saUJBQWlCLElBQUksY0FBYyxFQUFFLENBQUM7WUFDL0MsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtZQUNwRixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUE7WUFDcEIsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFFeEQsS0FBSyxNQUFNLHFCQUFxQixJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQTtnQkFDckUsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBQ2xDLENBQUM7WUFFRCxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUyxDQUFBO1FBQ3JDLENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSSxDQUFDLE1BQU07UUFDVCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFDLEVBQUMsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxPQUFPO1FBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7UUFDdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUUzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFOUIsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1FBQ2pELENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFBO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBRWpELE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFFRCxzR0FBc0c7SUFDdEcsaUJBQWlCLENBQUMsTUFBTTtRQUN0QixLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQzNCLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO1FBQ3pCLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFDLFlBQVk7UUFDakIsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFFekMsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsU0FBUztRQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQTtRQUUzSixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUU1RCxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQzVCO1lBQ0UsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxFQUFFLEdBQUcsY0FBYyxDQUFDLGNBQWMsUUFBUTtZQUNqRCxjQUFjLEVBQUUsY0FBYyxDQUFDLGNBQWM7WUFDN0MsSUFBSSxFQUFFLE9BQU87U0FDZCxFQUNELEVBQUUsQ0FDSCxDQUFBO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbG9uZURlZXAgZnJvbSBcImNsb25lLWRlZXBcIlxuaW1wb3J0IENvbW1hbmRzUG9vbCBmcm9tIFwiLi9jb21tYW5kcy1wb29sLmpzXCJcbmltcG9ydCB7ZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCB7aW5jb3Jwb3JhdGV9IGZyb20gXCJpbmNvcnBvcmF0b3JcIlxuaW1wb3J0IFJlc3VsdCBmcm9tIFwiLi9yZXN1bHQuanNcIlxuaW1wb3J0IHVuaXF1bml6ZSBmcm9tIFwidW5pcXVuaXplXCJcblxuLyoqXG4gKiBAdGVtcGxhdGUge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gTUNcbiAqIEB0eXBlZGVmIHtJbnN0YW5jZVR5cGU8TUM+fSBNb2RlbE9mXG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gTUNcbiAqIEB0eXBlZGVmIHtvYmplY3R9IENvbGxlY3Rpb25BcmdzVHlwZVxuICogQHByb3BlcnR5IHtNb2RlbE9mPE1DPn0gW21vZGVsXVxuICogQHByb3BlcnR5IHtNQ30gbW9kZWxDbGFzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IFtyZWZsZWN0aW9uTmFtZV1cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IFF1ZXJ5QXJnc1R5cGVcbiAqIEBwcm9wZXJ0eSB7UmVjb3JkPHN0cmluZywgc3RyaW5nW10+fSBbYWJpbGl0aWVzXVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFthY2Nlc3NpYmxlQnldXG4gKiBAcHJvcGVydHkge251bWJlcn0gW2NvdW50XVxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtkaXN0aW5jdF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IFtncm91cEJ5XVxuICogQHByb3BlcnR5IHtudW1iZXJ9IFtsaW1pdF1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbcGFnZV1cbiAqIEBwcm9wZXJ0eSB7UmVjb3JkPHN0cmluZywgYW55Pn0gW3BhcmFtc11cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbcGVyXVxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gW3ByZWxvYWRdXG4gKiBAcHJvcGVydHkge1JlY29yZDxzdHJpbmcsIGFueT59IFtyYW5zYWNrXVxuICogQHByb3BlcnR5IHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBbc2VhcmNoXVxuICogQHByb3BlcnR5IHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT59IFtzZWxlY3RdXG4gKiBAcHJvcGVydHkge1JlY29yZDxzdHJpbmcsIHN0cmluZ1tdPn0gW3NlbGVjdENvbHVtbnNdXG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gTUNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBpTWFrZXJDb2xsZWN0aW9uIHtcbiAgc3RhdGljIGFwaU1ha2VyVHlwZSA9IFwiQ29sbGVjdGlvblwiXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbkFyZ3NUeXBlPE1DPn0gYXJnc1xuICAgKiBAcGFyYW0ge1F1ZXJ5QXJnc1R5cGV9IHF1ZXJ5QXJnc1xuICAgKi9cbiAgY29uc3RydWN0b3IoYXJncywgcXVlcnlBcmdzID0ge30pIHtcbiAgICBpZiAoIWFyZ3MubW9kZWxDbGFzcykgdGhyb3cgbmV3IEVycm9yKGBObyBtb2RlbENsYXNzIGdpdmVuIGluICR7T2JqZWN0LmtleXMoYXJncykuam9pbihcIiwgXCIpfWApXG5cbiAgICB0aGlzLnF1ZXJ5QXJncyA9IHF1ZXJ5QXJnc1xuICAgIHRoaXMuYXJncyA9IGFyZ3NcbiAgfVxuXG4gIGFiaWxpdGllcyhvcmlnaW5hbEFiaWxpdGllcykge1xuICAgIGNvbnN0IG5ld0FiaWxpdGllcyA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IG9yaWdpbmFsQWJpbGl0eU5hbWUgaW4gb3JpZ2luYWxBYmlsaXRpZXMpIHtcbiAgICAgIGNvbnN0IG5ld01vZGVsTmFtZSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShvcmlnaW5hbEFiaWxpdHlOYW1lKVxuICAgICAgY29uc3QgbmV3VmFsdWVzID0gW11cbiAgICAgIGNvbnN0IG9yaWdpbmFsVmFsdWVzID0gb3JpZ2luYWxBYmlsaXRpZXNbb3JpZ2luYWxBYmlsaXR5TmFtZV1cblxuICAgICAgZm9yIChjb25zdCBvcmlnaW5hbEFiaWxpdHlOYW1lIG9mIG9yaWdpbmFsVmFsdWVzKSB7XG4gICAgICAgIGNvbnN0IG5ld0FiaWxpdHlOYW1lID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKG9yaWdpbmFsQWJpbGl0eU5hbWUpXG4gICAgICAgIG5ld1ZhbHVlcy5wdXNoKG5ld0FiaWxpdHlOYW1lKVxuICAgICAgfVxuXG4gICAgICBuZXdBYmlsaXRpZXNbbmV3TW9kZWxOYW1lXSA9IG5ld1ZhbHVlc1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tZXJnZSh7YWJpbGl0aWVzOiBuZXdBYmlsaXRpZXN9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhYmlsaXR5TmFtZVxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIGFjY2Vzc2libGVCeShhYmlsaXR5TmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9tZXJnZSh7YWNjZXNzaWJsZUJ5OiBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYWJpbGl0eU5hbWUpfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxuICAgKi9cbiAgYXN5bmMgY291bnQoKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNsb25lKCkuX21lcmdlKHtjb3VudDogdHJ1ZX0pLl9yZXNwb25zZSgpXG5cbiAgICByZXR1cm4gZGlnZyhyZXNwb25zZSwgXCJjb3VudFwiKVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgZGlzdGluY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlKHtkaXN0aW5jdDogdHJ1ZX0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdCkgOiB2b2lkfSBjYWxsYmFja1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFzeW5jIGVhY2goY2FsbGJhY2spIHtcbiAgICBjb25zdCBhcnJheSA9IGF3YWl0IHRoaXMudG9BcnJheSgpXG5cbiAgICBmb3IgKGNvbnN0IG1vZGVsIGluIGFycmF5KSB7XG4gICAgICBjYWxsYmFjay5jYWxsKG1vZGVsKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gey4uLnN0cmluZ30ga2V5c1xuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIGV4Y2VwdCguLi5rZXlzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgaWYgKGtleSA9PSBcInBhZ2VcIikge1xuICAgICAgICBkZWxldGUgdGhpcy5xdWVyeUFyZ3Nba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmhhbmRsZWQga2V5OiAke2tleX1gKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8TW9kZWxPZjxNQz4+fVxuICAgKi9cbiAgYXN5bmMgZmlyc3QoKSB7XG4gICAgY29uc3QgbW9kZWxzID0gYXdhaXQgdGhpcy50b0FycmF5KClcbiAgICByZXR1cm4gbW9kZWxzWzBdXG4gIH1cblxuICBncm91cEJ5KC4uLmFycmF5T2ZUYWJsZXNBbmRDb2x1bW5zKSB7XG4gICAgY29uc3QgYXJyYXlPZlRhYmxlc0FuZENvbHVtbnNXaXRoTG93ZXJjYXNlQ29sdW1ucyA9IGFycmF5T2ZUYWJsZXNBbmRDb2x1bW5zLm1hcCgodGFibGVBbmRDb2x1bW4pID0+IHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRhYmxlQW5kQ29sdW1uKSkge1xuICAgICAgICByZXR1cm4gW3RhYmxlQW5kQ29sdW1uWzBdLCB0YWJsZUFuZENvbHVtblsxXS50b0xvd2VyQ2FzZSgpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRhYmxlQW5kQ29sdW1uLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IGN1cnJlbnRHcm91cEJ5ID0gdGhpcy5xdWVyeUFyZ3MuZ3JvdXBCeSB8fCBbXVxuICAgIGNvbnN0IG5ld0dyb3VwQnkgPSBjdXJyZW50R3JvdXBCeS5jb25jYXQoYXJyYXlPZlRhYmxlc0FuZENvbHVtbnNXaXRoTG93ZXJjYXNlQ29sdW1ucylcblxuICAgIHJldHVybiB0aGlzLl9tZXJnZSh7XG4gICAgICBncm91cEJ5OiBuZXdHcm91cEJ5XG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIGVuc3VyZUxvYWRlZCgpIHtcbiAgICBpZiAoIXRoaXMuaXNMb2FkZWQoKSkge1xuICAgICAgY29uc3QgbW9kZWxzID0gYXdhaXQgdGhpcy50b0FycmF5KClcblxuICAgICAgdGhpcy5zZXQobW9kZWxzKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxvYWRlZCgpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0xvYWRlZCgpIHtcbiAgICBjb25zdCB7bW9kZWwsIHJlZmxlY3Rpb25OYW1lfSA9IHRoaXMuYXJnc1xuXG4gICAgaWYgKHJlZmxlY3Rpb25OYW1lIGluIG1vZGVsLnJlbGF0aW9uc2hpcHNDYWNoZSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKHJlZmxlY3Rpb25OYW1lIGluIG1vZGVsLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFtb3VudFxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIGxpbWl0KGFtb3VudCkge1xuICAgIHJldHVybiB0aGlzLl9tZXJnZSh7bGltaXQ6IGFtb3VudH0pXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge0FycmF5PE1vZGVsT2Y8TUM+Pn1cbiAgICovXG4gIHByZWxvYWRlZCgpIHtcbiAgICBpZiAoISh0aGlzLmFyZ3MucmVmbGVjdGlvbk5hbWUgaW4gdGhpcy5hcmdzLm1vZGVsLnJlbGF0aW9uc2hpcHNDYWNoZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLmFyZ3MucmVmbGVjdGlvbk5hbWV9IGhhc250IGJlZW4gbG9hZGVkIHlldGApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuYXJncy5tb2RlbC5yZWxhdGlvbnNoaXBzQ2FjaGVbdGhpcy5hcmdzLnJlZmxlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtNb2RlbE9mPE1DPiB8IEFycmF5PE1vZGVsT2Y8TUM+Pn1cbiAgICovXG4gIGxvYWRlZCgpIHtcbiAgICBjb25zdCB7bW9kZWwsIHJlZmxlY3Rpb25OYW1lfSA9IHRoaXMuYXJnc1xuXG4gICAgaWYgKHJlZmxlY3Rpb25OYW1lIGluIG1vZGVsLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJldHVybiBtb2RlbC5yZWxhdGlvbnNoaXBzW3JlZmxlY3Rpb25OYW1lXVxuICAgIH0gZWxzZSBpZiAocmVmbGVjdGlvbk5hbWUgaW4gbW9kZWwucmVsYXRpb25zaGlwc0NhY2hlKSB7XG4gICAgICByZXR1cm4gbW9kZWwucmVsYXRpb25zaGlwc0NhY2hlW3JlZmxlY3Rpb25OYW1lXVxuICAgIH0gZWxzZSBpZiAobW9kZWwuaXNOZXdSZWNvcmQoKSkge1xuICAgICAgY29uc3QgcmVmbGVjdGlvbk5hbWVVbmRlcnNjb3JlID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKHJlZmxlY3Rpb25OYW1lKVxuXG4gICAgICAvLyBJbml0aWFsaXplIGFzIGVtcHR5IGFuZCB0cnkgYWdhaW4gdG8gcmV0dXJuIHRoZSBlbXB0eSByZXN1bHRcbiAgICAgIHRoaXMuc2V0KFtdKVxuXG4gICAgICByZXR1cm4gZGlnZyhtb2RlbC5yZWxhdGlvbnNoaXBzLCByZWZsZWN0aW9uTmFtZVVuZGVyc2NvcmUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcHNMb2FkZWQgPSB1bmlxdW5pemUoT2JqZWN0LmtleXMobW9kZWwucmVsYXRpb25zaGlwcykuY29uY2F0KE9iamVjdC5rZXlzKG1vZGVsLnJlbGF0aW9uc2hpcHNDYWNoZSkpKVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cmVmbGVjdGlvbk5hbWV9IGhhc250IGJlZW4gbG9hZGVkIHlldCBvbiAke21vZGVsLm1vZGVsQ2xhc3NEYXRhKCkubmFtZX0uIExvYWRlZCB3YXM6ICR7cmVsYXRpb25zaGlwc0xvYWRlZC5qb2luKFwiLCBcIil9YClcbiAgICB9XG4gIH1cblxuICAvKiogQHJldHVybnMge0FycmF5PE1vZGVsT2Y8TUM+Pn0gKi9cbiAgbG9hZGVkQXJyYXkoKSB7XG4gICAgY29uc3QgbG9hZGVkID0gdGhpcy5sb2FkZWQoKVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobG9hZGVkKSkge1xuICAgICAgcmV0dXJuIGxvYWRlZFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCInbG9hZGVkJyB3YXNuJ3QgYW4gYXJyYXlcIilcbiAgICB9XG4gIH1cblxuICAvLyBSZXBsYWNlcyB0aGUgcmVsYXRpb25zaGlwcyB3aXRoIHRoZSBnaXZlbiBuZXcgY29sbGVjdGlvbi5cbiAgc2V0KG5ld0NvbGxlY3Rpb24pIHtcbiAgICB0aGlzLmFyZ3MubW9kZWwucmVsYXRpb25zaGlwc1t0aGlzLmFyZ3MucmVmbGVjdGlvbk5hbWVdID0gbmV3Q29sbGVjdGlvblxuICB9XG5cbiAgLy8gUHVzaGVzIGFub3RoZXIgbW9kZWwgb250byB0aGUgZ2l2ZW4gY29sbGVjdGlvbi5cbiAgcHVzaChuZXdNb2RlbCkge1xuICAgIGNvbnN0IHttb2RlbCwgcmVmbGVjdGlvbk5hbWV9ID0gdGhpcy5hcmdzXG5cbiAgICBpZiAoIShyZWZsZWN0aW9uTmFtZSBpbiBtb2RlbC5yZWxhdGlvbnNoaXBzKSkge1xuICAgICAgbW9kZWwucmVsYXRpb25zaGlwc1tyZWZsZWN0aW9uTmFtZV0gPSBbXVxuICAgIH1cblxuICAgIGlmICghbW9kZWwucmVsYXRpb25zaGlwc1tyZWZsZWN0aW9uTmFtZV0uaW5jbHVkZXMobmV3TW9kZWwpKSB7XG4gICAgICBtb2RlbC5yZWxhdGlvbnNoaXBzW3JlZmxlY3Rpb25OYW1lXS5wdXNoKG5ld01vZGVsKVxuICAgIH1cbiAgfVxuXG4gIC8vIEFycmF5IHNob3J0Y3V0c1xuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdCk6IGJvb2xlYW59IGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHtpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH1cbiAgICovXG4gIGZpbmQoY2FsbGJhY2spIHsgcmV0dXJuIHRoaXMubG9hZGVkQXJyYXkoKS5maW5kKGNhbGxiYWNrKSB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oaW1wb3J0KFwiLi9iYXNlLW1vZGVsLmpzXCIpLmRlZmF1bHQpOiB2b2lkfSBjYWxsYmFja1xuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2spIHsgcmV0dXJuIHRoaXMubG9hZGVkQXJyYXkoKS5mb3JFYWNoKGNhbGxiYWNrKSB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oaW1wb3J0KFwiLi9iYXNlLW1vZGVsLmpzXCIpLmRlZmF1bHQpOiB2b2lkfSBjYWxsYmFja1xuICAgKiBAcmV0dXJucyB7YW55W119XG4gICAqL1xuICBtYXAoY2FsbGJhY2spIHsgcmV0dXJuIHRoaXMubG9hZGVkQXJyYXkoKS5tYXAoY2FsbGJhY2spIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gcHJlbG9hZFZhbHVlXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgcHJlbG9hZChwcmVsb2FkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Uoe3ByZWxvYWQ6IHByZWxvYWRWYWx1ZX0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBhZ2VcbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqL1xuICBwYWdlKHBhZ2UpIHtcbiAgICBpZiAoIXBhZ2UpIHBhZ2UgPSAxXG5cbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Uoe3BhZ2V9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlS2V5XG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgcGFnZUtleShwYWdlS2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlKHtwYWdlS2V5fSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmlsdGVyZWQoKSB7XG4gICAgY29uc3Qge3F1ZXJ5QXJnc30gPSB0aGlzXG5cbiAgICBpZiAoXG4gICAgICBxdWVyeUFyZ3MuYWNjZXNzaWJsZUJ5IHx8XG4gICAgICBxdWVyeUFyZ3MuY291bnQgfHxcbiAgICAgIHF1ZXJ5QXJncy5saW1pdCB8fFxuICAgICAgcXVlcnlBcmdzLnBhZ2UgfHxcbiAgICAgIHF1ZXJ5QXJncy5wYXJhbXMgfHxcbiAgICAgIHF1ZXJ5QXJncy5wZXIgfHxcbiAgICAgIHF1ZXJ5QXJncy5yYW5zYWNrIHx8XG4gICAgICBxdWVyeUFyZ3Muc2VhcmNoXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fVxuICAgKi9cbiAgcGFyYW1zKCkge1xuICAgIGxldCBwYXJhbXMgPSB7fVxuXG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLnBhcmFtcykgcGFyYW1zID0gaW5jb3Jwb3JhdGUocGFyYW1zLCB0aGlzLnF1ZXJ5QXJncy5wYXJhbXMpXG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLmFiaWxpdGllcykgcGFyYW1zLmFiaWxpdGllcyA9IHRoaXMucXVlcnlBcmdzLmFiaWxpdGllc1xuICAgIGlmICh0aGlzLnF1ZXJ5QXJncy5hY2Nlc3NpYmxlQnkpIHBhcmFtcy5hY2Nlc3NpYmxlX2J5ID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKHRoaXMucXVlcnlBcmdzLmFjY2Vzc2libGVCeSlcbiAgICBpZiAodGhpcy5xdWVyeUFyZ3MuY291bnQpIHBhcmFtcy5jb3VudCA9IHRoaXMucXVlcnlBcmdzLmNvdW50XG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLmRpc3RpbmN0KSBwYXJhbXMuZGlzdGluY3QgPSB0aGlzLnF1ZXJ5QXJncy5kaXN0aW5jdFxuICAgIGlmICh0aGlzLnF1ZXJ5QXJncy5ncm91cEJ5KSBwYXJhbXMuZ3JvdXBfYnkgPSB0aGlzLnF1ZXJ5QXJncy5ncm91cEJ5XG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLnJhbnNhY2spIHBhcmFtcy5xID0gdGhpcy5xdWVyeUFyZ3MucmFuc2Fja1xuICAgIGlmICh0aGlzLnF1ZXJ5QXJncy5saW1pdCkgcGFyYW1zLmxpbWl0ID0gdGhpcy5xdWVyeUFyZ3MubGltaXRcbiAgICBpZiAodGhpcy5xdWVyeUFyZ3MucHJlbG9hZCkgcGFyYW1zLnByZWxvYWQgPSB0aGlzLnF1ZXJ5QXJncy5wcmVsb2FkXG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLnBhZ2UpIHBhcmFtcy5wYWdlID0gdGhpcy5xdWVyeUFyZ3MucGFnZVxuICAgIGlmICh0aGlzLnF1ZXJ5QXJncy5wZXIpIHBhcmFtcy5wZXIgPSB0aGlzLnF1ZXJ5QXJncy5wZXJcbiAgICBpZiAodGhpcy5xdWVyeUFyZ3Muc2VhcmNoKSBwYXJhbXMuc2VhcmNoID0gdGhpcy5xdWVyeUFyZ3Muc2VhcmNoXG4gICAgaWYgKHRoaXMucXVlcnlBcmdzLnNlbGVjdCkgcGFyYW1zLnNlbGVjdCA9IHRoaXMucXVlcnlBcmdzLnNlbGVjdFxuICAgIGlmICh0aGlzLnF1ZXJ5QXJncy5zZWxlY3RDb2x1bW5zKSBwYXJhbXMuc2VsZWN0X2NvbHVtbnMgPSB0aGlzLnF1ZXJ5QXJncy5zZWxlY3RDb2x1bW5zXG5cbiAgICByZXR1cm4gcGFyYW1zXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBlclxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHBlcihwZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Uoe3Blcn0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBlcktleVxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHBlcktleShwZXJLZXkpIHtcbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Uoe3BlcktleX0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBwYXJhbXNcbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqL1xuICByYW5zYWNrKHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMpIHRoaXMuX21lcmdlKHtyYW5zYWNrOiBwYXJhbXN9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8UmVzdWx0Pn1cbiAgICovXG4gIGFzeW5jIHJlc3VsdCgpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX3Jlc3BvbnNlKClcbiAgICBjb25zdCBtb2RlbHMgPSBkaWdnKHJlc3BvbnNlLCBcImNvbGxlY3Rpb25cIilcblxuICAgIHRoaXMuX2FkZFF1ZXJ5VG9Nb2RlbHMobW9kZWxzKVxuXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFJlc3VsdCh7Y29sbGVjdGlvbjogdGhpcywgbW9kZWxzLCByZXNwb25zZX0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBwYXJhbXNcbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqL1xuICBzZWFyY2gocGFyYW1zKSB7XG4gICAgaWYgKHBhcmFtcykgdGhpcy5fbWVyZ2Uoe3NlYXJjaDogcGFyYW1zfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hLZXlcbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqL1xuICBzZWFyY2hLZXkoc2VhcmNoS2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlKHtzZWFyY2hLZXl9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgc3RyaW5nW10+fSBvcmlnaW5hbFNlbGVjdFxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHNlbGVjdChvcmlnaW5hbFNlbGVjdCkge1xuICAgIGNvbnN0IG5ld1NlbGVjdCA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IG9yaWdpbmFsTW9kZWxOYW1lIGluIG9yaWdpbmFsU2VsZWN0KSB7XG4gICAgICBjb25zdCBuZXdNb2RlbE5hbWUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUob3JpZ2luYWxNb2RlbE5hbWUpXG4gICAgICBjb25zdCBuZXdWYWx1ZXMgPSBbXVxuICAgICAgY29uc3Qgb3JpZ2luYWxWYWx1ZXMgPSBvcmlnaW5hbFNlbGVjdFtvcmlnaW5hbE1vZGVsTmFtZV1cblxuICAgICAgZm9yIChjb25zdCBvcmlnaW5hbEF0dHJpYnV0ZU5hbWUgb2Ygb3JpZ2luYWxWYWx1ZXMpIHtcbiAgICAgICAgY29uc3QgbmV3QXR0cmlidXRlTmFtZSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShvcmlnaW5hbEF0dHJpYnV0ZU5hbWUpXG4gICAgICAgIG5ld1ZhbHVlcy5wdXNoKG5ld0F0dHJpYnV0ZU5hbWUpXG4gICAgICB9XG5cbiAgICAgIG5ld1NlbGVjdFtuZXdNb2RlbE5hbWVdID0gbmV3VmFsdWVzXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21lcmdlKHtzZWxlY3Q6IG5ld1NlbGVjdH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT59IG9yaWdpbmFsU2VsZWN0XG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgc2VsZWN0Q29sdW1ucyhvcmlnaW5hbFNlbGVjdCkge1xuICAgIGNvbnN0IG5ld1NlbGVjdCA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IG9yaWdpbmFsTW9kZWxOYW1lIGluIG9yaWdpbmFsU2VsZWN0KSB7XG4gICAgICBjb25zdCBuZXdNb2RlbE5hbWUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoaW5mbGVjdGlvbi51bmRlcnNjb3JlKG9yaWdpbmFsTW9kZWxOYW1lKSlcbiAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdXG4gICAgICBjb25zdCBvcmlnaW5hbFZhbHVlcyA9IG9yaWdpbmFsU2VsZWN0W29yaWdpbmFsTW9kZWxOYW1lXVxuXG4gICAgICBmb3IgKGNvbnN0IG9yaWdpbmFsQXR0cmlidXRlTmFtZSBvZiBvcmlnaW5hbFZhbHVlcykge1xuICAgICAgICBjb25zdCBuZXdBdHRyaWJ1dGVOYW1lID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKG9yaWdpbmFsQXR0cmlidXRlTmFtZSlcbiAgICAgICAgbmV3VmFsdWVzLnB1c2gobmV3QXR0cmlidXRlTmFtZSlcbiAgICAgIH1cblxuICAgICAgbmV3U2VsZWN0W25ld01vZGVsTmFtZV0gPSBuZXdWYWx1ZXNcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbWVyZ2Uoe3NlbGVjdENvbHVtbnM6IG5ld1NlbGVjdH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvcnRCeVxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIHNvcnQoc29ydEJ5KSB7XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlKHtyYW5zYWNrOiB7czogc29ydEJ5fX0pXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8QXJyYXk8TW9kZWxPZjxNQz4+Pn1cbiAgICovXG4gIGFzeW5jIHRvQXJyYXkoKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9yZXNwb25zZSgpXG4gICAgY29uc3QgbW9kZWxzID0gZGlnZyhyZXNwb25zZSwgXCJjb2xsZWN0aW9uXCIpXG5cbiAgICB0aGlzLl9hZGRRdWVyeVRvTW9kZWxzKG1vZGVscylcblxuICAgIHJldHVybiBtb2RlbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7TUN9XG4gICAqL1xuICBtb2RlbENsYXNzKCkge1xuICAgIGlmICghdGhpcy5hcmdzLm1vZGVsQ2xhc3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG1vZGVsIGNsYXNzIGdpdmVuIGluIGFyZ3NcIilcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hcmdzLm1vZGVsQ2xhc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7QXBpTWFrZXJDb2xsZWN0aW9ufVxuICAgKi9cbiAgY2xvbmUoKSB7XG4gICAgY29uc3QgY2xvbmVkUXVlcnlBcmdzID0gY2xvbmVEZWVwKHRoaXMucXVlcnlBcmdzKVxuXG4gICAgcmV0dXJuIG5ldyBBcGlNYWtlckNvbGxlY3Rpb24odGhpcy5hcmdzLCBjbG9uZWRRdWVyeUFyZ3MpXG4gIH1cblxuICAvLyBUaGlzIGlzIG5lZWRlZCB3aGVuIHJlbG9hZGluZyBhIHZlcnNpb24gb2YgdGhlIG1vZGVsIHdpdGggdGhlIHNhbWUgc2VsZWN0ZWQgYXR0cmlidXRlcyBhbmQgcHJlbG9hZHNcbiAgX2FkZFF1ZXJ5VG9Nb2RlbHMobW9kZWxzKSB7XG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiBtb2RlbHMpIHtcbiAgICAgIG1vZGVsLmNvbGxlY3Rpb24gPSB0aGlzXG4gICAgfVxuICB9XG5cbiAgX21lcmdlKG5ld1F1ZXJ5QXJncykge1xuICAgIGluY29ycG9yYXRlKHRoaXMucXVlcnlBcmdzLCBuZXdRdWVyeUFyZ3MpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgX3Jlc3BvbnNlKCkge1xuICAgIGlmICghdGhpcy5hcmdzKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBhcmdzP1wiKVxuICAgIGlmICghdGhpcy5hcmdzLm1vZGVsQ2xhc3MpIHRocm93IG5ldyBFcnJvcihcIk5vIG1vZGVsQ2xhc3MgaW4gYXJnc1wiKVxuICAgIGlmICghdGhpcy5hcmdzLm1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEpIHRocm93IG5ldyBFcnJvcihgTm8gbW9kZWxDbGFzc0RhdGEgb24gbW9kZWxDbGFzcyAke3RoaXMuYXJncy5tb2RlbENsYXNzPy5uYW1lfSAoJHt0eXBlb2YgdGhpcy5hcmdzLm1vZGVsQ2xhc3N9KWApXG5cbiAgICBjb25zdCBtb2RlbENsYXNzRGF0YSA9IHRoaXMuYXJncy5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKClcblxuICAgIHJldHVybiBDb21tYW5kc1Bvb2wuYWRkQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgYXJnczogdGhpcy5wYXJhbXMoKSxcbiAgICAgICAgY29tbWFuZDogYCR7bW9kZWxDbGFzc0RhdGEuY29sbGVjdGlvbk5hbWV9LWluZGV4YCxcbiAgICAgICAgY29sbGVjdGlvbk5hbWU6IG1vZGVsQ2xhc3NEYXRhLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICB0eXBlOiBcImluZGV4XCJcbiAgICAgIH0sXG4gICAgICB7fVxuICAgIClcbiAgfVxufVxuIl19