export default class Collection {
  constructor(args) {
    if (args.ransack) {
      this.ransack = ransack
    } else {
      this.ransack = {}
    }
  }

  toArray(args) {
    var modelClass = require(this.args.modelName)
    var path = "/api_maker/" + params.modelName

    Rails.ajax({type: "GET", url: path, complete: (data) => {
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
