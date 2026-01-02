// @ts-check
import Api from "./api.js";
import CommandSubmitData from "./command-submit-data.js";
import CustomError from "./custom-error.js";
import DestroyError from "./destroy-error.js";
import Deserializer from "./deserializer.js";
import { dig, digg } from "diggerize";
import events from "./events.js";
import FormDataObjectizer from "form-data-objectizer";
import RunLast from "./run-last.js";
import Serializer from "./serializer.js";
import SessionStatusUpdater from "./session-status-updater.js";
import ValidationError from "./validation-error.js";
import { ValidationErrors } from "./validation-errors.js";
/**
 * @typedef {object} CommandDataType
 * @property {Function} resolve
 * @property {Function} reject
 * @property {string} stack
 */
/**
 * @typedef {{[key: string]: {[key: string]: {[key: string]: {[key: number]: {args: object, primary_key: number | string, id: number}}}}}} PoolDataType
 */
const shared = {};
export default class ApiMakerCommandsPool {
    static addCommand(data, args = {}) {
        let pool;
        if (args.instant) {
            pool = new ApiMakerCommandsPool();
        }
        else {
            pool = ApiMakerCommandsPool.current();
        }
        const promiseResult = pool.addCommand(data);
        if (args.instant) {
            pool.flushRunLast.run();
        }
        else {
            pool.flushRunLast.queue();
        }
        return promiseResult;
    }
    static current() {
        if (!shared.currentApiMakerCommandsPool)
            shared.currentApiMakerCommandsPool = new ApiMakerCommandsPool();
        return shared.currentApiMakerCommandsPool;
    }
    static flush() {
        ApiMakerCommandsPool.current().flush();
    }
    constructor() {
        this.flushCount = 0;
        /** @type {Record<number, CommandDataType>} */
        this.pool = {};
        /** @type {PoolDataType} */
        this.poolData = {};
        this.currentId = 1;
        /** @type {Record<string, any>} */
        this.globalRequestData = {};
    }
    addCommand(data) {
        const stack = Error().stack;
        return new Promise((resolve, reject) => {
            const id = this.currentId;
            this.currentId += 1;
            const commandType = data.type;
            const commandName = data.command;
            const collectionName = data.collectionName;
            this.pool[id] = { resolve, reject, stack };
            if (!this.poolData[commandType])
                this.poolData[commandType] = {};
            if (!this.poolData[commandType][collectionName])
                this.poolData[commandType][collectionName] = {};
            if (!this.poolData[commandType][collectionName][commandName])
                this.poolData[commandType][collectionName][commandName] = {};
            let args;
            if (data.args?.nodeName == "FORM") {
                const formData = new FormData(data.args);
                args = FormDataObjectizer.toObject(formData);
            }
            else if (data.args instanceof FormData) {
                args = FormDataObjectizer.toObject(data.args);
            }
            else {
                args = Serializer.serialize(data.args);
            }
            this.poolData[commandType][collectionName][commandName][id] = {
                args,
                primary_key: data.primaryKey,
                id
            };
        });
    }
    /** @returns {number} */
    commandsCount() {
        return Object.keys(this.pool).length;
    }
    /**
     * @param {object} args
     * @param {string} args.url
     * @param {CommandSubmitData} args.commandSubmitData
     * @returns {Promise<Record<string, any>>}
     */
    async sendRequest({ commandSubmitData, url }) {
        let response;
        for (let i = 0; i < 3; i++) {
            if (commandSubmitData.getFilesCount() > 0) {
                response = await Api.requestLocal({ path: url, method: "POST", rawData: commandSubmitData.getFormData() });
            }
            else {
                response = await Api.requestLocal({ path: url, method: "POST", data: commandSubmitData.getJsonData() });
            }
            if (response.success === false && response.type == "invalid_authenticity_token") {
                console.log("Invalid authenticity token - try again");
                await SessionStatusUpdater.current().updateSessionStatus();
                continue;
            }
            return response;
        }
        throw new Error("Couldnt successfully execute request");
    }
    flush = async () => {
        if (this.commandsCount() == 0) {
            return;
        }
        const currentPool = this.pool;
        const currentPoolData = this.poolData;
        this.pool = {};
        this.poolData = {};
        this.flushCount++;
        try {
            const submitData = { pool: currentPoolData };
            if (Object.keys(this.globalRequestData).length > 0)
                submitData.global = this.globalRequestData;
            const commandSubmitData = new CommandSubmitData(submitData);
            const url = "/api_maker/commands";
            const response = await this.sendRequest({ commandSubmitData, url });
            for (const commandId in response.responses) {
                const commandResponse = response.responses[commandId];
                const commandResponseData = Deserializer.parse(commandResponse.data);
                const commandData = currentPool[parseInt(commandId, 10)];
                const responseType = commandResponse.type;
                if (commandResponseData && typeof commandResponseData == "object") {
                    const bugReportUrl = dig(commandResponseData, "bug_report_url");
                    if (bugReportUrl) {
                        console.log(`Bug report URL: ${bugReportUrl}`);
                    }
                }
                if (responseType == "success") {
                    commandData.resolve(commandResponseData);
                }
                else if (responseType == "error") {
                    const error = new CustomError("Command error", { response: commandResponseData });
                    error.stack += "\n";
                    error.stack += commandData.stack.split("\n").slice(1).join("\n");
                    commandData.reject(error);
                }
                else if (responseType == "failed") {
                    this.handleFailedResponse(commandData, commandResponseData);
                }
                else {
                    throw new Error(`Unhandled response type: ${responseType}`);
                }
            }
        }
        finally {
            this.flushCount--;
        }
    };
    /**
     * @param {CommandDataType} commandData
     * @param {object} commandResponseData
     * @param {string} commandResponseData.error_type
     * @param {string[]} commandResponseData.errors
     * @param {string[]} commandResponseData.validation_errors
     * @returns {void}
     */
    handleFailedResponse(commandData, commandResponseData) {
        let error;
        if (commandResponseData.error_type == "destroy_error") {
            error = new DestroyError(`Destroy failed`, { response: commandResponseData });
        }
        else if (commandResponseData.error_type == "validation_error") {
            const validationErrors = new ValidationErrors({
                model: digg(commandResponseData, "model"),
                validationErrors: digg(commandResponseData, "validation_errors")
            });
            error = new ValidationError(validationErrors, { response: commandResponseData });
            events.emit("onValidationErrors", validationErrors);
        }
        else {
            let errorMessage;
            if (!commandResponseData.errors) {
                errorMessage = "Command failed";
            }
            error = new CustomError(errorMessage, { response: commandResponseData });
        }
        commandData.reject(error);
    }
    isActive() {
        if (this.commandsCount() > 0) {
            return true;
        }
        if (this.flushCount > 0) {
            return true;
        }
        return false;
    }
    flushRunLast = new RunLast(this.flush);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMtcG9vbC5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsiY29tbWFuZHMtcG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZO0FBRVosT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFBO0FBQzFCLE9BQU8saUJBQWlCLE1BQU0sMEJBQTBCLENBQUE7QUFDeEQsT0FBTyxXQUFXLE1BQU0sbUJBQW1CLENBQUE7QUFDM0MsT0FBTyxZQUFZLE1BQU0sb0JBQW9CLENBQUE7QUFDN0MsT0FBTyxZQUFZLE1BQU0sbUJBQW1CLENBQUE7QUFDNUMsT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxXQUFXLENBQUE7QUFDbkMsT0FBTyxNQUFNLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sa0JBQWtCLE1BQU0sc0JBQXNCLENBQUE7QUFDckQsT0FBTyxPQUFPLE1BQU0sZUFBZSxDQUFBO0FBQ25DLE9BQU8sVUFBVSxNQUFNLGlCQUFpQixDQUFBO0FBQ3hDLE9BQU8sb0JBQW9CLE1BQU0sNkJBQTZCLENBQUE7QUFDOUQsT0FBTyxlQUFlLE1BQU0sdUJBQXVCLENBQUE7QUFDbkQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUE7QUFFdkQ7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVILE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUVqQixNQUFNLENBQUMsT0FBTyxPQUFPLG9CQUFvQjtJQUN2QyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUMvQixJQUFJLElBQUksQ0FBQTtRQUVSLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUE7UUFDbkMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLEdBQUcsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDdkMsQ0FBQztRQUVELE1BQU0s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Q0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFBQyxZQUFZLEdBQUcsZ0JBQWdCLENBQUE7WUFBQyxDQUFDO1lBRXBFLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQyxDQUFBO1FBQ3hFLENBQUM7UUFFRCxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELFlBQVksR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7Q0FDdkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IEFwaSBmcm9tIFwiLi9hcGkuanNcIlxuaW1wb3J0IENvbW1hbmRTdWJtaXREYXRhIGZyb20gXCIuL2NvbW1hbmQtc3VibWl0LWRhdGEuanNcIlxuaW1wb3J0IEN1c3RvbUVycm9yIGZyb20gXCIuL2N1c3RvbS1lcnJvci5qc1wiXG5pbXBvcnQgRGVzdHJveUVycm9yIGZyb20gXCIuL2Rlc3Ryb3ktZXJyb3IuanNcIlxuaW1wb3J0IERlc2VyaWFsaXplciBmcm9tIFwiLi9kZXNlcmlhbGl6ZXIuanNcIlxuaW1wb3J0IHtkaWcsIGRpZ2d9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0IGV2ZW50cyBmcm9tIFwiLi9ldmVudHMuanNcIlxuaW1wb3J0IEZvcm1EYXRhT2JqZWN0aXplciBmcm9tIFwiZm9ybS1kYXRhLW9iamVjdGl6ZXJcIlxuaW1wb3J0IFJ1bkxhc3QgZnJvbSBcIi4vcnVuLWxhc3QuanNcIlxuaW1wb3J0IFNlcmlhbGl6ZXIgZnJvbSBcIi4vc2VyaWFsaXplci5qc1wiXG5pbXBvcnQgU2Vzc2lvblN0YXR1c1VwZGF0ZXIgZnJvbSBcIi4vc2Vzc2lvbi1zdGF0dXMtdXBkYXRlci5qc1wiXG5pbXBvcnQgVmFsaWRhdGlvbkVycm9yIGZyb20gXCIuL3ZhbGlkYXRpb24tZXJyb3IuanNcIlxuaW1wb3J0IHtWYWxpZGF0aW9uRXJyb3JzfSBmcm9tIFwiLi92YWxpZGF0aW9uLWVycm9ycy5qc1wiXG5cbi8qKlxuICogQHR5cGVkZWYge29iamVjdH0gQ29tbWFuZERhdGFUeXBlXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSByZWplY3RcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdGFja1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3tba2V5OiBzdHJpbmddOiB7W2tleTogc3RyaW5nXToge1trZXk6IHN0cmluZ106IHtba2V5OiBudW1iZXJdOiB7YXJnczogb2JqZWN0LCBwcmltYXJ5X2tleTogbnVtYmVyIHwgc3RyaW5nLCBpZDogbnVtYmVyfX19fX19IFBvb2xEYXRhVHlwZVxuICovXG5cbmNvbnN0IHNoYXJlZCA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwaU1ha2VyQ29tbWFuZHNQb29sIHtcbiAgc3RhdGljIGFkZENvbW1hbmQoZGF0YSwgYXJncyA9IHt9KSB7XG4gICAgbGV0IHBvb2xcblxuICAgIGlmIChhcmdzLmluc3RhbnQpIHtcbiAgICAgIHBvb2wgPSBuZXcgQXBpTWFrZXJDb21tYW5kc1Bvb2woKVxuICAgIH0gZWxzZSB7XG4gICAgICBwb29sID0gQXBpTWFrZXJDb21tYW5kc1Bvb2wuY3VycmVudCgpXG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZVJlc3VsdCA9IHBvb2wuYWRkQ29tbWFuZChkYXRhKVxuXG4gICAgaWYgKGFyZ3MuaW5zdGFudCkge1xuICAgICAgcG9vbC5mbHVzaFJ1bkxhc3QucnVuKClcbiAgICB9IGVsc2Uge1xuICAgICAgcG9vbC5mbHVzaFJ1bkxhc3QucXVldWUoKVxuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlUmVzdWx0XG4gIH1cblxuICBzdGF0aWMgY3VycmVudCgpIHtcbiAgICBpZiAoIXNoYXJlZC5jdXJyZW50QXBpTWFrZXJDb21tYW5kc1Bvb2wpIHNoYXJlZC5jdXJyZW50QXBpTWFrZXJDb21tYW5kc1Bvb2wgPSBuZXcgQXBpTWFrZXJDb21tYW5kc1Bvb2woKVxuXG4gICAgcmV0dXJuIHNoYXJlZC5jdXJyZW50QXBpTWFrZXJDb21tYW5kc1Bvb2xcbiAgfVxuXG4gIHN0YXRpYyBmbHVzaCgpIHtcbiAgICBBcGlNYWtlckNvbW1hbmRzUG9vbC5jdXJyZW50KCkuZmx1c2goKVxuICB9XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5mbHVzaENvdW50ID0gMFxuXG4gICAgLyoqIEB0eXBlIHtSZWNvcmQ8bnVtYmVyLCBDb21tYW5kRGF0YVR5cGU+fSAqL1xuICAgIHRoaXMucG9vbCA9IHt9XG5cbiAgICAvKiogQHR5cGUge1Bvb2xEYXRhVHlwZX0gKi9cbiAgICB0aGlzLnBvb2xEYXRhID0ge31cblxuICAgIHRoaXMuY3VycmVudElkID0gMVxuXG4gICAgLyoqIEB0eXBlIHtSZWNvcmQ8c3RyaW5nLCBhbnk+fSAqL1xuICAgIHRoaXMuZ2xvYmFsUmVxdWVzdERhdGEgPSB7fVxuICB9XG5cbiAgYWRkQ29tbWFuZChkYXRhKSB7XG4gICAgY29uc3Qgc3RhY2sgPSBFcnJvcigpLnN0YWNrXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLmN1cnJlbnRJZFxuICAgICAgdGhpcy5jdXJyZW50SWQgKz0gMVxuXG4gICAgICBjb25zdCBjb21tYW5kVHlwZSA9IGRhdGEudHlwZVxuICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSBkYXRhLmNvbW1hbmRcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gZGF0YS5jb2xsZWN0aW9uTmFtZVxuXG4gICAgICB0aGlzLnBvb2xbaWRdID0ge3Jlc29sdmUsIHJlamVjdCwgc3RhY2t9XG5cbiAgICAgIGlmICghdGhpcy5wb29sRGF0YVtjb21tYW5kVHlwZV0pIHRoaXMucG9vbERhdGFbY29tbWFuZFR5cGVdID0ge31cbiAgICAgIGlmICghdGhpcy5wb29sRGF0YVtjb21tYW5kVHlwZV1bY29sbGVjdGlvbk5hbWVdKSB0aGlzLnBvb2xEYXRhW2NvbW1hbmRUeXBlXVtjb2xsZWN0aW9uTmFtZV0gPSB7fVxuICAgICAgaWYgKCF0aGlzLnBvb2xEYXRhW2NvbW1hbmRUeXBlXVtjb2xsZWN0aW9uTmFtZV1bY29tbWFuZE5hbWVdKSB0aGlzLnBvb2xEYXRhW2NvbW1hbmRUeXBlXVtjb2xsZWN0aW9uTmFtZV1bY29tbWFuZE5hbWVdID0ge31cblxuICAgICAgbGV0IGFyZ3NcblxuICAgICAgaWYgKGRhdGEuYXJncz8ubm9kZU5hbWUgPT0gXCJGT1JNXCIpIHtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZGF0YS5hcmdzKVxuXG4gICAgICAgIGFyZ3MgPSBGb3JtRGF0YU9iamVjdGl6ZXIudG9PYmplY3QoZm9ybURhdGEpXG4gICAgICB9IGVsc2UgaWYgKGRhdGEuYXJncyBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgIGFyZ3MgPSBGb3JtRGF0YU9iamVjdGl6ZXIudG9PYmplY3QoZGF0YS5hcmdzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFNlcmlhbGl6ZXIuc2VyaWFsaXplKGRhdGEuYXJncylcbiAgICAgIH1cblxuICAgICAgdGhpcy5wb29sRGF0YVtjb21tYW5kVHlwZV1bY29sbGVjdGlvbk5hbWVdW2NvbW1hbmROYW1lXVtpZF0gPSB7XG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHByaW1hcnlfa2V5OiBkYXRhLnByaW1hcnlLZXksXG4gICAgICAgIGlkXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKiBAcmV0dXJucyB7bnVtYmVyfSAqL1xuICBjb21tYW5kc0NvdW50KCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnBvb2wpLmxlbmd0aFxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBhcmdzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcmdzLnVybFxuICAgKiBAcGFyYW0ge0NvbW1hbmRTdWJtaXREYXRhfSBhcmdzLmNvbW1hbmRTdWJtaXREYXRhXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+fVxuICAgKi9cbiAgYXN5bmMgc2VuZFJlcXVlc3Qoe2NvbW1hbmRTdWJtaXREYXRhLCB1cmx9KSB7XG4gICAgbGV0IHJlc3BvbnNlXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgaWYgKGNvbW1hbmRTdWJtaXREYXRhLmdldEZpbGVzQ291bnQoKSA+IDApIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBBcGkucmVxdWVzdExvY2FsKHtwYXRoOiB1cmwsIG1ldGhvZDogXCJQT1NUXCIsIHJhd0RhdGE6IGNvbW1hbmRTdWJtaXREYXRhLmdldEZvcm1EYXRhKCl9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBBcGkucmVxdWVzdExvY2FsKHtwYXRoOiB1cmwsIG1ldGhvZDogXCJQT1NUXCIsIGRhdGE6IGNvbW1hbmRTdWJtaXREYXRhLmdldEpzb25EYXRhKCl9KVxuICAgICAgfVxuXG4gICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyA9PT0gZmFsc2UgJiYgcmVzcG9uc2UudHlwZSA9PSBcImludmFsaWRfYXV0aGVudGljaXR5X3Rva2VuXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbnZhbGlkIGF1dGhlbnRpY2l0eSB0b2tlbiAtIHRyeSBhZ2FpblwiKVxuICAgICAgICBhd2FpdCBTZXNzaW9uU3RhdHVzVXBkYXRlci5jdXJyZW50KCkudXBkYXRlU2Vzc2lvblN0YXR1cygpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbnQgc3VjY2Vzc2Z1bGx5IGV4ZWN1dGUgcmVxdWVzdFwiKVxuICB9XG5cbiAgZmx1c2ggPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKHRoaXMuY29tbWFuZHNDb3VudCgpID09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRQb29sID0gdGhpcy5wb29sXG4gICAgY29uc3QgY3VycmVudFBvb2xEYXRhID0gdGhpcy5wb29sRGF0YVxuXG4gICAgdGhpcy5wb29sID0ge31cbiAgICB0aGlzLnBvb2xEYXRhID0ge31cbiAgICB0aGlzLmZsdXNoQ291bnQrK1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN1Ym1pdERhdGEgPSB7cG9vbDogY3VycmVudFBvb2xEYXRhfVxuXG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5nbG9iYWxSZXF1ZXN0RGF0YSkubGVuZ3RoID4gMClcbiAgICAgICAgc3VibWl0RGF0YS5nbG9iYWwgPSB0aGlzLmdsb2JhbFJlcXVlc3REYXRhXG5cbiAgICAgIGNvbnN0IGNvbW1hbmRTdWJtaXREYXRhID0gbmV3IENvbW1hbmRTdWJtaXREYXRhKHN1Ym1pdERhdGEpXG4gICAgICBjb25zdCB1cmwgPSBcIi9hcGlfbWFrZXIvY29tbWFuZHNcIlxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNlbmRSZXF1ZXN0KHtjb21tYW5kU3VibWl0RGF0YSwgdXJsfSlcblxuICAgICAgZm9yIChjb25zdCBjb21tYW5kSWQgaW4gcmVzcG9uc2UucmVzcG9uc2VzKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmRSZXNwb25zZSA9IHJlc3BvbnNlLnJlc3BvbnNlc1tjb21tYW5kSWRdXG4gICAgICAgIGNvbnN0IGNvbW1hbmRSZXNwb25zZURhdGEgPSBEZXNlcmlhbGl6ZXIucGFyc2UoY29tbWFuZFJlc3BvbnNlLmRhdGEpXG4gICAgICAgIGNvbnN0IGNvbW1hbmREYXRhID0gY3VycmVudFBvb2xbcGFyc2VJbnQoY29tbWFuZElkLCAxMCldXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlVHlwZSA9IGNvbW1hbmRSZXNwb25zZS50eXBlXG5cbiAgICAgICAgaWYgKGNvbW1hbmRSZXNwb25zZURhdGEgJiYgdHlwZW9mIGNvbW1hbmRSZXNwb25zZURhdGEgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGNvbnN0IGJ1Z1JlcG9ydFVybCA9IGRpZyhjb21tYW5kUmVzcG9uc2VEYXRhLCBcImJ1Z19yZXBvcnRfdXJsXCIpXG5cbiAgICAgICAgICBpZiAoYnVnUmVwb3J0VXJsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQnVnIHJlcG9ydCBVUkw6ICR7YnVnUmVwb3J0VXJsfWApXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlVHlwZSA9PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICAgIGNvbW1hbmREYXRhLnJlc29sdmUoY29tbWFuZFJlc3BvbnNlRGF0YSlcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZVR5cGUgPT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgQ3VzdG9tRXJyb3IoXCJDb21tYW5kIGVycm9yXCIsIHtyZXNwb25zZTogY29tbWFuZFJlc3BvbnNlRGF0YX0pXG5cbiAgICAgICAgICBlcnJvci5zdGFjayArPSBcIlxcblwiXG4gICAgICAgICAgZXJyb3Iuc3RhY2sgKz0gY29tbWFuZERhdGEuc3RhY2suc3BsaXQoXCJcXG5cIikuc2xpY2UoMSkuam9pbihcIlxcblwiKVxuXG4gICAgICAgICAgY29tbWFuZERhdGEucmVqZWN0KGVycm9yKVxuICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlVHlwZSA9PSBcImZhaWxlZFwiKSB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVGYWlsZWRSZXNwb25zZShjb21tYW5kRGF0YSwgY29tbWFuZFJlc3BvbnNlRGF0YSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuaGFuZGxlZCByZXNwb25zZSB0eXBlOiAke3Jlc3BvbnNlVHlwZX1gKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZmx1c2hDb3VudC0tXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29tbWFuZERhdGFUeXBlfSBjb21tYW5kRGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gY29tbWFuZFJlc3BvbnNlRGF0YVxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29tbWFuZFJlc3BvbnNlRGF0YS5lcnJvcl90eXBlXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbW1hbmRSZXNwb25zZURhdGEuZXJyb3JzXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGNvbW1hbmRSZXNwb25zZURhdGEudmFsaWRhdGlvbl9lcnJvcnNcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBoYW5kbGVGYWlsZWRSZXNwb25zZShjb21tYW5kRGF0YSwgY29tbWFuZFJlc3BvbnNlRGF0YSkge1xuICAgIGxldCBlcnJvclxuXG4gICAgaWYgKGNvbW1hbmRSZXNwb25zZURhdGEuZXJyb3JfdHlwZSA9PSBcImRlc3Ryb3lfZXJyb3JcIikge1xuICAgICAgZXJyb3IgPSBuZXcgRGVzdHJveUVycm9yKGBEZXN0cm95IGZhaWxlZGAsIHtyZXNwb25zZTogY29tbWFuZFJlc3BvbnNlRGF0YX0pXG4gICAgfSBlbHNlIGlmIChjb21tYW5kUmVzcG9uc2VEYXRhLmVycm9yX3R5cGUgPT0gXCJ2YWxpZGF0aW9uX2Vycm9yXCIpIHtcbiAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSBuZXcgVmFsaWRhdGlvbkVycm9ycyh7XG4gICAgICAgIG1vZGVsOiBkaWdnKGNvbW1hbmRSZXNwb25zZURhdGEsIFwibW9kZWxcIiksXG4gICAgICAgIHZhbGlkYXRpb25FcnJvcnM6IGRpZ2coY29tbWFuZFJlc3BvbnNlRGF0YSwgXCJ2YWxpZGF0aW9uX2Vycm9yc1wiKVxuICAgICAgfSlcbiAgICAgIGVycm9yID0gbmV3IFZhbGlkYXRpb25FcnJvcih2YWxpZGF0aW9uRXJyb3JzLCB7cmVzcG9uc2U6IGNvbW1hbmRSZXNwb25zZURhdGF9KVxuXG4gICAgICBldmVudHMuZW1pdChcIm9uVmFsaWRhdGlvbkVycm9yc1wiLCB2YWxpZGF0aW9uRXJyb3JzKVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZXJyb3JNZXNzYWdlXG5cbiAgICAgIGlmICghY29tbWFuZFJlc3BvbnNlRGF0YS5lcnJvcnMpIHsgZXJyb3JNZXNzYWdlID0gXCJDb21tYW5kIGZhaWxlZFwiIH1cblxuICAgICAgZXJyb3IgPSBuZXcgQ3VzdG9tRXJyb3IoZXJyb3JNZXNzYWdlLCB7cmVzcG9uc2U6IGNvbW1hbmRSZXNwb25zZURhdGF9KVxuICAgIH1cblxuICAgIGNvbW1hbmREYXRhLnJlamVjdChlcnJvcilcbiAgfVxuXG4gIGlzQWN0aXZlKCkge1xuICAgIGlmICh0aGlzLmNvbW1hbmRzQ291bnQoKSA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmx1c2hDb3VudCA+IDApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmbHVzaFJ1bkxhc3QgPSBuZXcgUnVuTGFzdCh0aGlzLmZsdXNoKVxufVxuIl19