export default class Collection {
  static getCollection(params) {
    return new Collection(params)
  }

  constructor(args) {
    this.args = args
  }

  toArray(args) {
    var modelClass = require(this.args.modelName)
    var path = "/api_maker/" + params.modelName

    $.ajax({type: "GET", url: path, complete: (data) => {
      var parsed = $.parseJSON(data.responseText)

      var array = []
      for(var modelData in parsed.collection) {
        var modelInstance = new modelClass({"modelData": modelData})
        array.add(modelInstance)
      }

      args.success.call({result: array})
    }})
  }
}
