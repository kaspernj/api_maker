export default class ApiMakerCommandsPool {
    static addCommand(data: any, args?: {}): any;
    static current(): any;
    static flush(): void;
    flushCount: number;
    /** @type {Record<number, CommandDataType>} */
    pool: Record<number, CommandDataType>;
    /** @type {PoolDataType} */
    poolData: PoolDataType;
    currentId: number;
    /** @type {Record<string, any>} */
    globalRequestData: Record<string, any>;
    addCommand(data: any): Promise<any>;
    /** @returns {number} */
    commandsCount(): number;
    /**
     * @param {object} args
     * @param {string} args.url
     * @param {CommandSubmitData} args.commandSubmitData
     * @returns {Promise<Record<string, any>>}
     */
    sendRequest({ commandSubmitData, url }: {
        url: string;
        commandSubmitData: CommandSubmitData;
    }): Promise<Record<string, any>>;
    flush: () => Promise<void>;
    /**
     * @param {CommandDataType} commandData
     * @param {object} commandResponseData
     * @param {string} commandResponseData.error_type
     * @param {string[]} commandResponseData.errors
     * @param {string[]} commandResponseData.validation_errors
     * @returns {void}
     */
    handleFailedResponse(commandData: CommandDataType, commandResponseData: {
        error_type: string;
        errors: string[];
        validation_errors: string[];
    }): void;
    isActive(): boolean;
    flushRunLast: RunLast;
}
export type CommandDataType = {
    resolve: Function;
    reject: Function;
    stack: string;
};
export type PoolDataType = {
    [key: string]: {
        [key: string]: {
            [key: string]: {
                [key: number]: {
                    args: object;
                    primary_key: number | string;
                    id: number;
                };
            };
        };
    };
};
import CommandSubmitData from "./command-submit-data.js";
import RunLast from "./run-last.js";
//# sourceMappingURL=commands-pool.d.ts.map