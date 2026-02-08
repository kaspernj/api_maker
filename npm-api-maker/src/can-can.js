/* eslint-disable sort-imports */
import * as inflection from "inflection"
import {EventEmitter} from "eventemitter3"
import {ReadersWriterLock} from "epic-locks"
import {digg} from "diggerize"
import Services from "./services.js"

const shared = {}

export default class ApiMakerCanCan {
  abilities = []
  abilitiesToLoad = []
  abilitiesToLoadData = []
  abilitiesGeneration = 0
  cacheKey = 0
  loadingCount = 0
  missingAbilities = new Map()
  missingAbilitiesTimeout = null
  reloadPromises = new Map()
  resetPromise = null
  resettingGeneration = null
  events = new EventEmitter()
  lock = new ReadersWriterLock()

  static current () {
    if (!shared.currentApiMakerCanCan) shared.currentApiMakerCanCan = new ApiMakerCanCan()

    return shared.currentApiMakerCanCan
  }

  can (ability, subject, options = {}) {
    let abilityToUse = inflection.underscore(ability)
    const foundAbility = this.findAbility(abilityToUse, subject)

    if (foundAbility === undefined) {
      this.recordMissingAbility(abilityToUse, subject)

      if (options.debug) {
        let subjectLabel = subject

        // Translate resource-models into class name strings
        if (typeof subject == "function" && subject.modelClassData) {
          subjectLabel = digg(subject.modelClassData(), "name")
        }

        console.error(`Ability not loaded ${subjectLabel}#${abilityToUse}`, {abilities: this.abilities, ability, subject})
      }

      return null
    } else {
      return digg(foundAbility, "can")
    }
  }

  recordMissingAbility (ability, subject) {
    let missingAbilitySet = this.missingAbilities.get(subject)

    if (!missingAbilitySet) {
      missingAbilitySet = new Set()
      this.missingAbilities.set(subject, missingAbilitySet)
    }

    if (missingAbilitySet.has(ability)) return

    missingAbilitySet.add(ability)
    this.queueMissingAbilitiesLoad()
  }

  queueMissingAbilitiesLoad () {
    if (this.missingAbilitiesTimeout) return

    this.missingAbilitiesTimeout = setTimeout(this.loadMissingAbilities, 0)
  }

  loadMissingAbilities = () => {
    const missingAbilities = this.missingAbilities

    this.missingAbilities = new Map()
    this.missingAbilitiesTimeout = null

    const abilitiesToLoad = []

    for (const [subject, abilities] of missingAbilities.entries()) {
      abilitiesToLoad.push([subject, Array.from(abilities)])
    }

    if (abilitiesToLoad.length > 0) {
      this.loadAbilities(abilitiesToLoad)
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

  isReloading () {
    return this.loadingCount > 0 || this.resettingGeneration !== null
  }

  getCacheKey () {
    return this.cacheKey
  }

  async loadAbilities (abilities) {
    const generation = this.abilitiesGeneration

    this.loadingCount += 1

    try {
      await this.lock.read(async () => {
        const promises = []

        for (const abilityData of abilities) {
          const subject = abilityData[0]

          if (!subject) throw new Error(`Invalid subject given in abilities: ${subject} - ${JSON.stringify(abilities)}`)
          if (!Array.isArray(abilityData[1])) throw new Error(`Expected an array of abilities but got: ${typeof abilityData[1]}: ${abilityData[1]}`)

          for (const ability of abilityData[1]) {
            const promise = this.loadAbility(ability, subject)

            promises.push(promise)
          }
        }

        await Promise.all(promises)
      })
    } finally {
      if (this.loadingCount > 0) this.loadingCount -= 1
      if (this.resettingGeneration === generation) this.resettingGeneration = null
    }
  }

  loadAbility (ability, subject) {
    return new Promise((resolve) => {
      const normalizedAbility = inflection.underscore(ability)

      if (this.isAbilityLoaded(normalizedAbility, subject)) {
        resolve()
        return
      }

      const foundAbility = this.abilitiesToLoad.find((abilityToLoad) => digg(abilityToLoad, "ability") == normalizedAbility &&
        digg(abilityToLoad, "subject") == subject
      )

      if (foundAbility) {
        foundAbility.callbacks.push(resolve)
      } else {
        this.abilitiesToLoad.push({ability: normalizedAbility, callbacks: [resolve], subject})
        this.abilitiesToLoadData.push({ability: normalizedAbility, subject})

        this.queueAbilitiesRequest()
      }
    })
  }

  queueAbilitiesRequest () {
    if (this.queueAbilitiesRequestTimeout) return

    this.queueAbilitiesRequestTimeout = setTimeout(this.sendAbilitiesRequest, 0)
  }

  async resetAbilities () {
    if (this.resetPromise) return this.resetPromise

    this.resetPromise = (async () => {
      await this.lock.write(() => {
        this.abilities = []
        this.abilitiesGeneration += 1
        this.resettingGeneration = this.abilitiesGeneration
        this.cacheKey += 1
      })
      this.events.emit("onResetAbilities")
    })()

    try {
      await this.resetPromise
    } finally {
      this.resetPromise = null
    }
  }

  async reloadAbilities (abilities, reloadKey) {
    if (reloadKey && this.reloadPromises.has(reloadKey)) {
      return this.reloadPromises.get(reloadKey)
    }

    const promise = (async () => {
      await this.resetAbilities()
      await this.loadAbilities(abilities)
    })()

    if (reloadKey) this.reloadPromises.set(reloadKey, promise)

    try {
      await promise
    } finally {
      if (reloadKey) this.reloadPromises.delete(reloadKey)
    }
  }

  sendAbilitiesRequest = async () => {
    this.queueAbilitiesRequestTimeout = null
    const generation = this.abilitiesGeneration
    const abilitiesToLoad = this.abilitiesToLoad
    const abilitiesToLoadData = this.abilitiesToLoadData

    this.abilitiesToLoad = []
    this.abilitiesToLoadData = []

    let abilities = []
    let didFail = false
    let loadError

    // Load abilities from backend
    try {
      const result = await Services.current().sendRequest("CanCan::LoadAbilities", {
        request: abilitiesToLoadData
      }, {instant: true})
      const responseAbilities = digg(result, "abilities")

      if (Array.isArray(responseAbilities)) abilities = responseAbilities
    } catch (error) {
      didFail = true
      loadError = error
      console.error("Failed to load abilities", error)
    }

    if (generation !== this.abilitiesGeneration || didFail) {
      if (didFail) {
        this.events.emit("onLoadAbilitiesFailed", {error: loadError})
      }

      for (const abilityData of abilitiesToLoad) {
        for (const callback of abilityData.callbacks) {
          callback()
        }
      }

      return
    }

    // Set the loaded abilities
    this.abilities = this.abilities.concat(abilities)
    this.cacheKey += 1
    this.events.emit("onAbilitiesLoaded", {cacheKey: this.cacheKey})

    // Call the callbacks that are waiting for the ability to have been loaded
    for (const abilityData of abilitiesToLoad) {
      for (const callback of abilityData.callbacks) {
        callback()
      }
    }
  }
}
