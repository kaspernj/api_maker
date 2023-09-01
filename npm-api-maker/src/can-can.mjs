import {digg} from "diggerize"
import EventEmitter from "events"
import * as inflection from "inflection"
import {ReadersWriterLock} from "epic-locks"
import Services from "./services.mjs"

const shared = {}

export default class ApiMakerCanCan {
  abilities = []
  abilitiesToLoad = []
  abilitiesToLoadData = []
  events = new EventEmitter()
  lock = new ReadersWriterLock()

  static current () {
    if (!shared.currentApiMakerCanCan) shared.currentApiMakerCanCan = new ApiMakerCanCan()

    return shared.currentApiMakerCanCan
  }

  can (ability, subject) {
    let abilityToUse = inflection.underscore(ability)
    const foundAbility = this.findAbility(abilityToUse, subject)

    if (foundAbility === undefined) {
      let subjectLabel = subject

      // Translate resource-models into class name strings
      if (typeof subject == "function" && subject.modelClassData) {
        subjectLabel = digg(subject.modelClassData(), "name")
      }

      console.error(`Ability not loaded ${subjectLabel}#${abilityToUse}`, {abilities: this.abilities, ability, subject})

      return false
    } else {
      return digg(foundAbility, "can")
    }
  }

  findAbility (ability, subject) {
    return this.abilities.find((abilityData) => {
      const abilityDataSubject = digg(abilityData, "subject")
      const abilityDataAbility = digg(abilityData, "ability")

      if (abilityDataAbility == ability) {
        // If actually same class
        if (abilityDataSubject == subject) return true

        // Sometimes in dev when using linking it will actually be two different but identical resource classes
        if (
          typeof subject == "function" &&
          subject.modelClassData &&
          typeof abilityDataSubject == "function" &&
          abilityDataSubject.modelClassData &&
          digg(subject.modelClassData(), "name") == digg(abilityDataSubject.modelClassData(), "name")
        ) {
          return true
        }
      }

      return false
    })
  }

  isAbilityLoaded (ability, subject) {
    const foundAbility = this.findAbility(ability, subject)

    if (foundAbility !== undefined) {
      return true
    }

    return false
  }

  async loadAbilities (abilities) {
    await this.lock.read(async () => {
      const promises = []

      for (const abilityData of abilities) {
        const subject = abilityData[0]

        for (const ability of abilityData[1]) {
          const promise = this.loadAbility(ability, subject)

          promises.push(promise)
        }
      }

      await Promise.all(promises)
    })
  }

  loadAbility (ability, subject) {
    return new Promise((resolve) => {
      ability = inflection.underscore(ability)

      if (this.isAbilityLoaded(ability, subject)) {
        resolve()
        return
      }

      const foundAbility = this.abilitiesToLoad.find((abilityToLoad) => digg(abilityToLoad, "ability") == ability && digg(abilityToLoad, "subject") == subject)

      if (foundAbility) {
        foundAbility.callbacks.push(resolve)
      } else {
        this.abilitiesToLoad.push({ability, callbacks: [resolve], subject})
        this.abilitiesToLoadData.push({ability, subject})

        this.queueAbilitiesRequest()
      }
    })
  }

  queueAbilitiesRequest () {
    if (this.queueAbilitiesRequestTimeout) {
      clearTimeout(this.queueAbilitiesRequestTimeout)
    }

    this.queueAbilitiesRequestTimeout = setTimeout(() => this.sendAbilitiesRequest(), 0)
  }

  async resetAbilities () {
    await this.lock.write(() => {
      this.abilities = []
    })
    this.events.emit("onResetAbilities")
  }

  async sendAbilitiesRequest () {
    const abilitiesToLoad = this.abilitiesToLoad
    const abilitiesToLoadData = this.abilitiesToLoadData

    this.abilitiesToLoad = []
    this.abilitiesToLoadData = []

    // Load abilities from backend
    const result = await Services.current().sendRequest("CanCan::LoadAbilities", {
      request: abilitiesToLoadData
    })
    const abilities = digg(result, "abilities")

    // Set the loaded abilities
    this.abilities = this.abilities.concat(abilities)

    // Call the callbacks that are waiting for the ability to have been loaded
    for (const abilityData of abilitiesToLoad) {
      for (const callback of abilityData.callbacks) {
        callback()
      }
    }
  }
}
