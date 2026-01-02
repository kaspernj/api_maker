/* eslint-disable sort-imports */
import * as inflection from "inflection";
import { EventEmitter } from "eventemitter3";
import { ReadersWriterLock } from "epic-locks";
import { digg } from "diggerize";
import Services from "./services.js";
const shared = {};
export default class ApiMakerCanCan {
    abilities = [];
    abilitiesToLoad = [];
    abilitiesToLoadData = [];
    abilitiesGeneration = 0;
    loadingCount = 0;
    events = new EventEmitter();
    lock = new ReadersWriterLock();
    static current() {
        if (!shared.currentApiMakerCanCan)
            shared.currentApiMakerCanCan = new ApiMakerCanCan();
        return shared.currentApiMakerCanCan;
    }
    can(ability, subject) {
        let abilityToUse = inflection.underscore(ability);
        const foundAbility = this.findAbility(abilityToUse, subject);
        if (foundAbility === undefined) {
            if (this.isReloading())
                return false;
            let subjectLabel = subject;
            // Translate resource-models into class name strings
            if (typeof subject == "function" && subject.modelClassData) {
                subjectLabel = digg(subject.modelClassData(), "name");
            }
            console.error(`Ability not loaded ${subjectLabel}#${abilityToUse}`, { abilities: this.abilities, ability, subject });
            return false;
        }
        else {
            return digg(foundAbility, "can");
        }
    }
    findAbility(ability, subject) {
        return this.abilities.find((abilityData) => {
            const abilityDataSubject = digg(abilityData, "subject");
            const abilityDataAbility = digg(abilityData, "ability");
            if (abilityDataAbility == ability) {
                // If actually same class
                if (abilityDataSubject == subject)
                    return true;
                // Sometimes in dev when using linking it will actually be two different but identical resource classes
                if (typeof subject == "function" &&
                    subject.modelClassData &&
                    typeof abilityDataSubject == "function" &&
                    abilityDataSubject.modelClassData &&
                    digg(subject.modelClassData(), "name") == digg(abilityDataSubject.modelClassData(), "name")) {
                    return true;
                }
            }
            return false;
        });
    }
    isAbilityLoaded(ability, subject) {
        const foundAbility = this.findAbility(ability, subject);
        if (foundAbility !== undefined) {
            return true;
        }
        return false;
    }
    isReloading() {
        return this.loadingCount > 0;
    }
    async loadAbilities(abilities) {
        try {
            await this.lock.read(async () => {
                const promises = [];
                for (const abilityData of abilities) {
                    const subject = abilityData[0];
                    if (!subject)
                        throw new Error(`Invalid subject given in abilities: ${subject} - ${JSON.stringify(abilities)}`);
                    if (!Array.isArray(abilityData[1]))
                        throw new Error(`Expected an array of abilities but got: ${typeof abilityData[1]}: ${abilityData[1]}`);
                    for (const ability of abilityData[1]) {
                        const promise = this.loadAbility(ability, subject);
                        promises.push(promise);
                    }
                }
                await Promise.all(promises);
            });
        }
        finally {
            if (this.loadingCount > 0)
                this.loadingCount -= 1;
        }
    }
    loadAbility(ability, subject) {
        return new Promise((resolve) => {
            const normalizedAbility = inflection.underscore(ability);
            if (this.isAbilityLoaded(normalizedAbility, subject)) {
                resolve();
                return;
            }
            const foundAbility = this.abilitiesToLoad.find((abilityToLoad) => digg(abilityToLoad, "ability") == normalizedAbility &&
                digg(abilityToLoad, "subject") == subject);
            if (foundAbility) {
                foundAbility.callbacks.push(resolve);
            }
            else {
                this.abilitiesToLoad.push({ ability: normalizedAbility, callbacks: [resolve], subject });
                this.abilitiesToLoadData.push({ ability: normalizedAbility, subject });
                this.queueAbilitiesRequest();
            }
        });
    }
    queueAbilitiesRequest() {
        if (this.queueAbilitiesRequestTimeout) {
            clearTimeout(this.queueAbilitiesRequestTimeout);
        }
        this.queueAbilitiesRequestTimeout = setTimeout(this.sendAbilitiesRequest, 0);
    }
    async resetAbilities() {
        await this.lock.write(() => {
            this.abilities = [];
            this.abilitiesGeneration += 1;
            this.loadingCount += 1;
        });
        this.events.emit("onResetAbilities");
    }
    sendAbilitiesRequest = async () => {
        const generation = this.abilitiesGeneration;
        const abilitiesToLoad = this.abilitiesToLoad;
        const abilitiesToLoadData = this.abilitiesToLoadData;
        this.abilitiesToLoad = [];
        this.abilitiesToLoadData = [];
        // Load abilities from backend
        const result = await Services.current().sendRequest("CanCan::LoadAbilities", {
            request: abilitiesToLoadData
        });
        const abilities = digg(result, "abilities");
        if (generation !== this.abilitiesGeneration) {
            for (const abilityData of abilitiesToLoad) {
                for (const callback of abilityData.callbacks) {
                    callback();
                }
            }
            return;
        }
        // Set the loaded abilities
        this.abilities = this.abilities.concat(abilities);
        // Call the callbacks that are waiting for the ability to have been loaded
        for (const abilityData of abilitiesToLoad) {
            for (const callback of abilityData.callbacks) {
                callback();
            }
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuLWNhbi5qcyIsInNvdXJjZVJvb3QiOiIvc3JjLyIsInNvdXJjZXMiOlsiY2FuLWNhbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpQ0FBaUM7QUFDakMsT0FBTyxLQUFLLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFDeEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUMxQyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxZQUFZLENBQUE7QUFDNUMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLFFBQVEsTUFBTSxlQUFlLENBQUE7QUFFcEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBRWpCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBYztJQUNqQyxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBQ2QsZUFBZSxHQUFHLEVBQUUsQ0FBQTtJQUNwQixtQkFBbUIsR0FBRyxFQUFFLENBQUE7SUFDeEIsbUJBQW1CLEdBQUcsQ0FBQyxDQUFBO0lBQ3ZCLFlBQVksR0FBRyxDQUFDLENBQUE7SUFDaEIsTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7SUFDM0IsSUFBSSxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQTtJQUU5QixNQUFNLENBQUMsT0FBTztRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCO1lBQUUsTUFBTSxDQUFDLHFCQUFxQixHQUFHLElBQUksY0FBYyxFQUFFLENBQUE7UUFFdEYsT0FBTyxNQUFNLENBQUMscUJBQXFCLENBQUE7SUFDckMsQ0FBQztJQUVELEdBQUcsQ0FBRSxPQUFPLEVBQUUsT0FBTztRQUNuQixJQUFJLFlBQVksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBRTVELElBQUksWUFBWSxLQUFLLFNBQVMsRUFB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QUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQTtRQUVwRCxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQTtRQUN6QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFBO1FBRTdCLDhCQUE4QjtRQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUU7WUFDM0UsT0FBTyxFQUFFLG1CQUFtQjtTQUM3QixDQUFDLENBQUE7UUFDRixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBRTNDLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzVDLEtBQUssTUFBTSxXQUFXLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQzFDLEtBQUssTUFBTSxRQUFRLElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUM3QyxRQUFRLEVBQUUsQ0FBQTtnQkFDWixDQUFDO1lBQ0gsQ0FBQztZQUVELE9BQU07UUFDUixDQUFDO1FBRUQsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFakQsMEVBQTBFO1FBQzFFLEtBQUssTUFBTSxXQUFXLElBQUksZUFBZSxFQUFFLENBQUM7WUFDMUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzdDLFFBQVEsRUFBRSxDQUFBO1lBQ1osQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHNvcnQtaW1wb3J0cyAqL1xuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSBcImV2ZW50ZW1pdHRlcjNcIlxuaW1wb3J0IHtSZWFkZXJzV3JpdGVyTG9ja30gZnJvbSBcImVwaWMtbG9ja3NcIlxuaW1wb3J0IHtkaWdnfSBmcm9tIFwiZGlnZ2VyaXplXCJcbmltcG9ydCBTZXJ2aWNlcyBmcm9tIFwiLi9zZXJ2aWNlcy5qc1wiXG5cbmNvbnN0IHNoYXJlZCA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwaU1ha2VyQ2FuQ2FuIHtcbiAgYWJpbGl0aWVzID0gW11cbiAgYWJpbGl0aWVzVG9Mb2FkID0gW11cbiAgYWJpbGl0aWVzVG9Mb2FkRGF0YSA9IFtdXG4gIGFiaWxpdGllc0dlbmVyYXRpb24gPSAwXG4gIGxvYWRpbmdDb3VudCA9IDBcbiAgZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gIGxvY2sgPSBuZXcgUmVhZGVyc1dyaXRlckxvY2soKVxuXG4gIHN0YXRpYyBjdXJyZW50ICgpIHtcbiAgICBpZiAoIXNoYXJlZC5jdXJyZW50QXBpTWFrZXJDYW5DYW4pIHNoYXJlZC5jdXJyZW50QXBpTWFrZXJDYW5DYW4gPSBuZXcgQXBpTWFrZXJDYW5DYW4oKVxuXG4gICAgcmV0dXJuIHNoYXJlZC5jdXJyZW50QXBpTWFrZXJDYW5DYW5cbiAgfVxuXG4gIGNhbiAoYWJpbGl0eSwgc3ViamVjdCkge1xuICAgIGxldCBhYmlsaXR5VG9Vc2UgPSBpbmZsZWN0aW9uLnVuZGVyc2NvcmUoYWJpbGl0eSlcbiAgICBjb25zdCBmb3VuZEFiaWxpdHkgPSB0aGlzLmZpbmRBYmlsaXR5KGFiaWxpdHlUb1VzZSwgc3ViamVjdClcblxuICAgIGlmIChmb3VuZEFiaWxpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuaXNSZWxvYWRpbmcoKSkgcmV0dXJuIGZhbHNlXG5cbiAgICAgIGxldCBzdWJqZWN0TGFiZWwgPSBzdWJqZWN0XG5cbiAgICAgIC8vIFRyYW5zbGF0ZSByZXNvdXJjZS1tb2RlbHMgaW50byBjbGFzcyBuYW1lIHN0cmluZ3NcbiAgICAgIGlmICh0eXBlb2Ygc3ViamVjdCA9PSBcImZ1bmN0aW9uXCIgJiYgc3ViamVjdC5tb2RlbENsYXNzRGF0YSkge1xuICAgICAgICBzdWJqZWN0TGFiZWwgPSBkaWdnKHN1YmplY3QubW9kZWxDbGFzc0RhdGEoKSwgXCJuYW1lXCIpXG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUuZXJyb3IoYEFiaWxpdHkgbm90IGxvYWRlZCAke3N1YmplY3RMYWJlbH0jJHthYmlsaXR5VG9Vc2V9YCwge2FiaWxpdGllczogdGhpcy5hYmlsaXRpZXMsIGFiaWxpdHksIHN1YmplY3R9KVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRpZ2coZm91bmRBYmlsaXR5LCBcImNhblwiKVxuICAgIH1cbiAgfVxuXG4gIGZpbmRBYmlsaXR5IChhYmlsaXR5LCBzdWJqZWN0KSB7XG4gICAgcmV0dXJuIHRoaXMuYWJpbGl0aWVzLmZpbmQoKGFiaWxpdHlEYXRhKSA9PiB7XG4gICAgICBjb25zdCBhYmlsaXR5RGF0YVN1YmplY3QgPSBkaWdnKGFiaWxpdHlEYXRhLCBcInN1YmplY3RcIilcbiAgICAgIGNvbnN0IGFiaWxpdHlEYXRhQWJpbGl0eSA9IGRpZ2coYWJpbGl0eURhdGEsIFwiYWJpbGl0eVwiKVxuXG4gICAgICBpZiAoYWJpbGl0eURhdGFBYmlsaXR5ID09IGFiaWxpdHkpIHtcbiAgICAgICAgLy8gSWYgYWN0dWFsbHkgc2FtZSBjbGFzc1xuICAgICAgICBpZiAoYWJpbGl0eURhdGFTdWJqZWN0ID09IHN1YmplY3QpIHJldHVybiB0cnVlXG5cbiAgICAgICAgLy8gU29tZXRpbWVzIGluIGRldiB3aGVuIHVzaW5nIGxpbmtpbmcgaXQgd2lsbCBhY3R1YWxseSBiZSB0d28gZGlmZmVyZW50IGJ1dCBpZGVudGljYWwgcmVzb3VyY2UgY2xhc3Nlc1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdHlwZW9mIHN1YmplY3QgPT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgc3ViamVjdC5tb2RlbENsYXNzRGF0YSAmJlxuICAgICAgICAgIHR5cGVvZiBhYmlsaXR5RGF0YVN1YmplY3QgPT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgYWJpbGl0eURhdGFTdWJqZWN0Lm1vZGVsQ2xhc3NEYXRhICYmXG4gICAgICAgICAgZGlnZyhzdWJqZWN0Lm1vZGVsQ2xhc3NEYXRhKCksIFwibmFtZVwiKSA9PSBkaWdnKGFiaWxpdHlEYXRhU3ViamVjdC5tb2RlbENsYXNzRGF0YSgpLCBcIm5hbWVcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgaXNBYmlsaXR5TG9hZGVkIChhYmlsaXR5LCBzdWJqZWN0KSB7XG4gICAgY29uc3QgZm91bmRBYmlsaXR5ID0gdGhpcy5maW5kQWJpbGl0eShhYmlsaXR5LCBzdWJqZWN0KVxuXG4gICAgaWYgKGZvdW5kQWJpbGl0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaXNSZWxvYWRpbmcgKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRpbmdDb3VudCA+IDBcbiAgfVxuXG4gIGFzeW5jIGxvYWRBYmlsaXRpZXMgKGFiaWxpdGllcykge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmxvY2sucmVhZChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW11cblxuICAgICAgICBmb3IgKGNvbnN0IGFiaWxpdHlEYXRhIG9mIGFiaWxpdGllcykge1xuICAgICAgICAgIGNvbnN0IHN1YmplY3QgPSBhYmlsaXR5RGF0YVswXVxuXG4gICAgICAgICAgaWYgKCFzdWJqZWN0KSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc3ViamVjdCBnaXZlbiBpbiBhYmlsaXRpZXM6ICR7c3ViamVjdH0gLSAke0pTT04uc3RyaW5naWZ5KGFiaWxpdGllcyl9YClcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWJpbGl0eURhdGFbMV0pKSB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGFuIGFycmF5IG9mIGFiaWxpdGllcyBidXQgZ290OiAke3R5cGVvZiBhYmlsaXR5RGF0YVsxXX06ICR7YWJpbGl0eURhdGFbMV19YClcblxuICAgICAgICAgIGZvciAoY29uc3QgYWJpbGl0eSBvZiBhYmlsaXR5RGF0YVsxXSkge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMubG9hZEFiaWxpdHkoYWJpbGl0eSwgc3ViamVjdClcblxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHRoaXMubG9hZGluZ0NvdW50ID4gMCkgdGhpcy5sb2FkaW5nQ291bnQgLT0gMVxuICAgIH1cbiAgfVxuXG4gIGxvYWRBYmlsaXR5IChhYmlsaXR5LCBzdWJqZWN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBub3JtYWxpemVkQWJpbGl0eSA9IGluZmxlY3Rpb24udW5kZXJzY29yZShhYmlsaXR5KVxuXG4gICAgICBpZiAodGhpcy5pc0FiaWxpdHlMb2FkZWQobm9ybWFsaXplZEFiaWxpdHksIHN1YmplY3QpKSB7XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgZm91bmRBYmlsaXR5ID0gdGhpcy5hYmlsaXRpZXNUb0xvYWQuZmluZCgoYWJpbGl0eVRvTG9hZCkgPT4gZGlnZyhhYmlsaXR5VG9Mb2FkLCBcImFiaWxpdHlcIikgPT0gbm9ybWFsaXplZEFiaWxpdHkgJiZcbiAgICAgICAgZGlnZyhhYmlsaXR5VG9Mb2FkLCBcInN1YmplY3RcIikgPT0gc3ViamVjdFxuICAgICAgKVxuXG4gICAgICBpZiAoZm91bmRBYmlsaXR5KSB7XG4gICAgICAgIGZvdW5kQWJpbGl0eS5jYWxsYmFja3MucHVzaChyZXNvbHZlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hYmlsaXRpZXNUb0xvYWQucHVzaCh7YWJpbGl0eTogbm9ybWFsaXplZEFiaWxpdHksIGNhbGxiYWNrczogW3Jlc29sdmVdLCBzdWJqZWN0fSlcbiAgICAgICAgdGhpcy5hYmlsaXRpZXNUb0xvYWREYXRhLnB1c2goe2FiaWxpdHk6IG5vcm1hbGl6ZWRBYmlsaXR5LCBzdWJqZWN0fSlcblxuICAgICAgICB0aGlzLnF1ZXVlQWJpbGl0aWVzUmVxdWVzdCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHF1ZXVlQWJpbGl0aWVzUmVxdWVzdCAoKSB7XG4gICAgaWYgKHRoaXMucXVldWVBYmlsaXRpZXNSZXF1ZXN0VGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucXVldWVBYmlsaXRpZXNSZXF1ZXN0VGltZW91dClcbiAgICB9XG5cbiAgICB0aGlzLnF1ZXVlQWJpbGl0aWVzUmVxdWVzdFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuc2VuZEFiaWxpdGllc1JlcXVlc3QsIDApXG4gIH1cblxuICBhc3luYyByZXNldEFiaWxpdGllcyAoKSB7XG4gICAgYXdhaXQgdGhpcy5sb2NrLndyaXRlKCgpID0+IHtcbiAgICAgIHRoaXMuYWJpbGl0aWVzID0gW11cbiAgICAgIHRoaXMuYWJpbGl0aWVzR2VuZXJhdGlvbiArPSAxXG4gICAgICB0aGlzLmxvYWRpbmdDb3VudCArPSAxXG4gICAgfSlcbiAgICB0aGlzLmV2ZW50cy5lbWl0KFwib25SZXNldEFiaWxpdGllc1wiKVxuICB9XG5cbiAgc2VuZEFiaWxpdGllc1JlcXVlc3QgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgZ2VuZXJhdGlvbiA9IHRoaXMuYWJpbGl0aWVzR2VuZXJhdGlvblxuICAgIGNvbnN0IGFiaWxpdGllc1RvTG9hZCA9IHRoaXMuYWJpbGl0aWVzVG9Mb2FkXG4gICAgY29uc3QgYWJpbGl0aWVzVG9Mb2FkRGF0YSA9IHRoaXMuYWJpbGl0aWVzVG9Mb2FkRGF0YVxuXG4gICAgdGhpcy5hYmlsaXRpZXNUb0xvYWQgPSBbXVxuICAgIHRoaXMuYWJpbGl0aWVzVG9Mb2FkRGF0YSA9IFtdXG5cbiAgICAvLyBMb2FkIGFiaWxpdGllcyBmcm9tIGJhY2tlbmRcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBTZXJ2aWNlcy5jdXJyZW50KCkuc2VuZFJlcXVlc3QoXCJDYW5DYW46OkxvYWRBYmlsaXRpZXNcIiwge1xuICAgICAgcmVxdWVzdDogYWJpbGl0aWVzVG9Mb2FkRGF0YVxuICAgIH0pXG4gICAgY29uc3QgYWJpbGl0aWVzID0gZGlnZyhyZXN1bHQsIFwiYWJpbGl0aWVzXCIpXG5cbiAgICBpZiAoZ2VuZXJhdGlvbiAhPT0gdGhpcy5hYmlsaXRpZXNHZW5lcmF0aW9uKSB7XG4gICAgICBmb3IgKGNvbnN0IGFiaWxpdHlEYXRhIG9mIGFiaWxpdGllc1RvTG9hZCkge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIGFiaWxpdHlEYXRhLmNhbGxiYWNrcykge1xuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGxvYWRlZCBhYmlsaXRpZXNcbiAgICB0aGlzLmFiaWxpdGllcyA9IHRoaXMuYWJpbGl0aWVzLmNvbmNhdChhYmlsaXRpZXMpXG5cbiAgICAvLyBDYWxsIHRoZSBjYWxsYmFja3MgdGhhdCBhcmUgd2FpdGluZyBmb3IgdGhlIGFiaWxpdHkgdG8gaGF2ZSBiZWVuIGxvYWRlZFxuICAgIGZvciAoY29uc3QgYWJpbGl0eURhdGEgb2YgYWJpbGl0aWVzVG9Mb2FkKSB7XG4gICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIGFiaWxpdHlEYXRhLmNhbGxiYWNrcykge1xuICAgICAgICBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=