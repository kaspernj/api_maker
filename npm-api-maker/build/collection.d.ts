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
export default class ApiMakerCollection<MC extends typeof import("./base-model.js").default> {
    static apiMakerType: string;
    /**
     * @param {CollectionArgsType<MC>} args
     * @param {QueryArgsType} queryArgs
     */
    constructor(args: CollectionArgsType<MC>, queryArgs?: QueryArgsType);
    queryArgs: QueryArgsType;
    args: CollectionArgsType<MC>;
    abilities(originalAbilities: any): this;
    /**
     * @param {string} abilityName
     * @returns {this}
     */
    accessibleBy(abilityName: string): this;
    /**
     * @returns {Promise<number>}
     */
    count(): Promise<number>;
    /**
     * @returns {this}
     */
    distinct(): this;
    /**
     * @param {function(import("./base-model.js").default) : void} callback
     * @returns {Promise<void>}
     */
    each(callback: (arg0: import("./base-model.js").default) => void): Promise<void>;
    /**
     * @param {...string} keys
     * @returns {this}
     */
    except(...keys: string[]): this;
    /**
     * @returns {Promise<ModelOf<MC>>}
     */
    first(): Promise<ModelOf<MC>>;
    groupBy(...arrayOfTablesAndColumns: any[]): this;
    ensureLoaded(): Promise<InstanceType<MC> | InstanceType<MC>[]>;
    /**
     * @returns {boolean}
     */
    isLoaded(): boolean;
    /**
     * @param {number} amount
     * @returns {this}
     */
    limit(amount: number): this;
    /**
     * @returns {Array<ModelOf<MC>>}
     */
    preloaded(): Array<ModelOf<MC>>;
    /**
     * @returns {ModelOf<MC> | Array<ModelOf<MC>>}
     */
    loaded(): ModelOf<MC> | Array<ModelOf<MC>>;
    /** @returns {Array<ModelOf<MC>>} */
    loadedArray(): Array<ModelOf<MC>>;
    set(newCollection: any): void;
    push(newModel: any): void;
    /**
     * @param {function(import("./base-model.js").default): boolean} callback
     * @returns {import("./base-model.js").default}
     */
    find(callback: (arg0: import("./base-model.js").default) => boolean): import("./base-model.js").default;
    /**
     * @param {function(import("./base-model.js").default): void} callback
     * @returns {void}
     */
    forEach(callback: (arg0: import("./base-model.js").default) => void): void;
    /**
     * @param {function(import("./base-model.js").default): void} callback
     * @returns {any[]}
     */
    map(callback: (arg0: import("./base-model.js").default) => void): any[];
    /**
     * @param {string[]} preloadValue
     * @returns {this}
     */
    preload(preloadValue: string[]): this;
    /**
     * @param {number} page
     * @returns {this}
     */
    page(page: number): this;
    /**
     * @param {string} pageKey
     * @returns {this}
     */
    pageKey(pageKey: string): this;
    /**
     * @returns {boolean}
     */
    isFiltered(): boolean;
    /**
     * @returns {Record<string, any>}
     */
    params(): Record<string, any>;
    /**
     * @param {number} per
     * @returns {this}
     */
    per(per: number): this;
    /**
     * @param {string} perKey
     * @returns {this}
     */
    perKey(perKey: string): this;
    /**
     * @param {Record<string, any>} params
     * @returns {this}
     */
    ransack(params: Record<string, any>): this;
    /**
     * @returns {Promise<Result>}
     */
    result(): Promise<Result>;
    /**
     * @param {Record<string, any>} params
     * @returns {this}
     */
    search(params: Record<string, any>): this;
    /**
     * @param {string} searchKey
     * @returns {this}
     */
    searchKey(searchKey: string): this;
    /**
     * @param {Record<string, string[]>} originalSelect
     * @returns {this}
     */
    select(originalSelect: Record<string, string[]>): this;
    /**
     * @param {Record<string, string[]>} originalSelect
     * @returns {this}
     */
    selectColumns(originalSelect: Record<string, string[]>): this;
    /**
     * @param {string} sortBy
     * @returns {this}
     */
    sort(sortBy: string): this;
    /**
     * @returns {Promise<Array<ModelOf<MC>>>}
     */
    toArray(): Promise<Array<ModelOf<MC>>>;
    /**
     * @returns {MC}
     */
    modelClass(): MC;
    /**
     * @returns {ApiMakerCollection}
     */
    clone(): ApiMakerCollection<any>;
    _addQueryToModels(models: any): void;
    _merge(newQueryArgs: any): this;
    _response(): any;
}
export type ModelOf<MC extends typeof import("./base-model.js").default> = InstanceType<MC>;
export type CollectionArgsType<MC extends typeof import("./base-model.js").default> = {
    model?: ModelOf<MC>;
    modelClass: MC;
    reflectionName?: string;
};
export type QueryArgsType = {
    abilities?: Record<string, string[]>;
    accessibleBy?: string;
    count?: number;
    distinct?: string;
    groupBy?: string[];
    limit?: number;
    page?: number;
    params?: Record<string, any>;
    per?: number;
    preload?: string[];
    ransack?: Record<string, any>;
    search?: Record<string, any>;
    select?: Record<string, string[]>;
    selectColumns?: Record<string, string[]>;
};
import Result from "./result.js";
//# sourceMappingURL=collection.d.ts.map