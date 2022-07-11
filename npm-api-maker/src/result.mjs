export default class ApiMakerResult {
  constructor (data) {
    this.data = data
  }

  currentPage () {
    return this.data.response.meta.currentPage
  }

  models () {
    return this.data.models
  }

  modelClass () {
    return this.data.collection.modelClass()
  }

  perPage () {
    return this.data.response.meta.perPage
  }

  totalCount () {
    return this.data.response.meta.totalCount
  }

  totalPages () {
    return this.data.response.meta.totalPages
  }
}
