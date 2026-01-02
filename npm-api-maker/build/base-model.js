import Attribute from "./base-model/attribute.js";
import AttributeNotLoadedError from "./attribute-not-loaded-error.js";
import CacheKeyGenerator from "./cache-key-generator.js";
import Collection from "./collection.js";
import CommandsPool from "./commands-pool.js";
import Config from "./config.js";
import CustomError from "./custom-error.js";
import { digg } from "diggerize";
import FormDataObjectizer from "form-data-objectizer";
import * as inflection from "inflection";
import ModelName from "./model-name.js";
import NotLoadedError from "./not-loaded-error.js";
import objectToFormData from "object-to-formdata";
import Reflection from "./base-model/reflection.js";
import Scope from "./base-model/scope.js";
import Services from "./services.js";
import ValidationError from "./validation-error.js";
import { ValidationErrors } from "./validation-errors.js";
/**
 * @typedef {object} ModelClassDataType
 * @property {import("./base-model/attribute.js").AttributeArgType[]} attributes
 * @property {string} collectionName
 * @property {string} name
 * @property {string} paramKey
 * @property {string} primaryKey
 * @property {object} ransackable_attributes
 */
/**
 * @typedef {object} ParseValidationErrorsOptions
 * @property {object} [form]
 * @property {boolean} [throwValidationError]
 */
function objectToUnderscore(object) {
    const newObject = {};
    for (const key in object) {
        const underscoreKey = inflection.underscore(key);
        newObject[underscoreKey] = object[key];
    }
    return newObject;
}
export default class BaseModel {
    static apiMakerType = "BaseModel";
    /** @returns {Attribute[]} */
    static attributes() {
        const attributes = this.modelClassData().attributes;
        const result = [];
        for (const attributeKey in attributes) {
            const attributeData = attributes[attributeKey];
            const attribute = new Attribute(attributeData);
            result.push(attribute);
        }
        return result;
    }
    /** @returns {boolean} */
    static hasAttribute(attributeName) {
        const attributes = digg(this.modelClassData(), "attributes");
        const lowerCaseAttributeName = inflection.underscore(attributeName);
        if (lowerCaseAttributeName in attributes)
            return true;
        return false;
    }
    /**
     * @interface
     * @returns {ModelClassDataType}
     */
    static modelClassData() {
        throw new Error("modelClassData should be overriden by child");
    }
    /**
     * @param {ValidationErrors} validationErrors
     * @returns {CustomEvent}
     */
    static newCustomEvent = (validationErrors) => {
        return new CustomEvent("validation-errors", { detail: validationErrors });
    };
    /**
     * @param {ValidationErrors} validationErrors
     * @param {object} [options]
     * @param {object} [options.form]
     * @param {boolean} [options.throwValidationError]
     */
    static sendValidationErrorsEvent(validationErrors, options) {
        if (options && options.form) {
            const event = BaseModel.newCustomEvent(validationErrors);
            options.form.dispatchEvent(event);
        }
    }
    /**
     * @template {typeof BaseModel} T
     * @this {T}
     * @param {number | string} id
     * @returns {Promise<InstanceType<T>>}
     */
    static async find(id) {
        /** @type {Record<string, any>} */
        const query = {};
        query[`${this.primaryKey()}_eq`] = id;
        const model = /** @type {InstanceType<T>} */ (await this.ransack(query).first());
        if (model) {
            return model;
        }
        else {
            throw new CustomError("Record not found");
        }
    }
    /**
     * @template {typeof BaseModel} T
     * @this {T}
     * @param {Record<string, any>} findOrCreateByArgs
     * @returns {Promise<InstanceType<T>>}
     */
    static async findOrCreateBy(findOrCreateByArgs, args = {}) {
        const result = await Services.current().sendRequest("Models::FindOrCreateBy", {
            additional_data: args.additionalData,
            find_or_create_by_args: findOrCreateByArgs,
            resource_name: digg(this.modelClassData(), "name")
        });
        const model = /** @type {InstanceType<T>} */ (digg(result, "model"));
        return model;
    }
    /** @returns {ModelName} */
    static modelName() {
        return new ModelName({ modelClassData: this.modelClassData() });
    }
    /** @returns {string} */
    static primaryKey() {
        return digg(this.modelClassData(), "primaryKey");
    }
    /**
     * @template {typeof BaseModel} MC
     * @this {MC}
     * @param {Record<string, any>} [query]
     * @returns {import("./collection.js").default<MC>}
     */
    static ransack(query = {}) {
        const ModelClass = /** @type {MC} */ (this);
        return new Collection({ modelClass: ModelClass }, { ransack: query });
    }
    /**
     * @template {typeof BaseModel} MC
     * @this {MC}
     * @param {Record<string, any>} [select]
     * @returns {import("./collection.js").default<MC>}
     */
    static select(select) {
        return this.ransack().select(select);
    }
    /** @returns {Reflection[]} */
    static ransackableAssociations() {
        const relationships = digg(this.modelClassData(), "ransackable_associations");
        const reflections = [];
        for (const relationshipData of relationships) {
            reflections.push(new Reflection(relationshipData));
        }
        return reflections;
    }
    /** @returns {Attribute[]} */
    static ransackableAttributes() {
        const attributes = this.modelClassData().ransackable_attributes;
        const result = [];
        for (const attributeData of attributes) {
            result.push(new Attribute(attributeData));
        }
        return result;
    }
    /** @returns {Scope[]} */
    static ransackableScopes() {
        const ransackableScopes = digg(this.modelClassData(), "ransackable_scopes");
        const result = [];
        for (const scopeData of ransackableScopes) {
            const scope = new Scope(scopeData);
            result.push(scope);
        }
        return result;
    }
    /** @returns {Reflection[]} */
    static reflections() {
        const relationships = digg(this.modelClassData(), "relationships");
        const reflections = [];
        for (const relationshipData of relationships) {
            const reflection = new Reflection(relationshipData);
            reflections.push(reflection);
        }
        return reflections;
    }
    /** @returns {Reflection} */
    static reflection(name) {
        const foundReflection = this.reflections().find((reflection) => reflection.name() == name);
        if (!foundReflection) {
            throw new Error(`No such reflection: ${name} in ${this.reflections().map((reflection) => reflection.name()).join(", ")}`);
        }
        return foundReflection;
    }
    /**
     * @returns {string}
     */
    static _token() {
        const csrfTokenElement = document.querySelector("meta[name='csrf-token']");
        if (csrfTokenElement) {
            return csrfTokenElement.getAttribute("content");
        }
    }
    constructor(args = {}) {
        this.changes = {};
        this.newRecord = args.isNewRecord;
        this.relationshipsCache = {};
        this.relationships = {};
        if (args && args.data && args.data.a) {
            this._readModelDataFromArgs(args);
        }
        else if (args.a) {
            this.abilities = args.b || {};
            this.modelData = objectToUnderscore(args.a);
        }
        else if (args) {
            this.abilities = {};
            this.modelData = objectToUnderscore(args);
        }
        else {
            this.abilities = {};
            this.modelData = {};
        }
    }
    /**
     * @param {Record<string, any>} newAttributes
     * @returns {void}
     */
    assignAttributes(newAttributes) {
        for (const key in newAttributes) {
            const newValue = newAttributes[key];
            const attributeUnderscore = inflection.underscore(key);
            let applyChange = true;
            let deleteChange = false;
            if (this.isAttributeLoaded(key)) {
                const oldValue = this.readAttribute(key);
                const originalValue = this.modelData[attributeUnderscore];
                if (newValue == oldValue) {
                    applyChange = false;
                }
                else if (newValue == originalValue) {
                    applyChange = false;
                    deleteChange = true;
                }
            }
            if (applyChange) {
                this.changes[attributeUnderscore] = newValue;
            }
            else if (deleteChange) {
                delete this.changes[attributeUnderscore];
            }
        }
    }
    /** @returns {Record<string, any>} */
    attributes() {
        const result = {};
        for (const key in this.modelData) {
            result[key] = this.modelData[key];
        }
        for (const key in this.changes) {
            result[key] = this.changes[key];
        }
        return result;
    }
    /**
     * @param {string} givenAbilityName
     * @returns {boolean}
     */
    can(givenAbilityName) {
        const abilityName = inflection.underscore(givenAbilityName);
        if (!(abilityName in this.abilities)) {
            throw new Error(`Ability ${abilityName} hasn't been loaded for ${digg(this.modelClassData(), "name")}`);
        }
        return this.abilities[abilityName];
    }
    /**
     * @template {BaseModel} Self
     * @this {Self}
     * @returns {Self}
     */
    clone() {
        const ModelClass = /** @type {new (...args: any[]) => Self} */ (this.constructor);
        const clone = new ModelClass();
        clone.abilities = { ...this.abilities };
        clone.modelData = { ...this.modelData };
        clone.relationships = { ...this.relationships };
        clone.relationshipsCache = { ...this.relationshipsCache };
        return clone;
    }
    /** @returns {number | string} */
    cacheKey() {
        if (this.isPersisted()) {
            const keyParts = [
                this.modelClassData().paramKey,
                this.primaryKey()
            ];
            if ("updated_at" in this.modelData) {
                // @ts-expect-error
                const updatedAt = this.updatedAt();
                if (typeof updatedAt != "object") {
                    throw new Error(`updatedAt wasn't an object: ${typeof updatedAt}`);
                }
                else if (!("getTime" in updatedAt)) {
                    throw new Error(`updatedAt didn't support getTime with class: ${updatedAt.constructor && updatedAt.constructor.name}`);
                }
                // @ts-expect-error
                keyParts.push(`updatedAt-${this.updatedAt().getTime()}`);
            }
            return keyParts.join("-");
        }
        else {
            return this.uniqueKey();
        }
    }
    /** @returns {string} */
    localCacheKey() {
        const cacheKeyGenerator = new CacheKeyGenerator(this);
        return cacheKeyGenerator.local();
    }
    /** @returns {string} */
    fullCacheKey() {
        const cacheKeyGenerator = new CacheKeyGenerator(this);
        return cacheKeyGenerator.cacheKey();
    }
    /**
     * @template {typeof BaseModel} MC
     * @this {MC}
     * @returns {Collection<MC>}
     */
    static all() {
        return this.ransack();
    }
    /**
     * @param {Record<string, any>} [attributes]
     * @param {object} [options]
     * @returns {Promise<{
     *   model: BaseModel,
     *   response: object
     * }>}
     */
    async create(attributes, options) {
        if (attributes)
            this.assignAttributes(attributes);
        const paramKey = this.modelClassData().paramKey;
        const modelData = this.getAttributes();
        const dataToUse = {};
        dataToUse[paramKey] = modelData;
        let response;
        try {
            response = await CommandsPool.addCommand({
                args: {
                    save: dataToUse
                },
                command: `${this.modelClassData().collectionName}-create`,
                collectionName: this.modelClassData().collectionName,
                primaryKey: this.primaryKey(),
                type: "create"
            }, {});
        }
        catch (error) {
            BaseModel.parseValidationErrors({ error, model: this, options });
            throw error;
        }
        if (response.model) {
            this._refreshModelFromResponse(response);
            this.changes = {};
        }
        return { model: this, response };
    }
    /**
     * @param {FormData | Record<string, any>} rawData
     * @param {object} [options]
     */
    async createRaw(rawData, options = {}) {
        const objectData = BaseModel._objectDataFromGivenRawData(rawData, options);
        let response;
        try {
            response = await CommandsPool.addCommand({
                args: {
                    save: objectData
                },
                command: `${this.modelClassData().collectionName}-create`,
                collectionName: this.modelClassData().collectionName,
                primaryKey: this.primaryKey(),
                type: "create"
            }, {});
        }
        catch (error) {
            BaseModel.parseValidationErrors({ error, model: this, options });
            throw error;
        }
        if (response.model) {
            this._refreshModelDataFromResponse(response);
            this.changes = {};
        }
        return { model: this, response };
    }
    /** @returns {Promise<{model: BaseModel, response: object}>} */
    async destroy() {
        const response = await CommandsPool.addCommand({
            args: { query_params: this.collection && this.collection.params() },
            command: `${this.modelClassData().collectionName}-destroy`,
            collectionName: this.modelClassData().collectionName,
            primaryKey: this.primaryKey(),
            type: "destroy"
        }, {});
        if (response.success) {
            if (response.model) {
                this._refreshModelDataFromResponse(response);
                this.changes = {};
            }
            return { model: this, response };
        }
        else {
            this.handleResponseError(response);
        }
    }
    async ensureAbilities(listOfAbilities) {
        // Populate an array with a list of abilities currently not loaded
        const abilitiesToLoad = [];
        for (const abilityInList of listOfAbilities) {
            if (!(abilityInList in this.abilities)) {
                abilitiesToLoad.push(abilityInList);
            }
        }
        // Load the missing abilities if any
        if (abilitiesToLoad.length > 0) {
            const primaryKeyName = this.modelClass().primaryKey();
            const ransackParams = {};
            ransackParams[`${primaryKeyName}_eq`] = this.primaryKey();
            const abilitiesParams = {};
            abilitiesParams[digg(this.modelClassData(), "name")] = abilitiesToLoad;
            const anotherModel = await this.modelClass()
                .ransack(ransackParams)
                .abilities(abilitiesParams)
                .first();
            if (!anotherModel) {
                throw new Error(`Could not look up the same model ${this.primaryKey()} with abilities: ${abilitiesToLoad.join(", ")}`);
            }
            const newAbilities = anotherModel.abilities;
            for (const newAbility in newAbilities) {
                this.abilities[newAbility] = newAbilities[newAbility];
            }
        }
    }
    /**
     * @returns {Record<string, any>}
     */
    getAttributes() { return Object.assign(this.modelData, this.changes); }
    asd;
    handleResponseError(response) {
        // @ts-expect-error
        BaseModel.parseValidationErrors({ model: this, response });
        throw new CustomError("Response wasn't successful", { model: this, response });
    }
    /**
     * @returns {number | string}
     */
    identifierKey() {
        if (!this._identifierKey)
            this._identifierKey = this.isPersisted() ? this.primaryKey() : this.uniqueKey();
        return this._identifierKey;
    }
    /**
     * @returns {boolean}
     */
    isAssociationLoaded(associationName) { return this.isAssociationLoadedUnderscore(inflection.underscore(associationName)); }
    /**
     * @returns {boolean}
     */
    isAssociationLoadedUnderscore(associationNameUnderscore) {
        if (associationNameUnderscore in this.relationshipsCache)
            return true;
        return false;
    }
    /**
     * @returns {boolean}
     */
    isAssociationPresent(associationName) {
        if (this.isAssociationLoaded(associationName))
            return true;
        if (associationName in this.relationships)
            return true;
        return false;
    }
    /**
     * @param {object} args
     * @param {any} args.error
     * @param {BaseModel} [args.model]
     * @param {ParseValidationErrorsOptions} args.options
     */
    static parseValidationErrors({ error, model, options }) {
        if (!(error instanceof ValidationError))
            return;
        if (!error.args.response.validation_errors)
            return;
        const validationErrors = new ValidationErrors({
            model,
            validationErrors: digg(error, "args", "response", "validation_errors")
        });
        BaseModel.sendValidationErrorsEvent(validationErrors, options);
        if (!options || options.throwValidationError != false) {
            throw error;
        }
    }
    static humanAttributeName(attributeName) {
        const keyName = digg(this.modelClassData(), "i18nKey");
        // @ts-expect-error
        const i18n = Config.getI18n();
        if (i18n)
            return i18n.t(`activerecord.attributes.${keyName}.${BaseModel.snakeCase(attributeName)}`, { defaultValue: attributeName });
        return inflection.humanize(attributeName);
    }
    /**
     * @param {string} attributeName
     * @returns {boolean}
     */
    isAttributeChanged(attributeName) {
        const attributeNameUnderscore = inflection.underscore(attributeName);
        const attributeData = this.modelClassData().attributes.find((attribute) => digg(attribute, "name") == attributeNameUnderscore);
        if (!attributeData) {
            const attributeNames = this.modelClassData().attributes.map((attribute) => digg(attribute, "name"));
            throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`);
        }
        if (!(attributeNameUnderscore in this.changes))
            return false;
        const oldValue = this.modelData[attributeNameUnderscore];
        const newValue = this.changes[attributeNameUnderscore];
        const changedMethod = this[`_is${inflection.camelize(attributeData.type, true)}Changed`];
        if (!changedMethod)
            throw new Error(`Don't know how to handle type: ${attributeData.type}`);
        return changedMethod(oldValue, newValue);
    }
    /**
     * @returns {boolean}
     */
    isChanged() {
        const keys = Object.keys(this.changes);
        if (keys.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * @returns {boolean}
     */
    isNewRecord() {
        if (this.newRecord !== undefined) {
            return this.newRecord;
        }
        else if ("id" in this.modelData && this.modelData.id) {
            return false;
        }
        else {
            return true;
        }
    }
    /**
     * @returns {boolean}
     */
    isPersisted() { return !this.isNewRecord(); }
    /**
     * @param {string} string
     * @returns {string}
     */
    static snakeCase(string) { return inflection.underscore(string); }
    /**
     * @param {string} attributeName
     * @returns {boolean}
     */
    savedChangeToAttribute(attributeName) {
        if (!this.previousModelData)
            return false;
        const attributeNameUnderscore = inflection.underscore(attributeName);
        const attributeData = this.modelClassData().attributes.find((attribute) => attribute.name == attributeNameUnderscore);
        if (!attributeData) {
            const attributeNames = this.modelClassData().attributes.map((attribute) => attribute.name);
            throw new Error(`Couldn't find an attribute by that name: "${attributeName}" in: ${attributeNames.join(", ")}`);
        }
        if (!(attributeNameUnderscore in this.previousModelData))
            return true;
        const oldValue = this.previousModelData[attributeNameUnderscore];
        const newValue = this.modelData[attributeNameUnderscore];
        const changedMethodName = `_is${inflection.camelize(attributeData.type)}Changed`;
        const changedMethod = this[changedMethodName];
        if (!changedMethod)
            throw new Error(`Don't know how to handle type: ${attributeData.type}`);
        return changedMethod(oldValue, newValue);
    }
    /**
     * @param {BaseModel} model
     * @returns {void}
     */
    setNewModel(model) {
        this.setNewModelData(model);
        for (const relationshipName in model.relationships) {
            this.relationships[relationshipName] = model.relationships[relationshipName];
        }
        for (const relationshipCacheName in model.relationshipsCache) {
            this.relationshipsCache[relationshipCacheName] = model.relationshipsCache[name];
        }
    }
    setNewModelData(model) {
        if (!("modelData" in model))
            throw new Error(`No modelData in model: ${JSON.stringify(model)}`);
        this.previousModelData = Object.assign({}, digg(this, "modelData"));
        for (const attributeName in model.modelData) {
            this.modelData[attributeName] = model.modelData[attributeName];
        }
    }
    _isDateChanged(oldValue, newValue) {
        if (Date.parse(oldValue) != Date.parse(newValue))
            return true;
    }
    _isIntegerChanged(oldValue, newValue) {
        if (parseInt(oldValue, 10) != parseInt(newValue, 10))
            return true;
    }
    _isStringChanged(oldValue, newValue) {
        const oldConvertedValue = `${oldValue}`;
        const newConvertedValue = `${newValue}`;
        if (oldConvertedValue != newConvertedValue)
            return true;
    }
    /** @returns {ModelClassDataType} */
    modelClassData() { return this.modelClass().modelClassData(); }
    /**
     * @returns {Promise<void>}
     */
    async reload() {
        const params = this.collection && this.collection.params();
        const ransackParams = {};
        ransackParams[`${this.modelClass().primaryKey()}_eq`] = this.primaryKey();
        let query = this.modelClass().ransack(ransackParams);
        if (params) {
            if (params.preload) {
                query.queryArgs.preload = params.preload;
            }
            if (params.select) {
                query.queryArgs.select = params.select;
            }
            if (params.select_columns) {
                query.queryArgs.selectColumns = params.select_columns;
            }
        }
        const model = await query.first();
        this.setNewModel(model);
        this.changes = {};
    }
    /**
     * @returns {Promise<{model: BaseModel, response?: object}>}
     */
    save() {
        if (this.isNewRecord()) {
            return this.create();
        }
        else {
            return this.update();
        }
    }
    /**
     * @returns {Promise<{model: BaseModel, response: object}>}
     */
    saveRaw(rawData, options = {}) {
        if (this.isNewRecord()) {
            return this.createRaw(rawData, options);
        }
        else {
            return this.updateRaw(rawData, options);
        }
    }
    /**
     * @param {Record<string, any>} [newAttributes]
     * @param {ParseValidationErrorsOptions} [options]
     * @returns {Promise<{
     *   model: BaseModel,
     *   response?: object
     * }>}
     */
    async update(newAttributes, options) {
        if (newAttributes) {
            this.assignAttributes(newAttributes);
        }
        if (Object.keys(this.changes).length == 0) {
            return { model: this };
        }
        const paramKey = this.modelClassData().paramKey;
        const modelData = this.changes;
        const dataToUse = {};
        dataToUse[paramKey] = modelData;
        let response;
        try {
            response = await CommandsPool.addCommand({
                args: {
                    query_params: this.collection && this.collection.params(),
                    save: dataToUse
                },
                command: `${this.modelClassData().collectionName}-update`,
                collectionName: this.modelClassData().collectionName,
                primaryKey: this.primaryKey(),
                type: "update"
            }, {});
        }
        catch (error) {
            BaseModel.parseValidationErrors({ error, model: this, options });
            throw error;
        }
        if (response.success) {
            if (response.model) {
                this._refreshModelFromResponse(response);
                this.changes = {};
            }
            return { response, model: this };
        }
        else {
            this.handleResponseError(response);
        }
    }
    _refreshModelFromResponse(response) {
        let newModel = digg(response, "model");
        if (Array.isArray(newModel))
            newModel = newModel[0];
        this.setNewModel(newModel);
    }
    _refreshModelDataFromResponse(response) {
        let newModel = digg(response, "model");
        if (Array.isArray(newModel))
            newModel = newModel[0];
        this.setNewModelData(newModel);
    }
    /**
     * @param {FormData | Record<string, any>} rawData
     * @param {object} options
     * @returns {Record<string, any>}
     */
    static _objectDataFromGivenRawData(rawData, options) {
        if (rawData instanceof FormData || rawData.nodeName == "FORM") {
            const formData = FormDataObjectizer.formDataFromObject(rawData, options);
            return FormDataObjectizer.toObject(formData);
        }
        return rawData;
    }
    async updateRaw(rawData, options = {}) {
        const objectData = BaseModel._objectDataFromGivenRawData(rawData, options);
        let response;
        try {
            response = await CommandsPool.addCommand({
                args: {
                    query_params: this.collection && this.collection.params(),
                    save: objectData,
                    simple_model_errors: options?.simpleModelErrors
                },
                command: `${this.modelClassData().collectionName}-update`,
                collectionName: this.modelClassData().collectionName,
                primaryKey: this.primaryKey(),
                type: "update"
            }, {});
        }
        catch (error) {
            BaseModel.parseValidationErrors({ error, model: this, options });
            throw error;
        }
        if (response.model) {
            this._refreshModelFromResponse(response);
            this.changes = {};
        }
        return { response, model: this };
    }
    isValid() {
        throw new Error("Not implemented yet");
    }
    async isValidOnServer() {
        const modelData = this.getAttributes();
        const paramKey = this.modelClassData().paramKey;
        const dataToUse = {};
        dataToUse[paramKey] = modelData;
        const response = await CommandsPool.addCommand({
            args: {
                save: dataToUse
            },
            command: `${this.modelClassData().collectionName}-valid`,
            collectionName: this.modelClassData().collectionName,
            primaryKey: this.primaryKey(),
            type: "valid"
        }, {});
        return { valid: response.valid, errors: response.errors };
    }
    /**
     * @template {BaseModel} Self
     * @this {Self}
     * @returns {typeof BaseModel & (new (...args: any[]) => Self)}
     */
    modelClass() {
        return /** @type {any} */ (this.constructor);
    }
    preloadRelationship(relationshipName, model) {
        this.relationshipsCache[BaseModel.snakeCase(relationshipName)] = model;
        this.relationships[BaseModel.snakeCase(relationshipName)] = model;
    }
    /**
     * @returns {void}
     */
    markForDestruction() {
        this._markedForDestruction = true;
    }
    /**
     * @returns {boolean}
     */
    markedForDestruction() { return this._markedForDestruction || false; }
    /**
     * @returns {number}
     */
    uniqueKey() {
        if (!this.uniqueKeyValue) {
            const min = 5000000000000000;
            const max = 9007199254740991;
            const randomBetween = Math.floor(Math.random() * (max - min + 1) + min);
            this.uniqueKeyValue = randomBetween;
        }
        return this.uniqueKeyValue;
    }
    static async _callCollectionCommand(args, commandArgs) {
        const formOrDataObject = args.args;
        try {
            return await CommandsPool.addCommand(args, commandArgs);
        }
        catch (error) {
            let form;
            if (commandArgs.form) {
                form = commandArgs.form;
            }
            else if (formOrDataObject?.nodeName == "FORM") {
                form = formOrDataObject;
            }
            if (form)
                BaseModel.parseValidationErrors({ error, options: { form } });
            throw error;
        }
    }
    _callMemberCommand = (args, commandArgs) => CommandsPool.addCommand(args, commandArgs);
    static _postDataFromArgs(args) {
        let postData;
        if (args) {
            if (args instanceof FormData) {
                postData = args;
            }
            else {
                postData = objectToFormData.serialize(args, {}, null, "args");
            }
        }
        else {
            postData = new FormData();
        }
        return postData;
    }
    /**
     * @param {string} attributeName
     * @returns {any}
     */
    readAttribute(attributeName) {
        const attributeNameUnderscore = inflection.underscore(attributeName);
        return this.readAttributeUnderscore(attributeNameUnderscore);
    }
    /**
     * @param {string} attributeName
     * @returns {any}
     */
    readAttributeUnderscore(attributeName) {
        if (attributeName in this.changes) {
            return this.changes[attributeName];
        }
        else if (attributeName in this.modelData) {
            return this.modelData[attributeName];
        }
        else if (this.isNewRecord()) {
            // Return null if this is a new record and the attribute name is a recognized attribute
            const attributes = digg(this.modelClassData(), "attributes");
            if (attributeName in attributes)
                return null;
        }
        if (this.isPersisted()) {
            throw new AttributeNotLoadedError(`No such attribute: ${digg(this.modelClassData(), "name")}#${attributeName}: ${JSON.stringify(this.modelData)}`);
        }
    }
    /**
     * @returns {boolean}
     */
    isAttributeLoaded(attributeName) {
        const attributeNameUnderscore = inflection.underscore(attributeName);
        if (attributeNameUnderscore in this.changes)
            return true;
        if (attributeNameUnderscore in this.modelData)
            return true;
        return false;
    }
    _isPresent(value) {
        if (!value) {
            return false;
        }
        else if (typeof value == "string" && value.match(/^\s*$/)) {
            return false;
        }
        return true;
    }
    async _loadBelongsToReflection(args, queryArgs = {}) {
        if (args.reflectionName in this.relationships) {
            return this.relationships[args.reflectionName];
        }
        else if (args.reflectionName in this.relationshipsCache) {
            return this.relationshipsCache[args.reflectionName];
        }
        else {
            const collection = new Collection(args, queryArgs);
            const model = await collection.first();
            this.relationshipsCache[args.reflectionName] = model;
            return model;
        }
    }
    _readBelongsToReflection({ reflectionName }) {
        if (reflectionName in this.relationships) {
            return this.relationships[reflectionName];
        }
        else if (reflectionName in this.relationshipsCache) {
            return this.relationshipsCache[reflectionName];
        }
        if (this.isNewRecord())
            return null;
        const loadedRelationships = Object.keys(this.relationshipsCache);
        const modelClassName = digg(this.modelClassData(), "name");
        throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`);
    }
    /**
     * @template {typeof import("./base-model.js").default} AssocMC
     * @param {import("./collection.js").CollectionArgsType<AssocMC>} args
     * @param {import("./collection.js").QueryArgsType} queryArgs
     * @returns {Promise<Array<InstanceType<AssocMC>>>}
     */
    async _loadHasManyReflection(args, queryArgs = {}) {
        if (args.reflectionName in this.relationships) {
            return this.relationships[args.reflectionName];
        }
        else if (args.reflectionName in this.relationshipsCache) {
            return this.relationshipsCache[args.reflectionName];
        }
        const collection = new Collection(args, queryArgs);
        const models = await collection.toArray();
        this.relationshipsCache[args.reflectionName] = models;
        return models;
    }
    /**
     * @template {typeof import("./base-model.js").default} AssocMC
     * @param {import("./collection.js").CollectionArgsType<AssocMC>} args
     * @param {import("./collection.js").QueryArgsType} queryArgs
     * @returns {Promise<InstanceType<AssocMC>>}
     */
    async _loadHasOneReflection(args, queryArgs = {}) {
        if (args.reflectionName in this.relationships) {
            return this.relationships[args.reflectionName];
        }
        else if (args.reflectionName in this.relationshipsCache) {
            return this.relationshipsCache[args.reflectionName];
        }
        else {
            const collection = new Collection(args, queryArgs);
            const model = await collection.first();
            this.relationshipsCache[args.reflectionName] = model;
            return model;
        }
    }
    _readHasOneReflection({ reflectionName }) {
        if (reflectionName in this.relationships) {
            return this.relationships[reflectionName];
        }
        else if (reflectionName in this.relationshipsCache) {
            return this.relationshipsCache[reflectionName];
        }
        if (this.isNewRecord()) {
            return null;
        }
        const loadedRelationships = Object.keys(this.relationshipsCache);
        const modelClassName = digg(this.modelClassData(), "name");
        throw new NotLoadedError(`${modelClassName}#${reflectionName} hasn't been loaded yet. Only these were loaded: ${loadedRelationships.join(", ")}`);
    }
    _readModelDataFromArgs(args) {
        this.abilities = args.data.b || {};
        this.collection = args.collection;
        this.modelData = objectToUnderscore(args.data.a);
        this.preloadedRelationships = args.data.r;
    }
    _readPreloadedRelationships(preloaded) {
        if (!this.preloadedRelationships) {
            return;
        }
        const relationships = digg(this.modelClassData(), "relationships");
        for (const relationshipName in this.preloadedRelationships) {
            const relationshipData = this.preloadedRelationships[relationshipName];
            const relationshipClassData = relationships.find((relationship) => digg(relationship, "name") == relationshipName);
            if (!relationshipClassData) {
                const modelName = digg(this.modelClassData(), "name");
                const relationshipsList = relationships.map((relationship) => relationship.name).join(", ");
                throw new Error(`Could not find the relation ${relationshipName} on the ${modelName} model: ${relationshipsList}`);
            }
            const relationshipType = digg(relationshipClassData, "collectionName");
            if (relationshipName in this.relationshipsCache) {
                throw new Error(`${relationshipName} has already been loaded`);
            }
            if (!relationshipClassData) {
                throw new Error(`No relationship on ${digg(this.modelClassData(), "name")} by that name: ${relationshipName}`);
            }
            if (!relationshipData) {
                this.relationshipsCache[relationshipName] = null;
                this.relationships[relationshipName] = null;
            }
            else if (Array.isArray(relationshipData)) {
                this.relationshipsCache[relationshipName] = [];
                this.relationships[relationshipName] = [];
                for (const relationshipId of relationshipData) {
                    const model = preloaded.getModel(relationshipType, relationshipId);
                    this.relationshipsCache[relationshipName].push(model);
                    this.relationships[relationshipName].push(model);
                }
            }
            else {
                const model = preloaded.getModel(relationshipType, relationshipData);
                this.relationshipsCache[relationshipName] = model;
                this.relationships[relationshipName] = model;
            }
        }
    }
    /**
     * @returns {number|string}
     */
    primaryKey() { return this.readAttributeUnderscore(this.modelClass().primaryKey()); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsiYmFzZS1tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLHVCQUF1QixNQUFNLGlDQUFpQyxDQUFBO0FBQ3JFLE9BQU8saUJBQWlCLE1BQU0sMEJBQTBCLENBQUE7QUFDeEQsT0FBTyxVQUFVLE1BQU0saUJBQWlCLENBQUE7QUFDeEMsT0FBTyxZQUFZLE1BQU0sb0JBQW9CLENBQUE7QUFDN0MsT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sV0FBVyxNQUFNLG1CQUFtQixDQUFBO0FBQzNDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxXQUFXLENBQUE7QUFDOUIsT0FBTyxrQkFBa0IsTUFBTSxzQkFBc0IsQ0FBQTtBQUNyRCxPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUN2QyxPQUFPLGNBQWMsTUFBTSx1QkFBdUIsQ0FBQTtBQUNsRCxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFBO0FBQ2pELE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sS0FBSyxNQUFNLHVCQUF1QixDQUFBO0FBQ3pDLE9BQU8sUUFBUSxNQUFNLGVBQWUsQ0FBQTtBQUNwQyxPQUFPLGVBQWUsTUFBTSx1QkFBdUIsQ0FBQTtBQUNuRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQTtBQUV2RDs7Ozs7Ozs7R0FRRztBQUVIOzs7O0dBSUc7QUFFSCxTQUFTLGtCQUFrQixDQUFDLE1BQU07SUFDaEMsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRXBCLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDekIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxH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Q0FBQTtZQUM3QyxDQUFDO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFDOUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFFekMsS0FBSyxNQUFNLGNBQWMsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO29CQUM5QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFBO29CQUVsRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JELElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ2xELENBQUM7WUFDSCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUVwRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxLQUFLLENBQUE7Z0JBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxLQUFLLENBQUE7WUFDOUMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVLEtBQUssT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF0dHJpYnV0ZSBmcm9tIFwiLi9iYXNlLW1vZGVsL2F0dHJpYnV0ZS5qc1wiXG5pbXBvcnQgQXR0cmlidXRlTm90TG9hZGVkRXJyb3IgZnJvbSBcIi4vYXR0cmlidXRlLW5vdC1sb2FkZWQtZXJyb3IuanNcIlxuaW1wb3J0IENhY2hlS2V5R2VuZXJhdG9yIGZyb20gXCIuL2NhY2hlLWtleS1nZW5lcmF0b3IuanNcIlxuaW1wb3J0IENvbGxlY3Rpb24gZnJvbSBcIi4vY29sbGVjdGlvbi5qc1wiXG5pbXBvcnQgQ29tbWFuZHNQb29sIGZyb20gXCIuL2NvbW1hbmRzLXBvb2wuanNcIlxuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWcuanNcIlxuaW1wb3J0IEN1c3RvbUVycm9yIGZyb20gXCIuL2N1c3RvbS1lcnJvci5qc1wiXG5pbXBvcnQge2RpZ2d9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0IEZvcm1EYXRhT2JqZWN0aXplciBmcm9tIFwiZm9ybS1kYXRhLW9iamVjdGl6ZXJcIlxuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQgTW9kZWxOYW1lIGZyb20gXCIuL21vZGVsLW5hbWUuanNcIlxuaW1wb3J0IE5vdExvYWRlZEVycm9yIGZyb20gXCIuL25vdC1sb2FkZWQtZXJyb3IuanNcIlxuaW1wb3J0IG9iamVjdFRvRm9ybURhdGEgZnJvbSBcIm9iamVjdC10by1mb3JtZGF0YVwiXG5pbXBvcnQgUmVmbGVjdGlvbiBmcm9tIFwiLi9iYXNlLW1vZGVsL3JlZmxlY3Rpb24uanNcIlxuaW1wb3J0IFNjb3BlIGZyb20gXCIuL2Jhc2UtbW9kZWwvc2NvcGUuanNcIlxuaW1wb3J0IFNlcnZpY2VzIGZyb20gXCIuL3NlcnZpY2VzLmpzXCJcbmltcG9ydCBWYWxpZGF0aW9uRXJyb3IgZnJvbSBcIi4vdmFsaWRhdGlvbi1lcnJvci5qc1wiXG5pbXBvcnQge1ZhbGlkYXRpb25FcnJvcnN9IGZyb20gXCIuL3ZhbGlkYXRpb24tZXJyb3JzLmpzXCJcblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBNb2RlbENsYXNzRGF0YVR5cGVcbiAqIEBwcm9wZXJ0eSB7aW1wb3J0KFwiLi9iYXNlLW1vZGVsL2F0dHJpYnV0ZS5qc1wiKS5BdHRyaWJ1dGVBcmdUeXBlW119IGF0dHJpYnV0ZXNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjb2xsZWN0aW9uTmFtZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWVcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwYXJhbUtleVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByaW1hcnlLZXlcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSByYW5zYWNrYWJsZV9hdHRyaWJ1dGVzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBQYXJzZVZhbGlkYXRpb25FcnJvcnNPcHRpb25zXG4gKiBAcHJvcGVydHkge29iamVjdH0gW2Zvcm1dXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFt0aHJvd1ZhbGlkYXRpb25FcnJvcl1cbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RUb1VuZGVyc2NvcmUob2JqZWN0KSB7XG4gIGNvbnN0IG5ld09iamVjdCA9IHt9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgY29uc3QgdW5kZXJzY29yZUtleSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShrZXkpXG5cbiAgICBuZXdPYmplY3RbdW5kZXJzY29yZUtleV0gPSBvYmplY3Rba2V5XVxuICB9XG5cbiAgcmV0dXJuIG5ld09iamVjdFxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlTW9kZWwge1xuICBzdGF0aWMgYXBpTWFrZXJUeXBlID0gXCJCYXNlTW9kZWxcIlxuXG4gIC8qKiBAcmV0dXJucyB7QXR0cmlidXRlW119ICovXG4gIHN0YXRpYyBhdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuYXR0cmlidXRlc1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZUtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRyaWJ1dGVEYXRhID0gYXR0cmlidXRlc1thdHRyaWJ1dGVLZXldXG4gICAgICBjb25zdCBhdHRyaWJ1dGUgPSBuZXcgQXR0cmlidXRlKGF0dHJpYnV0ZURhdGEpXG5cbiAgICAgIHJlc3VsdC5wdXNoKGF0dHJpYnV0ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKiogQHJldHVybnMge2Jvb2xlYW59ICovXG4gIHN0YXRpYyBoYXNBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBkaWdnKHRoaXMubW9kZWxDbGFzc0RhdGEoKSwgXCJhdHRyaWJ1dGVzXCIpXG4gICAgY29uc3QgbG93ZXJDYXNlQXR0cmlidXRlTmFtZSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShhdHRyaWJ1dGVOYW1lKVxuXG4gICAgaWYgKGxvd2VyQ2FzZUF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcmZhY2VcbiAgICogQHJldHVybnMge01vZGVsQ2xhc3NEYXRhVHlwZX1cbiAgICovXG4gIHN0YXRpYyBtb2RlbENsYXNzRGF0YSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJtb2RlbENsYXNzRGF0YSBzaG91bGQgYmUgb3ZlcnJpZGVuIGJ5IGNoaWxkXCIpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtWYWxpZGF0aW9uRXJyb3JzfSB2YWxpZGF0aW9uRXJyb3JzXG4gICAqIEByZXR1cm5zIHtDdXN0b21FdmVudH1cbiAgICovXG4gIHN0YXRpYyBuZXdDdXN0b21FdmVudCA9ICh2YWxpZGF0aW9uRXJyb3JzKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudChcInZhbGlkYXRpb24tZXJyb3JzXCIsIHtkZXRhaWw6IHZhbGlkYXRpb25FcnJvcnN9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VmFsaWRhdGlvbkVycm9yc30gdmFsaWRhdGlvbkVycm9yc1xuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5mb3JtXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRocm93VmFsaWRhdGlvbkVycm9yXVxuICAgKi9cbiAgc3RhdGljIHNlbmRWYWxpZGF0aW9uRXJyb3JzRXZlbnQodmFsaWRhdGlvbkVycm9ycywgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZm9ybSkge1xuICAgICAgY29uc3QgZXZlbnQgPSBCYXNlTW9kZWwubmV3Q3VzdG9tRXZlbnQodmFsaWRhdGlvbkVycm9ycylcbiAgICAgIG9wdGlvbnMuZm9ybS5kaXNwYXRjaEV2ZW50KGV2ZW50KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge3R5cGVvZiBCYXNlTW9kZWx9IFRcbiAgICogQHRoaXMge1R9XG4gICAqIEBwYXJhbSB7bnVtYmVyIHwgc3RyaW5nfSBpZFxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJbnN0YW5jZVR5cGU8VD4+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGZpbmQoaWQpIHtcbiAgICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIGFueT59ICovXG4gICAgY29uc3QgcXVlcnkgPSB7fVxuXG4gICAgcXVlcnlbYCR7dGhpcy5wcmltYXJ5S2V5KCl9X2VxYF0gPSBpZFxuXG4gICAgY29uc3QgbW9kZWwgPSAvKiogQHR5cGUge0luc3RhbmNlVHlwZTxUPn0gKi8gKGF3YWl0IHRoaXMucmFuc2FjayhxdWVyeSkuZmlyc3QoKSlcblxuICAgIGlmIChtb2RlbCkge1xuICAgICAgcmV0dXJuIG1vZGVsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBDdXN0b21FcnJvcihcIlJlY29yZCBub3QgZm91bmRcIilcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHRlbXBsYXRlIHt0eXBlb2YgQmFzZU1vZGVsfSBUXG4gICAqIEB0aGlzIHtUfVxuICAgKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT59IGZpbmRPckNyZWF0ZUJ5QXJnc1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJbnN0YW5jZVR5cGU8VD4+fVxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGZpbmRPckNyZWF0ZUJ5KGZpbmRPckNyZWF0ZUJ5QXJncywgYXJncyA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgU2VydmljZXMuY3VycmVudCgpLnNlbmRSZXF1ZXN0KFwiTW9kZWxzOjpGaW5kT3JDcmVhdGVCeVwiLCB7XG4gICAgICBhZGRpdGlvbmFsX2RhdGE6IGFyZ3MuYWRkaXRpb25hbERhdGEsXG4gICAgICBmaW5kX29yX2NyZWF0ZV9ieV9hcmdzOiBmaW5kT3JDcmVhdGVCeUFyZ3MsXG4gICAgICByZXNvdXJjZV9uYW1lOiBkaWdnKHRoaXMubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG4gICAgfSlcbiAgICBjb25zdCBtb2RlbCA9IC8qKiBAdHlwZSB7SW5zdGFuY2VUeXBlPFQ+fSAqLyAoZGlnZyhyZXN1bHQsIFwibW9kZWxcIikpXG5cbiAgICByZXR1cm4gbW9kZWxcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7TW9kZWxOYW1lfSAqL1xuICBzdGF0aWMgbW9kZWxOYW1lKCkge1xuICAgIHJldHVybiBuZXcgTW9kZWxOYW1lKHttb2RlbENsYXNzRGF0YTogdGhpcy5tb2RlbENsYXNzRGF0YSgpfSlcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuICBzdGF0aWMgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwicHJpbWFyeUtleVwiKVxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSB7dHlwZW9mIEJhc2VNb2RlbH0gTUNcbiAgICogQHRoaXMge01DfVxuICAgKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT59IFtxdWVyeV1cbiAgICogQHJldHVybnMge2ltcG9ydChcIi4vY29sbGVjdGlvbi5qc1wiKS5kZWZhdWx0PE1DPn1cbiAgICovXG4gIHN0YXRpYyByYW5zYWNrKHF1ZXJ5ID0ge30pIHtcbiAgICBjb25zdCBNb2RlbENsYXNzID0gLyoqIEB0eXBlIHtNQ30gKi8gKHRoaXMpXG5cbiAgICByZXR1cm4gbmV3IENvbGxlY3Rpb24oe21vZGVsQ2xhc3M6IE1vZGVsQ2xhc3N9LCB7cmFuc2FjazogcXVlcnl9KVxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSB7dHlwZW9mIEJhc2VNb2RlbH0gTUNcbiAgICogQHRoaXMge01DfVxuICAgKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT59IFtzZWxlY3RdXG4gICAqIEByZXR1cm5zIHtpbXBvcnQoXCIuL2NvbGxlY3Rpb24uanNcIikuZGVmYXVsdDxNQz59XG4gICAqL1xuICBzdGF0aWMgc2VsZWN0KHNlbGVjdCkge1xuICAgIHJldHVybiB0aGlzLnJhbnNhY2soKS5zZWxlY3Qoc2VsZWN0KVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtSZWZsZWN0aW9uW119ICovXG4gIHN0YXRpYyByYW5zYWNrYWJsZUFzc29jaWF0aW9ucygpIHtcbiAgICBjb25zdCByZWxhdGlvbnNoaXBzID0gZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwicmFuc2Fja2FibGVfYXNzb2NpYXRpb25zXCIpXG4gICAgY29uc3QgcmVmbGVjdGlvbnMgPSBbXVxuXG4gICAgZm9yIChjb25zdCByZWxhdGlvbnNoaXBEYXRhIG9mIHJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJlZmxlY3Rpb25zLnB1c2gobmV3IFJlZmxlY3Rpb24ocmVsYXRpb25zaGlwRGF0YSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZmxlY3Rpb25zXG4gIH1cblxuICAvKiogQHJldHVybnMge0F0dHJpYnV0ZVtdfSAqL1xuICBzdGF0aWMgcmFuc2Fja2FibGVBdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkucmFuc2Fja2FibGVfYXR0cmlidXRlc1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZURhdGEgb2YgYXR0cmlidXRlcykge1xuICAgICAgcmVzdWx0LnB1c2gobmV3IEF0dHJpYnV0ZShhdHRyaWJ1dGVEYXRhKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKiogQHJldHVybnMge1Njb3BlW119ICovXG4gIHN0YXRpYyByYW5zYWNrYWJsZVNjb3BlcygpIHtcbiAgICBjb25zdCByYW5zYWNrYWJsZVNjb3BlcyA9IGRpZ2codGhpcy5tb2RlbENsYXNzRGF0YSgpLCBcInJhbnNhY2thYmxlX3Njb3Blc1wiKVxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHNjb3BlRGF0YSBvZiByYW5zYWNrYWJsZVNjb3Blcykge1xuICAgICAgY29uc3Qgc2NvcGUgPSBuZXcgU2NvcGUoc2NvcGVEYXRhKVxuXG4gICAgICByZXN1bHQucHVzaChzY29wZSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKiogQHJldHVybnMge1JlZmxlY3Rpb25bXX0gKi9cbiAgc3RhdGljIHJlZmxlY3Rpb25zKCkge1xuICAgIGNvbnN0IHJlbGF0aW9uc2hpcHMgPSBkaWdnKHRoaXMubW9kZWxDbGFzc0RhdGEoKSwgXCJyZWxhdGlvbnNoaXBzXCIpXG4gICAgY29uc3QgcmVmbGVjdGlvbnMgPSBbXVxuXG4gICAgZm9yIChjb25zdCByZWxhdGlvbnNoaXBEYXRhIG9mIHJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIGNvbnN0IHJlZmxlY3Rpb24gPSBuZXcgUmVmbGVjdGlvbihyZWxhdGlvbnNoaXBEYXRhKVxuXG4gICAgICByZWZsZWN0aW9ucy5wdXNoKHJlZmxlY3Rpb24pXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZmxlY3Rpb25zXG4gIH1cblxuICAvKiogQHJldHVybnMge1JlZmxlY3Rpb259ICovXG4gIHN0YXRpYyByZWZsZWN0aW9uKG5hbWUpIHtcbiAgICBjb25zdCBmb3VuZFJlZmxlY3Rpb24gPSB0aGlzLnJlZmxlY3Rpb25zKCkuZmluZCgocmVmbGVjdGlvbikgPT4gcmVmbGVjdGlvbi5uYW1lKCkgPT0gbmFtZSlcblxuICAgIGlmICghZm91bmRSZWZsZWN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggcmVmbGVjdGlvbjogJHtuYW1lfSBpbiAke3RoaXMucmVmbGVjdGlvbnMoKS5tYXAoKHJlZmxlY3Rpb24pID0+IHJlZmxlY3Rpb24ubmFtZSgpKS5qb2luKFwiLCBcIil9YClcbiAgICB9XG5cbiAgICByZXR1cm4gZm91bmRSZWZsZWN0aW9uXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBfdG9rZW4oKSB7XG4gICAgY29uc3QgY3NyZlRva2VuRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJtZXRhW25hbWU9J2NzcmYtdG9rZW4nXVwiKVxuXG4gICAgaWYgKGNzcmZUb2tlbkVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBjc3JmVG9rZW5FbGVtZW50LmdldEF0dHJpYnV0ZShcImNvbnRlbnRcIilcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihhcmdzID0ge30pIHtcbiAgICB0aGlzLmNoYW5nZXMgPSB7fVxuICAgIHRoaXMubmV3UmVjb3JkID0gYXJncy5pc05ld1JlY29yZFxuICAgIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlID0ge31cbiAgICB0aGlzLnJlbGF0aW9uc2hpcHMgPSB7fVxuXG4gICAgaWYgKGFyZ3MgJiYgYXJncy5kYXRhICYmIGFyZ3MuZGF0YS5hKSB7XG4gICAgICB0aGlzLl9yZWFkTW9kZWxEYXRhRnJvbUFyZ3MoYXJncylcbiAgICB9IGVsc2UgaWYgKGFyZ3MuYSkge1xuICAgICAgdGhpcy5hYmlsaXRpZXMgPSBhcmdzLmIgfHwge31cbiAgICAgIHRoaXMubW9kZWxEYXRhID0gb2JqZWN0VG9VbmRlcnNjb3JlKGFyZ3MuYSlcbiAgICB9IGVsc2UgaWYgKGFyZ3MpIHtcbiAgICAgIHRoaXMuYWJpbGl0aWVzID0ge31cbiAgICAgIHRoaXMubW9kZWxEYXRhID0gb2JqZWN0VG9VbmRlcnNjb3JlKGFyZ3MpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWJpbGl0aWVzID0ge31cbiAgICAgIHRoaXMubW9kZWxEYXRhID0ge31cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBuZXdBdHRyaWJ1dGVzXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgYXNzaWduQXR0cmlidXRlcyhuZXdBdHRyaWJ1dGVzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gbmV3QXR0cmlidXRlcykge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBuZXdBdHRyaWJ1dGVzW2tleV1cbiAgICAgIGNvbnN0IGF0dHJpYnV0ZVVuZGVyc2NvcmUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoa2V5KVxuXG4gICAgICBsZXQgYXBwbHlDaGFuZ2UgPSB0cnVlXG4gICAgICBsZXQgZGVsZXRlQ2hhbmdlID0gZmFsc2VcblxuICAgICAgaWYgKHRoaXMuaXNBdHRyaWJ1dGVMb2FkZWQoa2V5KSkge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMucmVhZEF0dHJpYnV0ZShrZXkpXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVmFsdWUgPSB0aGlzLm1vZGVsRGF0YVthdHRyaWJ1dGVVbmRlcnNjb3JlXVxuXG4gICAgICAgIGlmIChuZXdWYWx1ZSA9PSBvbGRWYWx1ZSkge1xuICAgICAgICAgIGFwcGx5Q2hhbmdlID0gZmFsc2VcbiAgICAgICAgfSBlbHNlIGlmIChuZXdWYWx1ZSA9PSBvcmlnaW5hbFZhbHVlKSB7XG4gICAgICAgICAgYXBwbHlDaGFuZ2UgPSBmYWxzZVxuICAgICAgICAgIGRlbGV0ZUNoYW5nZSA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYXBwbHlDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VzW2F0dHJpYnV0ZVVuZGVyc2NvcmVdID0gbmV3VmFsdWVcbiAgICAgIH0gZWxzZSBpZiAoZGVsZXRlQ2hhbmdlKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNoYW5nZXNbYXR0cmlidXRlVW5kZXJzY29yZV1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogQHJldHVybnMge1JlY29yZDxzdHJpbmcsIGFueT59ICovXG4gIGF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge31cblxuICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMubW9kZWxEYXRhKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHRoaXMubW9kZWxEYXRhW2tleV1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmNoYW5nZXMpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdGhpcy5jaGFuZ2VzW2tleV1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGdpdmVuQWJpbGl0eU5hbWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBjYW4oZ2l2ZW5BYmlsaXR5TmFtZSkge1xuICAgIGNvbnN0IGFiaWxpdHlOYW1lID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKGdpdmVuQWJpbGl0eU5hbWUpXG5cbiAgICBpZiAoIShhYmlsaXR5TmFtZSBpbiB0aGlzLmFiaWxpdGllcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQWJpbGl0eSAke2FiaWxpdHlOYW1lfSBoYXNuJ3QgYmVlbiBsb2FkZWQgZm9yICR7ZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwibmFtZVwiKX1gKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFiaWxpdGllc1thYmlsaXR5TmFtZV1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge0Jhc2VNb2RlbH0gU2VsZlxuICAgKiBAdGhpcyB7U2VsZn1cbiAgICogQHJldHVybnMge1NlbGZ9XG4gICAqL1xuICBjbG9uZSgpIHtcbiAgICBjb25zdCBNb2RlbENsYXNzID0gLyoqIEB0eXBlIHtuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBTZWxmfSAqLyAodGhpcy5jb25zdHJ1Y3RvcilcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBNb2RlbENsYXNzKClcblxuICAgIGNsb25lLmFiaWxpdGllcyA9IHsuLi50aGlzLmFiaWxpdGllc31cbiAgICBjbG9uZS5tb2RlbERhdGEgPSB7Li4udGhpcy5tb2RlbERhdGF9XG4gICAgY2xvbmUucmVsYXRpb25zaGlwcyA9IHsuLi50aGlzLnJlbGF0aW9uc2hpcHN9XG4gICAgY2xvbmUucmVsYXRpb25zaGlwc0NhY2hlID0gey4uLnRoaXMucmVsYXRpb25zaGlwc0NhY2hlfVxuXG4gICAgcmV0dXJuIGNsb25lXG4gIH1cblxuICAvKiogQHJldHVybnMge251bWJlciB8IHN0cmluZ30gKi9cbiAgY2FjaGVLZXkoKSB7XG4gICAgaWYgKHRoaXMuaXNQZXJzaXN0ZWQoKSkge1xuICAgICAgY29uc3Qga2V5UGFydHMgPSBbXG4gICAgICAgIHRoaXMubW9kZWxDbGFzc0RhdGEoKS5wYXJhbUtleSxcbiAgICAgICAgdGhpcy5wcmltYXJ5S2V5KClcbiAgICAgIF1cblxuICAgICAgaWYgKFwidXBkYXRlZF9hdFwiIGluIHRoaXMubW9kZWxEYXRhKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgY29uc3QgdXBkYXRlZEF0ID0gdGhpcy51cGRhdGVkQXQoKVxuXG4gICAgICAgIGlmICh0eXBlb2YgdXBkYXRlZEF0ICE9IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVwZGF0ZWRBdCB3YXNuJ3QgYW4gb2JqZWN0OiAke3R5cGVvZiB1cGRhdGVkQXR9YClcbiAgICAgICAgfSBlbHNlIGlmICghKFwiZ2V0VGltZVwiIGluIHVwZGF0ZWRBdCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVwZGF0ZWRBdCBkaWRuJ3Qgc3VwcG9ydCBnZXRUaW1lIHdpdGggY2xhc3M6ICR7dXBkYXRlZEF0LmNvbnN0cnVjdG9yICYmIHVwZGF0ZWRBdC5jb25zdHJ1Y3Rvci5uYW1lfWApXG4gICAgICAgIH1cblxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGtleVBhcnRzLnB1c2goYHVwZGF0ZWRBdC0ke3RoaXMudXBkYXRlZEF0KCkuZ2V0VGltZSgpfWApXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBrZXlQYXJ0cy5qb2luKFwiLVwiKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy51bmlxdWVLZXkoKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuICBsb2NhbENhY2hlS2V5KCkge1xuICAgIGNvbnN0IGNhY2hlS2V5R2VuZXJhdG9yID0gbmV3IENhY2hlS2V5R2VuZXJhdG9yKHRoaXMpXG5cbiAgICByZXR1cm4gY2FjaGVLZXlHZW5lcmF0b3IubG9jYWwoKVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtzdHJpbmd9ICovXG4gIGZ1bGxDYWNoZUtleSgpIHtcbiAgICBjb25zdCBjYWNoZUtleUdlbmVyYXRvciA9IG5ldyBDYWNoZUtleUdlbmVyYXRvcih0aGlzKVxuXG4gICAgcmV0dXJuIGNhY2hlS2V5R2VuZXJhdG9yLmNhY2hlS2V5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge3R5cGVvZiBCYXNlTW9kZWx9IE1DXG4gICAqIEB0aGlzIHtNQ31cbiAgICogQHJldHVybnMge0NvbGxlY3Rpb248TUM+fVxuICAgKi9cbiAgc3RhdGljIGFsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5yYW5zYWNrKClcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1JlY29yZDxzdHJpbmcsIGFueT59IFthdHRyaWJ1dGVzXVxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHtcbiAgICogICBtb2RlbDogQmFzZU1vZGVsLFxuICAgKiAgIHJlc3BvbnNlOiBvYmplY3RcbiAgICogfT59XG4gICAqL1xuICBhc3luYyBjcmVhdGUoYXR0cmlidXRlcywgb3B0aW9ucykge1xuICAgIGlmIChhdHRyaWJ1dGVzKSB0aGlzLmFzc2lnbkF0dHJpYnV0ZXMoYXR0cmlidXRlcylcbiAgICBjb25zdCBwYXJhbUtleSA9IHRoaXMubW9kZWxDbGFzc0RhdGEoKS5wYXJhbUtleVxuICAgIGNvbnN0IG1vZGVsRGF0YSA9IHRoaXMuZ2V0QXR0cmlidXRlcygpXG4gICAgY29uc3QgZGF0YVRvVXNlID0ge31cbiAgICBkYXRhVG9Vc2VbcGFyYW1LZXldID0gbW9kZWxEYXRhXG4gICAgbGV0IHJlc3BvbnNlXG5cbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBDb21tYW5kc1Bvb2wuYWRkQ29tbWFuZChcbiAgICAgICAge1xuICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgIHNhdmU6IGRhdGFUb1VzZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29tbWFuZDogYCR7dGhpcy5tb2RlbENsYXNzRGF0YSgpLmNvbGxlY3Rpb25OYW1lfS1jcmVhdGVgLFxuICAgICAgICAgIGNvbGxlY3Rpb25OYW1lOiB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgcHJpbWFyeUtleTogdGhpcy5wcmltYXJ5S2V5KCksXG4gICAgICAgICAgdHlwZTogXCJjcmVhdGVcIlxuICAgICAgICB9LFxuICAgICAgICB7fVxuICAgICAgKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBCYXNlTW9kZWwucGFyc2VWYWxpZGF0aW9uRXJyb3JzKHtlcnJvciwgbW9kZWw6IHRoaXMsIG9wdGlvbnN9KVxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UubW9kZWwpIHtcbiAgICAgIHRoaXMuX3JlZnJlc2hNb2RlbEZyb21SZXNwb25zZShyZXNwb25zZSlcbiAgICAgIHRoaXMuY2hhbmdlcyA9IHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIHttb2RlbDogdGhpcywgcmVzcG9uc2V9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtGb3JtRGF0YSB8IFJlY29yZDxzdHJpbmcsIGFueT59IHJhd0RhdGFcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgYXN5bmMgY3JlYXRlUmF3KHJhd0RhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9iamVjdERhdGEgPSBCYXNlTW9kZWwuX29iamVjdERhdGFGcm9tR2l2ZW5SYXdEYXRhKHJhd0RhdGEsIG9wdGlvbnMpXG5cbiAgICBsZXQgcmVzcG9uc2VcblxuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IENvbW1hbmRzUG9vbC5hZGRDb21tYW5kKFxuICAgICAgICB7XG4gICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgc2F2ZTogb2JqZWN0RGF0YVxuICAgICAgICAgIH0sXG4gICAgICAgICAgY29tbWFuZDogYCR7dGhpcy5tb2RlbENsYXNzRGF0YSgpLmNvbGxlY3Rpb25OYW1lfS1jcmVhdGVgLFxuICAgICAgICAgIGNvbGxlY3Rpb25OYW1lOiB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgcHJpbWFyeUtleTogdGhpcy5wcmltYXJ5S2V5KCksXG4gICAgICAgICAgdHlwZTogXCJjcmVhdGVcIlxuICAgICAgICB9LFxuICAgICAgICB7fVxuICAgICAgKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBCYXNlTW9kZWwucGFyc2VWYWxpZGF0aW9uRXJyb3JzKHtlcnJvciwgbW9kZWw6IHRoaXMsIG9wdGlvbnN9KVxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UubW9kZWwpIHtcbiAgICAgIHRoaXMuX3JlZnJlc2hNb2RlbERhdGFGcm9tUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB0aGlzLmNoYW5nZXMgPSB7fVxuICAgIH1cblxuICAgIHJldHVybiB7bW9kZWw6IHRoaXMsIHJlc3BvbnNlfVxuICB9XG5cbiAgLyoqIEByZXR1cm5zIHtQcm9taXNlPHttb2RlbDogQmFzZU1vZGVsLCByZXNwb25zZTogb2JqZWN0fT59ICovXG4gIGFzeW5jIGRlc3Ryb3koKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDb21tYW5kc1Bvb2wuYWRkQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgYXJnczoge3F1ZXJ5X3BhcmFtczogdGhpcy5jb2xsZWN0aW9uICYmIHRoaXMuY29sbGVjdGlvbi5wYXJhbXMoKX0sXG4gICAgICAgIGNvbW1hbmQ6IGAke3RoaXMubW9kZWxDbGFzc0RhdGEoKS5jb2xsZWN0aW9uTmFtZX0tZGVzdHJveWAsXG4gICAgICAgIGNvbGxlY3Rpb25OYW1lOiB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIHByaW1hcnlLZXk6IHRoaXMucHJpbWFyeUtleSgpLFxuICAgICAgICB0eXBlOiBcImRlc3Ryb3lcIlxuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKVxuXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgIGlmIChyZXNwb25zZS5tb2RlbCkge1xuICAgICAgICB0aGlzLl9yZWZyZXNoTW9kZWxEYXRhRnJvbVJlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgICB0aGlzLmNoYW5nZXMgPSB7fVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge21vZGVsOiB0aGlzLCByZXNwb25zZX1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oYW5kbGVSZXNwb25zZUVycm9yKHJlc3BvbnNlKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGVuc3VyZUFiaWxpdGllcyhsaXN0T2ZBYmlsaXRpZXMpIHtcbiAgICAvLyBQb3B1bGF0ZSBhbiBhcnJheSB3aXRoIGEgbGlzdCBvZiBhYmlsaXRpZXMgY3VycmVudGx5IG5vdCBsb2FkZWRcbiAgICBjb25zdCBhYmlsaXRpZXNUb0xvYWQgPSBbXVxuXG4gICAgZm9yIChjb25zdCBhYmlsaXR5SW5MaXN0IG9mIGxpc3RPZkFiaWxpdGllcykge1xuICAgICAgaWYgKCEoYWJpbGl0eUluTGlzdCBpbiB0aGlzLmFiaWxpdGllcykpIHtcbiAgICAgICAgYWJpbGl0aWVzVG9Mb2FkLnB1c2goYWJpbGl0eUluTGlzdClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb2FkIHRoZSBtaXNzaW5nIGFiaWxpdGllcyBpZiBhbnlcbiAgICBpZiAoYWJpbGl0aWVzVG9Mb2FkLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHByaW1hcnlLZXlOYW1lID0gdGhpcy5tb2RlbENsYXNzKCkucHJpbWFyeUtleSgpXG4gICAgICBjb25zdCByYW5zYWNrUGFyYW1zID0ge31cbiAgICAgIHJhbnNhY2tQYXJhbXNbYCR7cHJpbWFyeUtleU5hbWV9X2VxYF0gPSB0aGlzLnByaW1hcnlLZXkoKVxuXG4gICAgICBjb25zdCBhYmlsaXRpZXNQYXJhbXMgPSB7fVxuICAgICAgYWJpbGl0aWVzUGFyYW1zW2RpZ2codGhpcy5tb2RlbENsYXNzRGF0YSgpLCBcIm5hbWVcIildID0gYWJpbGl0aWVzVG9Mb2FkXG5cbiAgICAgIGNvbnN0IGFub3RoZXJNb2RlbCA9IGF3YWl0IHRoaXMubW9kZWxDbGFzcygpXG4gICAgICAgIC5yYW5zYWNrKHJhbnNhY2tQYXJhbXMpXG4gICAgICAgIC5hYmlsaXRpZXMoYWJpbGl0aWVzUGFyYW1zKVxuICAgICAgICAuZmlyc3QoKVxuXG4gICAgICBpZiAoIWFub3RoZXJNb2RlbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBsb29rIHVwIHRoZSBzYW1lIG1vZGVsICR7dGhpcy5wcmltYXJ5S2V5KCl9IHdpdGggYWJpbGl0aWVzOiAke2FiaWxpdGllc1RvTG9hZC5qb2luKFwiLCBcIil9YClcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3QWJpbGl0aWVzID0gYW5vdGhlck1vZGVsLmFiaWxpdGllc1xuICAgICAgZm9yIChjb25zdCBuZXdBYmlsaXR5IGluIG5ld0FiaWxpdGllcykge1xuICAgICAgICB0aGlzLmFiaWxpdGllc1tuZXdBYmlsaXR5XSA9IG5ld0FiaWxpdGllc1tuZXdBYmlsaXR5XVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7UmVjb3JkPHN0cmluZywgYW55Pn1cbiAgICovXG4gIGdldEF0dHJpYnV0ZXMoKSB7IHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMubW9kZWxEYXRhLCB0aGlzLmNoYW5nZXMpIH1cbmFzZFxuICBoYW5kbGVSZXNwb25zZUVycm9yKHJlc3BvbnNlKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIEJhc2VNb2RlbC5wYXJzZVZhbGlkYXRpb25FcnJvcnMoe21vZGVsOiB0aGlzLCByZXNwb25zZX0pXG4gICAgdGhyb3cgbmV3IEN1c3RvbUVycm9yKFwiUmVzcG9uc2Ugd2Fzbid0IHN1Y2Nlc3NmdWxcIiwge21vZGVsOiB0aGlzLCByZXNwb25zZX0pXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge251bWJlciB8IHN0cmluZ31cbiAgICovXG4gIGlkZW50aWZpZXJLZXkoKSB7XG4gICAgaWYgKCF0aGlzLl9pZGVudGlmaWVyS2V5KSB0aGlzLl9pZGVudGlmaWVyS2V5ID0gdGhpcy5pc1BlcnNpc3RlZCgpID8gdGhpcy5wcmltYXJ5S2V5KCkgOiB0aGlzLnVuaXF1ZUtleSgpXG5cbiAgICByZXR1cm4gdGhpcy5faWRlbnRpZmllcktleVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBc3NvY2lhdGlvbkxvYWRlZChhc3NvY2lhdGlvbk5hbWUpIHsgcmV0dXJuIHRoaXMuaXNBc3NvY2lhdGlvbkxvYWRlZFVuZGVyc2NvcmUoaW5mbGVjdGlvbi51bmRlcnNjb3JlKGFzc29jaWF0aW9uTmFtZSkpIH1cblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0Fzc29jaWF0aW9uTG9hZGVkVW5kZXJzY29yZSAoYXNzb2NpYXRpb25OYW1lVW5kZXJzY29yZSkge1xuICAgIGlmIChhc3NvY2lhdGlvbk5hbWVVbmRlcnNjb3JlIGluIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlKSByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBc3NvY2lhdGlvblByZXNlbnQoYXNzb2NpYXRpb25OYW1lKSB7XG4gICAgaWYgKHRoaXMuaXNBc3NvY2lhdGlvbkxvYWRlZChhc3NvY2lhdGlvbk5hbWUpKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChhc3NvY2lhdGlvbk5hbWUgaW4gdGhpcy5yZWxhdGlvbnNoaXBzKSByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gICAqIEBwYXJhbSB7YW55fSBhcmdzLmVycm9yXG4gICAqIEBwYXJhbSB7QmFzZU1vZGVsfSBbYXJncy5tb2RlbF1cbiAgICogQHBhcmFtIHtQYXJzZVZhbGlkYXRpb25FcnJvcnNPcHRpb25zfSBhcmdzLm9wdGlvbnNcbiAgICovXG4gIHN0YXRpYyBwYXJzZVZhbGlkYXRpb25FcnJvcnMoe2Vycm9yLCBtb2RlbCwgb3B0aW9uc30pIHtcbiAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFZhbGlkYXRpb25FcnJvcikpIHJldHVyblxuICAgIGlmICghZXJyb3IuYXJncy5yZXNwb25zZS52YWxpZGF0aW9uX2Vycm9ycykgcmV0dXJuXG5cbiAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0gbmV3IFZhbGlkYXRpb25FcnJvcnMoe1xuICAgICAgbW9kZWwsXG4gICAgICB2YWxpZGF0aW9uRXJyb3JzOiBkaWdnKGVycm9yLCBcImFyZ3NcIiwgXCJyZXNwb25zZVwiLCBcInZhbGlkYXRpb25fZXJyb3JzXCIpXG4gICAgfSlcblxuICAgIEJhc2VNb2RlbC5zZW5kVmFsaWRhdGlvbkVycm9yc0V2ZW50KHZhbGlkYXRpb25FcnJvcnMsIG9wdGlvbnMpXG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgb3B0aW9ucy50aHJvd1ZhbGlkYXRpb25FcnJvciAhPSBmYWxzZSkge1xuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgaHVtYW5BdHRyaWJ1dGVOYW1lKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBjb25zdCBrZXlOYW1lID0gZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwiaTE4bktleVwiKVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIGNvbnN0IGkxOG4gPSBDb25maWcuZ2V0STE4bigpXG5cbiAgICBpZiAoaTE4bikgcmV0dXJuIGkxOG4udChgYWN0aXZlcmVjb3JkLmF0dHJpYnV0ZXMuJHtrZXlOYW1lfS4ke0Jhc2VNb2RlbC5zbmFrZUNhc2UoYXR0cmlidXRlTmFtZSl9YCwge2RlZmF1bHRWYWx1ZTogYXR0cmlidXRlTmFtZX0pXG5cbiAgICByZXR1cm4gaW5mbGVjdGlvbi5odW1hbml6ZShhdHRyaWJ1dGVOYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGVOYW1lXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBdHRyaWJ1dGVDaGFuZ2VkKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVOYW1lVW5kZXJzY29yZSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShhdHRyaWJ1dGVOYW1lKVxuICAgIGNvbnN0IGF0dHJpYnV0ZURhdGEgPSB0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuYXR0cmlidXRlcy5maW5kKChhdHRyaWJ1dGUpID0+IGRpZ2coYXR0cmlidXRlLCBcIm5hbWVcIikgPT0gYXR0cmlidXRlTmFtZVVuZGVyc2NvcmUpXG5cbiAgICBpZiAoIWF0dHJpYnV0ZURhdGEpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVzID0gdGhpcy5tb2RlbENsYXNzRGF0YSgpLmF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IGRpZ2coYXR0cmlidXRlLCBcIm5hbWVcIikpXG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCBhbiBhdHRyaWJ1dGUgYnkgdGhhdCBuYW1lOiBcIiR7YXR0cmlidXRlTmFtZX1cIiBpbjogJHthdHRyaWJ1dGVOYW1lcy5qb2luKFwiLCBcIil9YClcbiAgICB9XG5cbiAgICBpZiAoIShhdHRyaWJ1dGVOYW1lVW5kZXJzY29yZSBpbiB0aGlzLmNoYW5nZXMpKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMubW9kZWxEYXRhW2F0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlXVxuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5jaGFuZ2VzW2F0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlXVxuICAgIGNvbnN0IGNoYW5nZWRNZXRob2QgPSB0aGlzW2BfaXMke2luZmxlY3Rpb24uY2FtZWxpemUoYXR0cmlidXRlRGF0YS50eXBlLCB0cnVlKX1DaGFuZ2VkYF1cblxuICAgIGlmICghY2hhbmdlZE1ldGhvZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRG9uJ3Qga25vdyBob3cgdG8gaGFuZGxlIHR5cGU6ICR7YXR0cmlidXRlRGF0YS50eXBlfWApXG5cbiAgICByZXR1cm4gY2hhbmdlZE1ldGhvZChvbGRWYWx1ZSwgbmV3VmFsdWUpXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0NoYW5nZWQoKSB7XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuY2hhbmdlcylcblxuICAgIGlmIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTmV3UmVjb3JkKCkge1xuICAgIGlmICh0aGlzLm5ld1JlY29yZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXdSZWNvcmRcbiAgICB9IGVsc2UgaWYgKFwiaWRcIiBpbiB0aGlzLm1vZGVsRGF0YSAmJiB0aGlzLm1vZGVsRGF0YS5pZCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNQZXJzaXN0ZWQoKSB7IHJldHVybiAhdGhpcy5pc05ld1JlY29yZCgpIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIHNuYWtlQ2FzZShzdHJpbmcpIHsgcmV0dXJuIGluZmxlY3Rpb24udW5kZXJzY29yZShzdHJpbmcpIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGF0dHJpYnV0ZU5hbWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBzYXZlZENoYW5nZVRvQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpIHtcbiAgICBpZiAoIXRoaXMucHJldmlvdXNNb2RlbERhdGEpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlID0gaW5mbGVjdGlvbi51bmRlcnNjb3JlKGF0dHJpYnV0ZU5hbWUpXG4gICAgY29uc3QgYXR0cmlidXRlRGF0YSA9IHRoaXMubW9kZWxDbGFzc0RhdGEoKS5hdHRyaWJ1dGVzLmZpbmQoKGF0dHJpYnV0ZSkgPT4gYXR0cmlidXRlLm5hbWUgPT0gYXR0cmlidXRlTmFtZVVuZGVyc2NvcmUpXG5cbiAgICBpZiAoIWF0dHJpYnV0ZURhdGEpIHtcbiAgICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVzID0gdGhpcy5tb2RlbENsYXNzRGF0YSgpLmF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IGF0dHJpYnV0ZS5uYW1lKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZG4ndCBmaW5kIGFuIGF0dHJpYnV0ZSBieSB0aGF0IG5hbWU6IFwiJHthdHRyaWJ1dGVOYW1lfVwiIGluOiAke2F0dHJpYnV0ZU5hbWVzLmpvaW4oXCIsIFwiKX1gKVxuICAgIH1cblxuICAgIGlmICghKGF0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlIGluIHRoaXMucHJldmlvdXNNb2RlbERhdGEpKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGNvbnN0IG9sZFZhbHVlID0gdGhpcy5wcmV2aW91c01vZGVsRGF0YVthdHRyaWJ1dGVOYW1lVW5kZXJzY29yZV1cbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMubW9kZWxEYXRhW2F0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlXVxuICAgIGNvbnN0IGNoYW5nZWRNZXRob2ROYW1lID0gYF9pcyR7aW5mbGVjdGlvbi5jYW1lbGl6ZShhdHRyaWJ1dGVEYXRhLnR5cGUpfUNoYW5nZWRgXG4gICAgY29uc3QgY2hhbmdlZE1ldGhvZCA9IHRoaXNbY2hhbmdlZE1ldGhvZE5hbWVdXG5cbiAgICBpZiAoIWNoYW5nZWRNZXRob2QpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERvbid0IGtub3cgaG93IHRvIGhhbmRsZSB0eXBlOiAke2F0dHJpYnV0ZURhdGEudHlwZX1gKVxuXG4gICAgcmV0dXJuIGNoYW5nZWRNZXRob2Qob2xkVmFsdWUsIG5ld1ZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7QmFzZU1vZGVsfSBtb2RlbFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIHNldE5ld01vZGVsKG1vZGVsKSB7XG4gICAgdGhpcy5zZXROZXdNb2RlbERhdGEobW9kZWwpXG5cbiAgICBmb3IoY29uc3QgcmVsYXRpb25zaGlwTmFtZSBpbiBtb2RlbC5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICB0aGlzLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwTmFtZV0gPSBtb2RlbC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcE5hbWVdXG4gICAgfVxuXG4gICAgZm9yKGNvbnN0IHJlbGF0aW9uc2hpcENhY2hlTmFtZSBpbiBtb2RlbC5yZWxhdGlvbnNoaXBzQ2FjaGUpIHtcbiAgICAgIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW3JlbGF0aW9uc2hpcENhY2hlTmFtZV0gPSBtb2RlbC5yZWxhdGlvbnNoaXBzQ2FjaGVbbmFtZV1cbiAgICB9XG4gIH1cblxuICBzZXROZXdNb2RlbERhdGEobW9kZWwpIHtcbiAgICBpZiAoIShcIm1vZGVsRGF0YVwiIGluIG1vZGVsKSkgdGhyb3cgbmV3IEVycm9yKGBObyBtb2RlbERhdGEgaW4gbW9kZWw6ICR7SlNPTi5zdHJpbmdpZnkobW9kZWwpfWApXG5cbiAgICB0aGlzLnByZXZpb3VzTW9kZWxEYXRhID0gT2JqZWN0LmFzc2lnbih7fSwgZGlnZyh0aGlzLCBcIm1vZGVsRGF0YVwiKSlcblxuICAgIGZvcihjb25zdCBhdHRyaWJ1dGVOYW1lIGluIG1vZGVsLm1vZGVsRGF0YSkge1xuICAgICAgdGhpcy5tb2RlbERhdGFbYXR0cmlidXRlTmFtZV0gPSBtb2RlbC5tb2RlbERhdGFbYXR0cmlidXRlTmFtZV1cbiAgICB9XG4gIH1cblxuICBfaXNEYXRlQ2hhbmdlZChvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICBpZiAoRGF0ZS5wYXJzZShvbGRWYWx1ZSkgIT0gRGF0ZS5wYXJzZShuZXdWYWx1ZSkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgX2lzSW50ZWdlckNoYW5nZWQob2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgaWYgKHBhcnNlSW50KG9sZFZhbHVlLCAxMCkgIT0gcGFyc2VJbnQobmV3VmFsdWUsIDEwKSlcbiAgICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBfaXNTdHJpbmdDaGFuZ2VkIChvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICBjb25zdCBvbGRDb252ZXJ0ZWRWYWx1ZSA9IGAke29sZFZhbHVlfWBcbiAgICBjb25zdCBuZXdDb252ZXJ0ZWRWYWx1ZSA9IGAke25ld1ZhbHVlfWBcblxuICAgIGlmIChvbGRDb252ZXJ0ZWRWYWx1ZSAhPSBuZXdDb252ZXJ0ZWRWYWx1ZSlcbiAgICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKiogQHJldHVybnMge01vZGVsQ2xhc3NEYXRhVHlwZX0gKi9cbiAgbW9kZWxDbGFzc0RhdGEoKSB7IHJldHVybiB0aGlzLm1vZGVsQ2xhc3MoKS5tb2RlbENsYXNzRGF0YSgpIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqL1xuICBhc3luYyByZWxvYWQoKSB7XG4gICAgY29uc3QgcGFyYW1zID0gdGhpcy5jb2xsZWN0aW9uICYmIHRoaXMuY29sbGVjdGlvbi5wYXJhbXMoKVxuICAgIGNvbnN0IHJhbnNhY2tQYXJhbXMgPSB7fVxuICAgIHJhbnNhY2tQYXJhbXNbYCR7dGhpcy5tb2RlbENsYXNzKCkucHJpbWFyeUtleSgpfV9lcWBdID0gdGhpcy5wcmltYXJ5S2V5KClcblxuICAgIGxldCBxdWVyeSA9IHRoaXMubW9kZWxDbGFzcygpLnJhbnNhY2socmFuc2Fja1BhcmFtcylcblxuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIGlmIChwYXJhbXMucHJlbG9hZCkge1xuICAgICAgICBxdWVyeS5xdWVyeUFyZ3MucHJlbG9hZCA9IHBhcmFtcy5wcmVsb2FkXG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuc2VsZWN0KSB7XG4gICAgICAgIHF1ZXJ5LnF1ZXJ5QXJncy5zZWxlY3QgPSBwYXJhbXMuc2VsZWN0XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuc2VsZWN0X2NvbHVtbnMpIHtcbiAgICAgICAgcXVlcnkucXVlcnlBcmdzLnNlbGVjdENvbHVtbnMgPSBwYXJhbXMuc2VsZWN0X2NvbHVtbnNcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtb2RlbCA9IGF3YWl0IHF1ZXJ5LmZpcnN0KClcbiAgICB0aGlzLnNldE5ld01vZGVsKG1vZGVsKVxuICAgIHRoaXMuY2hhbmdlcyA9IHt9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge1Byb21pc2U8e21vZGVsOiBCYXNlTW9kZWwsIHJlc3BvbnNlPzogb2JqZWN0fT59XG4gICAqL1xuICBzYXZlKCkge1xuICAgIGlmICh0aGlzLmlzTmV3UmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHttb2RlbDogQmFzZU1vZGVsLCByZXNwb25zZTogb2JqZWN0fT59XG4gICAqL1xuICBzYXZlUmF3KHJhd0RhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICh0aGlzLmlzTmV3UmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVJhdyhyYXdEYXRhLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVSYXcocmF3RGF0YSwgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSBbbmV3QXR0cmlidXRlc11cbiAgICogQHBhcmFtIHtQYXJzZVZhbGlkYXRpb25FcnJvcnNPcHRpb25zfSBbb3B0aW9uc11cbiAgICogQHJldHVybnMge1Byb21pc2U8e1xuICAgKiAgIG1vZGVsOiBCYXNlTW9kZWwsXG4gICAqICAgcmVzcG9uc2U/OiBvYmplY3RcbiAgICogfT59XG4gICAqL1xuICBhc3luYyB1cGRhdGUobmV3QXR0cmlidXRlcywgb3B0aW9ucykge1xuICAgIGlmIChuZXdBdHRyaWJ1dGVzKSB7XG4gICAgICB0aGlzLmFzc2lnbkF0dHJpYnV0ZXMobmV3QXR0cmlidXRlcylcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5jaGFuZ2VzKS5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIHttb2RlbDogdGhpc31cbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbUtleSA9IHRoaXMubW9kZWxDbGFzc0RhdGEoKS5wYXJhbUtleVxuICAgIGNvbnN0IG1vZGVsRGF0YSA9IHRoaXMuY2hhbmdlc1xuICAgIGNvbnN0IGRhdGFUb1VzZSA9IHt9XG4gICAgZGF0YVRvVXNlW3BhcmFtS2V5XSA9IG1vZGVsRGF0YVxuICAgIGxldCByZXNwb25zZVxuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgQ29tbWFuZHNQb29sLmFkZENvbW1hbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICBxdWVyeV9wYXJhbXM6IHRoaXMuY29sbGVjdGlvbiAmJiB0aGlzLmNvbGxlY3Rpb24ucGFyYW1zKCksXG4gICAgICAgICAgICBzYXZlOiBkYXRhVG9Vc2VcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmQ6IGAke3RoaXMubW9kZWxDbGFzc0RhdGEoKS5jb2xsZWN0aW9uTmFtZX0tdXBkYXRlYCxcbiAgICAgICAgICBjb2xsZWN0aW9uTmFtZTogdGhpcy5tb2RlbENsYXNzRGF0YSgpLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIHByaW1hcnlLZXk6IHRoaXMucHJpbWFyeUtleSgpLFxuICAgICAgICAgIHR5cGU6IFwidXBkYXRlXCJcbiAgICAgICAgfSxcbiAgICAgICAge31cbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgQmFzZU1vZGVsLnBhcnNlVmFsaWRhdGlvbkVycm9ycyh7ZXJyb3IsIG1vZGVsOiB0aGlzLCBvcHRpb25zfSlcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgIGlmIChyZXNwb25zZS5tb2RlbCkge1xuICAgICAgICB0aGlzLl9yZWZyZXNoTW9kZWxGcm9tUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICAgIHRoaXMuY2hhbmdlcyA9IHt9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7cmVzcG9uc2UsIG1vZGVsOiB0aGlzfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZVJlc3BvbnNlRXJyb3IocmVzcG9uc2UpXG4gICAgfVxuICB9XG5cbiAgX3JlZnJlc2hNb2RlbEZyb21SZXNwb25zZShyZXNwb25zZSkge1xuICAgIGxldCBuZXdNb2RlbCA9IGRpZ2cocmVzcG9uc2UsIFwibW9kZWxcIilcblxuICAgIGlmIChBcnJheS5pc0FycmF5KG5ld01vZGVsKSkgbmV3TW9kZWwgPSBuZXdNb2RlbFswXVxuXG4gICAgdGhpcy5zZXROZXdNb2RlbChuZXdNb2RlbClcbiAgfVxuXG4gIF9yZWZyZXNoTW9kZWxEYXRhRnJvbVJlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgbGV0IG5ld01vZGVsID0gZGlnZyhyZXNwb25zZSwgXCJtb2RlbFwiKVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobmV3TW9kZWwpKSBuZXdNb2RlbCA9IG5ld01vZGVsWzBdXG5cbiAgICB0aGlzLnNldE5ld01vZGVsRGF0YShuZXdNb2RlbClcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Zvcm1EYXRhIHwgUmVjb3JkPHN0cmluZywgYW55Pn0gcmF3RGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7UmVjb3JkPHN0cmluZywgYW55Pn1cbiAgICovXG4gIHN0YXRpYyBfb2JqZWN0RGF0YUZyb21HaXZlblJhd0RhdGEocmF3RGF0YSwgb3B0aW9ucykge1xuICAgIGlmIChyYXdEYXRhIGluc3RhbmNlb2YgRm9ybURhdGEgfHwgcmF3RGF0YS5ub2RlTmFtZSA9PSBcIkZPUk1cIikge1xuICAgICAgY29uc3QgZm9ybURhdGEgPSBGb3JtRGF0YU9iamVjdGl6ZXIuZm9ybURhdGFGcm9tT2JqZWN0KHJhd0RhdGEsIG9wdGlvbnMpXG5cbiAgICAgIHJldHVybiBGb3JtRGF0YU9iamVjdGl6ZXIudG9PYmplY3QoZm9ybURhdGEpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJhd0RhdGFcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZVJhdyhyYXdEYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBvYmplY3REYXRhID0gQmFzZU1vZGVsLl9vYmplY3REYXRhRnJvbUdpdmVuUmF3RGF0YShyYXdEYXRhLCBvcHRpb25zKVxuICAgIGxldCByZXNwb25zZVxuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgQ29tbWFuZHNQb29sLmFkZENvbW1hbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBhcmdzOiB7XG4gICAgICAgICAgICBxdWVyeV9wYXJhbXM6IHRoaXMuY29sbGVjdGlvbiAmJiB0aGlzLmNvbGxlY3Rpb24ucGFyYW1zKCksXG4gICAgICAgICAgICBzYXZlOiBvYmplY3REYXRhLFxuICAgICAgICAgICAgc2ltcGxlX21vZGVsX2Vycm9yczogb3B0aW9ucz8uc2ltcGxlTW9kZWxFcnJvcnNcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmQ6IGAke3RoaXMubW9kZWxDbGFzc0RhdGEoKS5jb2xsZWN0aW9uTmFtZX0tdXBkYXRlYCxcbiAgICAgICAgICBjb2xsZWN0aW9uTmFtZTogdGhpcy5tb2RlbENsYXNzRGF0YSgpLmNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIHByaW1hcnlLZXk6IHRoaXMucHJpbWFyeUtleSgpLFxuICAgICAgICAgIHR5cGU6IFwidXBkYXRlXCJcbiAgICAgICAgfSxcbiAgICAgICAge31cbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgQmFzZU1vZGVsLnBhcnNlVmFsaWRhdGlvbkVycm9ycyh7ZXJyb3IsIG1vZGVsOiB0aGlzLCBvcHRpb25zfSlcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLm1vZGVsKSB7XG4gICAgICB0aGlzLl9yZWZyZXNoTW9kZWxGcm9tUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB0aGlzLmNoYW5nZXMgPSB7fVxuICAgIH1cblxuICAgIHJldHVybiB7cmVzcG9uc2UsIG1vZGVsOiB0aGlzfVxuICB9XG5cbiAgaXNWYWxpZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQgeWV0XCIpXG4gIH1cblxuICBhc3luYyBpc1ZhbGlkT25TZXJ2ZXIoKSB7XG4gICAgY29uc3QgbW9kZWxEYXRhID0gdGhpcy5nZXRBdHRyaWJ1dGVzKClcbiAgICBjb25zdCBwYXJhbUtleSA9IHRoaXMubW9kZWxDbGFzc0RhdGEoKS5wYXJhbUtleVxuICAgIGNvbnN0IGRhdGFUb1VzZSA9IHt9XG4gICAgZGF0YVRvVXNlW3BhcmFtS2V5XSA9IG1vZGVsRGF0YVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBDb21tYW5kc1Bvb2wuYWRkQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgYXJnczoge1xuICAgICAgICAgIHNhdmU6IGRhdGFUb1VzZVxuICAgICAgICB9LFxuICAgICAgICBjb21tYW5kOiBgJHt0aGlzLm1vZGVsQ2xhc3NEYXRhKCkuY29sbGVjdGlvbk5hbWV9LXZhbGlkYCxcbiAgICAgICAgY29sbGVjdGlvbk5hbWU6IHRoaXMubW9kZWxDbGFzc0RhdGEoKS5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgcHJpbWFyeUtleTogdGhpcy5wcmltYXJ5S2V5KCksXG4gICAgICAgIHR5cGU6IFwidmFsaWRcIlxuICAgICAgfSxcbiAgICAgIHt9XG4gICAgKVxuXG4gICAgcmV0dXJuIHt2YWxpZDogcmVzcG9uc2UudmFsaWQsIGVycm9yczogcmVzcG9uc2UuZXJyb3JzfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSB7QmFzZU1vZGVsfSBTZWxmXG4gICAqIEB0aGlzIHtTZWxmfVxuICAgKiBAcmV0dXJucyB7dHlwZW9mIEJhc2VNb2RlbCAmIChuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBTZWxmKX1cbiAgICovXG4gIG1vZGVsQ2xhc3MoKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLyAodGhpcy5jb25zdHJ1Y3RvcilcbiAgfVxuXG4gIHByZWxvYWRSZWxhdGlvbnNoaXAocmVsYXRpb25zaGlwTmFtZSwgbW9kZWwpIHtcbiAgICB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZVtCYXNlTW9kZWwuc25ha2VDYXNlKHJlbGF0aW9uc2hpcE5hbWUpXSA9IG1vZGVsXG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzW0Jhc2VNb2RlbC5zbmFrZUNhc2UocmVsYXRpb25zaGlwTmFtZSldID0gbW9kZWxcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIG1hcmtGb3JEZXN0cnVjdGlvbigpIHtcbiAgICB0aGlzLl9tYXJrZWRGb3JEZXN0cnVjdGlvbiA9IHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIG1hcmtlZEZvckRlc3RydWN0aW9uKCkgeyByZXR1cm4gdGhpcy5fbWFya2VkRm9yRGVzdHJ1Y3Rpb24gfHwgZmFsc2UgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdW5pcXVlS2V5KCkge1xuICAgIGlmICghdGhpcy51bmlxdWVLZXlWYWx1ZSkge1xuICAgICAgY29uc3QgbWluID0gNTAwMDAwMDAwMDAwMDAwMFxuICAgICAgY29uc3QgbWF4ID0gOTAwNzE5OTI1NDc0MDk5MVxuICAgICAgY29uc3QgcmFuZG9tQmV0d2VlbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbilcbiAgICAgIHRoaXMudW5pcXVlS2V5VmFsdWUgPSByYW5kb21CZXR3ZWVuXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudW5pcXVlS2V5VmFsdWVcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfY2FsbENvbGxlY3Rpb25Db21tYW5kKGFyZ3MsIGNvbW1hbmRBcmdzKSB7XG4gICAgY29uc3QgZm9ybU9yRGF0YU9iamVjdCA9IGFyZ3MuYXJnc1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBDb21tYW5kc1Bvb2wuYWRkQ29tbWFuZChhcmdzLCBjb21tYW5kQXJncylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbGV0IGZvcm1cblxuICAgICAgaWYgKGNvbW1hbmRBcmdzLmZvcm0pIHtcbiAgICAgICAgZm9ybSA9IGNvbW1hbmRBcmdzLmZvcm1cbiAgICAgIH0gZWxzZSBpZiAoZm9ybU9yRGF0YU9iamVjdD8ubm9kZU5hbWUgPT0gXCJGT1JNXCIpIHtcbiAgICAgICAgZm9ybSA9IGZvcm1PckRhdGFPYmplY3RcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcm0pIEJhc2VNb2RlbC5wYXJzZVZhbGlkYXRpb25FcnJvcnMoe2Vycm9yLCBvcHRpb25zOiB7Zm9ybX19KVxuXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cbiAgfVxuXG4gIF9jYWxsTWVtYmVyQ29tbWFuZCA9IChhcmdzLCBjb21tYW5kQXJncykgPT4gQ29tbWFuZHNQb29sLmFkZENvbW1hbmQoYXJncywgY29tbWFuZEFyZ3MpXG5cbiAgc3RhdGljIF9wb3N0RGF0YUZyb21BcmdzKGFyZ3MpIHtcbiAgICBsZXQgcG9zdERhdGFcblxuICAgIGlmIChhcmdzKSB7XG4gICAgICBpZiAoYXJncyBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgIHBvc3REYXRhID0gYXJnc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zdERhdGEgPSBvYmplY3RUb0Zvcm1EYXRhLnNlcmlhbGl6ZShhcmdzLCB7fSwgbnVsbCwgXCJhcmdzXCIpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc3REYXRhID0gbmV3IEZvcm1EYXRhKClcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zdERhdGFcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlTmFtZVxuICAgKiBAcmV0dXJucyB7YW55fVxuICAgKi9cbiAgcmVhZEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSB7XG4gICAgY29uc3QgYXR0cmlidXRlTmFtZVVuZGVyc2NvcmUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYXR0cmlidXRlTmFtZSlcblxuICAgIHJldHVybiB0aGlzLnJlYWRBdHRyaWJ1dGVVbmRlcnNjb3JlKGF0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhdHRyaWJ1dGVOYW1lXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICByZWFkQXR0cmlidXRlVW5kZXJzY29yZShhdHRyaWJ1dGVOYW1lKSB7XG4gICAgaWYgKGF0dHJpYnV0ZU5hbWUgaW4gdGhpcy5jaGFuZ2VzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFuZ2VzW2F0dHJpYnV0ZU5hbWVdXG4gICAgfSBlbHNlIGlmIChhdHRyaWJ1dGVOYW1lIGluIHRoaXMubW9kZWxEYXRhKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbERhdGFbYXR0cmlidXRlTmFtZV1cbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNOZXdSZWNvcmQoKSkge1xuICAgICAgLy8gUmV0dXJuIG51bGwgaWYgdGhpcyBpcyBhIG5ldyByZWNvcmQgYW5kIHRoZSBhdHRyaWJ1dGUgbmFtZSBpcyBhIHJlY29nbml6ZWQgYXR0cmlidXRlXG4gICAgICBjb25zdCBhdHRyaWJ1dGVzID0gZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwiYXR0cmlidXRlc1wiKVxuXG4gICAgICBpZiAoYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzUGVyc2lzdGVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBBdHRyaWJ1dGVOb3RMb2FkZWRFcnJvcihgTm8gc3VjaCBhdHRyaWJ1dGU6ICR7ZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwibmFtZVwiKX0jJHthdHRyaWJ1dGVOYW1lfTogJHtKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsRGF0YSl9YClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0F0dHJpYnV0ZUxvYWRlZChhdHRyaWJ1dGVOYW1lKSB7XG4gICAgY29uc3QgYXR0cmlidXRlTmFtZVVuZGVyc2NvcmUgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYXR0cmlidXRlTmFtZSlcblxuICAgIGlmIChhdHRyaWJ1dGVOYW1lVW5kZXJzY29yZSBpbiB0aGlzLmNoYW5nZXMpIHJldHVybiB0cnVlXG4gICAgaWYgKGF0dHJpYnV0ZU5hbWVVbmRlcnNjb3JlIGluIHRoaXMubW9kZWxEYXRhKSByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgX2lzUHJlc2VudCh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCIgJiYgdmFsdWUubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgYXN5bmMgX2xvYWRCZWxvbmdzVG9SZWZsZWN0aW9uKGFyZ3MsIHF1ZXJ5QXJncyA9IHt9KSB7XG4gICAgaWYgKGFyZ3MucmVmbGVjdGlvbk5hbWUgaW4gdGhpcy5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNoaXBzW2FyZ3MucmVmbGVjdGlvbk5hbWVdXG4gICAgfSBlbHNlIGlmIChhcmdzLnJlZmxlY3Rpb25OYW1lIGluIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGVbYXJncy5yZWZsZWN0aW9uTmFtZV1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IG5ldyBDb2xsZWN0aW9uKGFyZ3MsIHF1ZXJ5QXJncylcbiAgICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgY29sbGVjdGlvbi5maXJzdCgpXG4gICAgICB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZVthcmdzLnJlZmxlY3Rpb25OYW1lXSA9IG1vZGVsXG4gICAgICByZXR1cm4gbW9kZWxcbiAgICB9XG4gIH1cblxuICBfcmVhZEJlbG9uZ3NUb1JlZmxlY3Rpb24oe3JlZmxlY3Rpb25OYW1lfSkge1xuICAgIGlmIChyZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc2hpcHNbcmVmbGVjdGlvbk5hbWVdXG4gICAgfSBlbHNlIGlmIChyZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW3JlZmxlY3Rpb25OYW1lXVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzTmV3UmVjb3JkKCkpIHJldHVybiBudWxsXG5cbiAgICBjb25zdCBsb2FkZWRSZWxhdGlvbnNoaXBzID0gT2JqZWN0LmtleXModGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGUpXG4gICAgY29uc3QgbW9kZWxDbGFzc05hbWUgPSBkaWdnKHRoaXMubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG5cbiAgICB0aHJvdyBuZXcgTm90TG9hZGVkRXJyb3IoYCR7bW9kZWxDbGFzc05hbWV9IyR7cmVmbGVjdGlvbk5hbWV9IGhhc24ndCBiZWVuIGxvYWRlZCB5ZXQuIE9ubHkgdGhlc2Ugd2VyZSBsb2FkZWQ6ICR7bG9hZGVkUmVsYXRpb25zaGlwcy5qb2luKFwiLCBcIil9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gQXNzb2NNQ1xuICAgKiBAcGFyYW0ge2ltcG9ydChcIi4vY29sbGVjdGlvbi5qc1wiKS5Db2xsZWN0aW9uQXJnc1R5cGU8QXNzb2NNQz59IGFyZ3NcbiAgICogQHBhcmFtIHtpbXBvcnQoXCIuL2NvbGxlY3Rpb24uanNcIikuUXVlcnlBcmdzVHlwZX0gcXVlcnlBcmdzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5PEluc3RhbmNlVHlwZTxBc3NvY01DPj4+fVxuICAgKi9cbiAgYXN5bmMgX2xvYWRIYXNNYW55UmVmbGVjdGlvbihhcmdzLCBxdWVyeUFyZ3MgPSB7fSkge1xuICAgIGlmIChhcmdzLnJlZmxlY3Rpb25OYW1lIGluIHRoaXMucmVsYXRpb25zaGlwcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zaGlwc1thcmdzLnJlZmxlY3Rpb25OYW1lXVxuICAgIH0gZWxzZSBpZiAoYXJncy5yZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW2FyZ3MucmVmbGVjdGlvbk5hbWVdXG4gICAgfVxuXG4gICAgY29uc3QgY29sbGVjdGlvbiA9IG5ldyBDb2xsZWN0aW9uKGFyZ3MsIHF1ZXJ5QXJncylcbiAgICBjb25zdCBtb2RlbHMgPSBhd2FpdCBjb2xsZWN0aW9uLnRvQXJyYXkoKVxuXG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGVbYXJncy5yZWZsZWN0aW9uTmFtZV0gPSBtb2RlbHNcblxuICAgIHJldHVybiBtb2RlbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge3R5cGVvZiBpbXBvcnQoXCIuL2Jhc2UtbW9kZWwuanNcIikuZGVmYXVsdH0gQXNzb2NNQ1xuICAgKiBAcGFyYW0ge2ltcG9ydChcIi4vY29sbGVjdGlvbi5qc1wiKS5Db2xsZWN0aW9uQXJnc1R5cGU8QXNzb2NNQz59IGFyZ3NcbiAgICogQHBhcmFtIHtpbXBvcnQoXCIuL2NvbGxlY3Rpb24uanNcIikuUXVlcnlBcmdzVHlwZX0gcXVlcnlBcmdzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPEluc3RhbmNlVHlwZTxBc3NvY01DPj59XG4gICAqL1xuICBhc3luYyBfbG9hZEhhc09uZVJlZmxlY3Rpb24oYXJncywgcXVlcnlBcmdzID0ge30pIHtcbiAgICBpZiAoYXJncy5yZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc2hpcHNbYXJncy5yZWZsZWN0aW9uTmFtZV1cbiAgICB9IGVsc2UgaWYgKGFyZ3MucmVmbGVjdGlvbk5hbWUgaW4gdGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZVthcmdzLnJlZmxlY3Rpb25OYW1lXVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gbmV3IENvbGxlY3Rpb24oYXJncywgcXVlcnlBcmdzKVxuICAgICAgY29uc3QgbW9kZWwgPSBhd2FpdCBjb2xsZWN0aW9uLmZpcnN0KClcblxuICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGVbYXJncy5yZWZsZWN0aW9uTmFtZV0gPSBtb2RlbFxuXG4gICAgICByZXR1cm4gbW9kZWxcbiAgICB9XG4gIH1cblxuICBfcmVhZEhhc09uZVJlZmxlY3Rpb24oe3JlZmxlY3Rpb25OYW1lfSkge1xuICAgIGlmIChyZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aW9uc2hpcHNbcmVmbGVjdGlvbk5hbWVdXG4gICAgfSBlbHNlIGlmIChyZWZsZWN0aW9uTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW3JlZmxlY3Rpb25OYW1lXVxuICAgIH1cblxuICAgIGlmICh0aGlzLmlzTmV3UmVjb3JkKCkpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgY29uc3QgbG9hZGVkUmVsYXRpb25zaGlwcyA9IE9iamVjdC5rZXlzKHRoaXMucmVsYXRpb25zaGlwc0NhY2hlKVxuICAgIGNvbnN0IG1vZGVsQ2xhc3NOYW1lID0gZGlnZyh0aGlzLm1vZGVsQ2xhc3NEYXRhKCksIFwibmFtZVwiKVxuXG4gICAgdGhyb3cgbmV3IE5vdExvYWRlZEVycm9yKGAke21vZGVsQ2xhc3NOYW1lfSMke3JlZmxlY3Rpb25OYW1lfSBoYXNuJ3QgYmVlbiBsb2FkZWQgeWV0LiBPbmx5IHRoZXNlIHdlcmUgbG9hZGVkOiAke2xvYWRlZFJlbGF0aW9uc2hpcHMuam9pbihcIiwgXCIpfWApXG4gIH1cblxuICBfcmVhZE1vZGVsRGF0YUZyb21BcmdzKGFyZ3MpIHtcbiAgICB0aGlzLmFiaWxpdGllcyA9IGFyZ3MuZGF0YS5iIHx8IHt9XG4gICAgdGhpcy5jb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uXG4gICAgdGhpcy5tb2RlbERhdGEgPSBvYmplY3RUb1VuZGVyc2NvcmUoYXJncy5kYXRhLmEpXG4gICAgdGhpcy5wcmVsb2FkZWRSZWxhdGlvbnNoaXBzID0gYXJncy5kYXRhLnJcbiAgfVxuXG4gIF9yZWFkUHJlbG9hZGVkUmVsYXRpb25zaGlwcyhwcmVsb2FkZWQpIHtcbiAgICBpZiAoIXRoaXMucHJlbG9hZGVkUmVsYXRpb25zaGlwcykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXRpb25zaGlwcyA9IGRpZ2codGhpcy5tb2RlbENsYXNzRGF0YSgpLCBcInJlbGF0aW9uc2hpcHNcIilcblxuICAgIGZvciAoY29uc3QgcmVsYXRpb25zaGlwTmFtZSBpbiB0aGlzLnByZWxvYWRlZFJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcERhdGEgPSB0aGlzLnByZWxvYWRlZFJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwTmFtZV1cbiAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcENsYXNzRGF0YSA9IHJlbGF0aW9uc2hpcHMuZmluZCgocmVsYXRpb25zaGlwKSA9PiBkaWdnKHJlbGF0aW9uc2hpcCwgXCJuYW1lXCIpID09IHJlbGF0aW9uc2hpcE5hbWUpXG5cbiAgICAgIGlmICghcmVsYXRpb25zaGlwQ2xhc3NEYXRhKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsTmFtZSA9IGRpZ2codGhpcy5tb2RlbENsYXNzRGF0YSgpLCBcIm5hbWVcIilcbiAgICAgICAgY29uc3QgcmVsYXRpb25zaGlwc0xpc3QgPSByZWxhdGlvbnNoaXBzLm1hcCgocmVsYXRpb25zaGlwKSA9PiByZWxhdGlvbnNoaXAubmFtZSkuam9pbihcIiwgXCIpXG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCB0aGUgcmVsYXRpb24gJHtyZWxhdGlvbnNoaXBOYW1lfSBvbiB0aGUgJHttb2RlbE5hbWV9IG1vZGVsOiAke3JlbGF0aW9uc2hpcHNMaXN0fWApXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbGF0aW9uc2hpcFR5cGUgPSBkaWdnKHJlbGF0aW9uc2hpcENsYXNzRGF0YSwgXCJjb2xsZWN0aW9uTmFtZVwiKVxuXG4gICAgICBpZiAocmVsYXRpb25zaGlwTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cmVsYXRpb25zaGlwTmFtZX0gaGFzIGFscmVhZHkgYmVlbiBsb2FkZWRgKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXJlbGF0aW9uc2hpcENsYXNzRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHJlbGF0aW9uc2hpcCBvbiAke2RpZ2codGhpcy5tb2RlbENsYXNzRGF0YSgpLCBcIm5hbWVcIil9IGJ5IHRoYXQgbmFtZTogJHtyZWxhdGlvbnNoaXBOYW1lfWApXG4gICAgICB9XG5cbiAgICAgIGlmICghcmVsYXRpb25zaGlwRGF0YSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcHNDYWNoZVtyZWxhdGlvbnNoaXBOYW1lXSA9IG51bGxcbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcE5hbWVdID0gbnVsbFxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlbGF0aW9uc2hpcERhdGEpKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW3JlbGF0aW9uc2hpcE5hbWVdID0gW11cbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcE5hbWVdID0gW11cblxuICAgICAgICBmb3IgKGNvbnN0IHJlbGF0aW9uc2hpcElkIG9mIHJlbGF0aW9uc2hpcERhdGEpIHtcbiAgICAgICAgICBjb25zdCBtb2RlbCA9IHByZWxvYWRlZC5nZXRNb2RlbChyZWxhdGlvbnNoaXBUeXBlLCByZWxhdGlvbnNoaXBJZClcblxuICAgICAgICAgIHRoaXMucmVsYXRpb25zaGlwc0NhY2hlW3JlbGF0aW9uc2hpcE5hbWVdLnB1c2gobW9kZWwpXG4gICAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcE5hbWVdLnB1c2gobW9kZWwpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gcHJlbG9hZGVkLmdldE1vZGVsKHJlbGF0aW9uc2hpcFR5cGUsIHJlbGF0aW9uc2hpcERhdGEpXG5cbiAgICAgICAgdGhpcy5yZWxhdGlvbnNoaXBzQ2FjaGVbcmVsYXRpb25zaGlwTmFtZV0gPSBtb2RlbFxuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwTmFtZV0gPSBtb2RlbFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfHN0cmluZ31cbiAgICovXG4gIHByaW1hcnlLZXkoKSB7IHJldHVybiB0aGlzLnJlYWRBdHRyaWJ1dGVVbmRlcnNjb3JlKHRoaXMubW9kZWxDbGFzcygpLnByaW1hcnlLZXkoKSkgfVxufVxuIl19