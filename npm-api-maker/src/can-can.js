import Services from "./services"

export default class ApiMakerCanCan {
  static current() {
    if (!window.currentApiMakerCanCan) {
      window.currentApiMakerCanCan = new ApiMakerCanCan()
    }

    return window.currentApiMakerCanCan
  }

  constructor() {
    this.abilities = {}
    this.abilitiesToLoad = {}
    this.abilitiesToLoadData = {}
  }

  can(subject, ability) {
    if (!(subject in this.abilities)) {
      throw new Error(`Subject wasn't loaded: ${subject}`)
    }

    if (!(ability in this.abilities[subject])) {
      throw new Error(`Ability wasn't loaded: ${subject}#${ability}`)
    }

    return this.abilities[subject][ability]
  }

  async loadAbilities(abilities) {
    return new Promise((resolve) => {
      const promises = []

      for (const subject in abilities) {
        for (const ability of abilities[subject]) {
          const promise = this.loadAbility(ability, subject)
          promises.push(promise)
        }
      }

      Promise.all(promises).then(() => resolve())
    })
  }

  async loadAbility(ability, subject) {
    return new Promise((resolve) => {
      if (!this.abilitiesToLoad[subject]) {
        this.abilitiesToLoad[subject] = {}
      }

      if (!this.abilitiesToLoad[subject][ability]) {
        this.abilitiesToLoad[subject][ability] = []
      }

      if (!this.abilitiesToLoadData[subject]) {
        this.abilitiesToLoadData[subject] = []
      }

      this.abilitiesToLoadData[subject].push(ability)
      this.abilitiesToLoad[subject][ability].push({callback: resolve})

      this.queueAbilitiesRequest()
    })
  }

  queueAbilitiesRequest() {
    if (this.queueAbilitiesRequestTimeout) {
      clearTimeout(this.queueAbilitiesRequestTimeout)
    }

    this.queueAbilitiesRequestTimeout = setTimeout(() => this.sendAbilitiesRequest(), 0)
  }

  async sendAbilitiesRequest() {
    const abilitiesToLoad = this.abilitiesToLoad
    const abilitiesToLoadData = this.abilitiesToLoadData

    this.abilitiesToLoad = {}
    this.abilitiesToLoadData = {}

    // Load abilities from backend
    const result = await Services.current().sendRequest("CanCan::LoadAbilities", {
      request: abilitiesToLoadData
    })

    // Set the loaded abilities
    const callbacks = []
    for (const subjectName in result.abilities) {
      if (!(subjectName in this.abilities)) {
        this.abilities[subjectName] = {}
      }

      for (const abilityName in result.abilities[subjectName]) {
        this.abilities[subjectName][abilityName] = result.abilities[subjectName][abilityName]

        for (const abilityData of abilitiesToLoad[subjectName][abilityName]) {
          callbacks.push(abilityData.callback)
        }
      }
    }

    // Call the callbacks that are waiting for the ability to have been loaded
    for (const callback of callbacks) {
      callback()
    }
  }
}
