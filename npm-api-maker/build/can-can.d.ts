export default class ApiMakerCanCan {
    static current(): any;
    abilities: any[];
    abilitiesToLoad: any[];
    abilitiesToLoadData: any[];
    abilitiesGeneration: number;
    loadingCount: number;
    events: any;
    lock: any;
    can(ability: any, subject: any): any;
    findAbility(ability: any, subject: any): any;
    isAbilityLoaded(ability: any, subject: any): boolean;
    isReloading(): boolean;
    loadAbilities(abilities: any): Promise<void>;
    loadAbility(ability: any, subject: any): Promise<any>;
    queueAbilitiesRequest(): void;
    queueAbilitiesRequestTimeout: NodeJS.Timeout;
    resetAbilities(): Promise<void>;
    sendAbilitiesRequest: () => Promise<void>;
}
//# sourceMappingURL=can-can.d.ts.map