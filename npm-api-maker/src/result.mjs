export default class ApiMakerResult {
  constructor (data) {
    this.data = data
  }

  count = () => this.data.response.meta.count
  currentPage = () => this.data.response.meta.currentPage
  models = () => this.data.models
  modelClass = () => this.data.collection.modelClass()
  perPage = () => this.data.response.meta.perPage
  totalCount = () => this.data.response.meta.totalCount
  totalPages = () => this.data.response.meta.totalPages
}
