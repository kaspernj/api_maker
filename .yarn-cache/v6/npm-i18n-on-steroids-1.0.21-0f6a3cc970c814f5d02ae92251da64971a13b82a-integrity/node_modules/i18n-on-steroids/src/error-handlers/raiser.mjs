export default class ErrorHandlersRaiser {
  constructor(i18n) {
    this.i18n = i18n
  }

  handleError({error}) {
    throw error
  }
}
