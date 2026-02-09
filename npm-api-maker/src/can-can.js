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
  abilitiesByName = new Map()

  static current () {
    if (!shared.currentApiMakerCanCan) shared.currentApiMakerCanCan = new ApiMakerCanCan()

    return shared.currentApiMakerCanCan
  }

  can (ability, subject, options = {}) {
    const foundAbility = this.findAbility(ability, subject)

    if (foundAbility === undefined) {
      const normalizedAbility = inflection.underscore(ability)
      this.recordMissingAbility(normalizedAbility, subject)

      if (options.debug) {
        let subjectLabel = subject

        // Translate resource-models into class name strings
        if (typeof subject == "function" && subject.modelClassData) {
          subjectLabel = digg(subject.modelClassData(), "name")
        }

        console.error(`Ability not loaded ${subjectLabel}#${normalizedAbility}`, {abilities: this.abilities, ability, subject})
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
    const abilityKey = this.abilityKey(ability, subject)
    if (!abilityKey) return undefined

    return this.abilitiesByName.get(abilityKey)
  }

  isAbilityLoaded (ability, subject) {
    return this.findAbility(ability, subject) !== undefined
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
        this.abilitiesByName = new Map()
        this.abilitiesGeneration += 1
        this.resettingGeneration = this.abilitiesGeneration
        this.cacheKey += 1
      })
      console.log(`[can-can-debug] resetAbilities generation=${this.abilitiesGeneration}; cacheKey=${this.cacheKey}`)
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
    console.log(`[can-can-debug] sendAbilitiesRequest:start generation=${generation}; queued=${abilitiesToLoadData.length}`)

    let abilities = []
    let didFail = false
    let requestError

    // Load abilities from backend
    try {
      const result = await Services.current().sendRequest("CanCan::LoadAbilities", {
        request: abilitiesToLoadData
      }, {instant: true})
      const responseAbilities = digg(result, "abilities")

      if (Array.isArray(responseAbilities)) abilities = responseAbilities
    } catch (error) {
      didFail = true
      requestError = error
      console.error("Failed to load abilities", error)
    }

    if (generation !== this.abilitiesGeneration) {
      const staleResponseDebug = [
        "[can-can-debug] sendAbilitiesRequest:stale-response",
        `requestGeneration=${generation}`,
        `currentGeneration=${this.abilitiesGeneration}`,
        `requeue=${abilitiesToLoad.length}`
      ].join("; ")
      console.log(staleResponseDebug)
      for (const abilityData of abilitiesToLoad) {
        for (const callback of abilityData.callbacks) {
          this.loadAbility(abilityData.ability, abilityData.subject).then(callback)
        }
      }

      return
    }

    if (didFail) {
      console.log(`[can-can-debug] sendAbilitiesRequest:failed generation=${generation}; queued=${abilitiesToLoad.length}`)
      for (const abilityData of abilitiesToLoad) {
        for (const callback of abilityData.callbacks) {
          callback()
        }
      }

      // Resolve callbacks to avoid deadlocks for waiters even when load failed.
      if (requestError) this.reportUnhandledAsyncError(requestError)
      return
    }

    // Set the loaded abilities
    this.abilities = this.abilities.concat(abilities)
    this.indexAbilitiesByName(abilities)
    this.cacheKey += 1
    console.log(
      `[can-can-debug] sendAbilitiesRequest:success generation=${generation}; loaded=${abilities.length}; cacheKey=${this.cacheKey}`
    )
    this.events.emit("onAbilitiesLoaded", {cacheKey: this.cacheKey})

    // Call the callbacks that are waiting for the ability to have been loaded
    for (const abilityData of abilitiesToLoad) {
      for (const callback of abilityData.callbacks) {
        callback()
      }
    }
  }

  indexAbilitiesByName (abilities) {
    for (const abilityData of abilities) {
      if (abilityData && typeof abilityData == "object") {
        const abilityKey = this.abilityKey(digg(abilityData, "ability"), digg(abilityData, "subject"))

        if (abilityKey) {
          this.abilitiesByName.set(abilityKey, abilityData)
        }
      }
    }
  }

  abilityKey (ability, subject) {
    if (!ability) return null

    const subjectName = this.subjectName(subject)
    if (!subjectName) return null

    return `${inflection.underscore(ability)}:${subjectName}`
  }

  subjectName (subject) {
    if (!subject) return null

    if (typeof subject == "string") {
      return subject
    }

    if (subject.modelClassData) {
      return digg(subject.modelClassData(), "name")
    }

    if (subject.resourceData) {
      return digg(subject.resourceData(), "name")
    }

    if (subject.name) {
      return subject.name
    }

    return null
  }

  reportUnhandledAsyncError (error) {
    if (!error) return

    Promise.reject(error)
  }
}
