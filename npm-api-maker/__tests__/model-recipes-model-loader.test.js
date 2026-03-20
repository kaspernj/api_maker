import ApiMakerModelRecipesModelLoader from "../src/model-recipes-model-loader.js"
import {jest} from "@jest/globals"

describe("ApiMakerModelRecipesModelLoader", () => {
  it("merges command args into generated collection and member command calls", () => {
    const modelRecipe = {
      attributes: {},
      collection_commands: {
        test_collection: {
          args: {cacheResponse: true},
          name: "test_collection"
        }
      },
      member_commands: {
        test_member: {
          args: {cacheResponse: true},
          name: "test_member"
        }
      },
      model_class_data: {
        collectionName: "tasks",
        name: "Task"
      },
      relationships: {}
    }
    const loader = new ApiMakerModelRecipesModelLoader({
      modelRecipe,
      modelRecipesLoader: {getModelClass: () => null}
    })
    const ModelClass = loader.createClass()
    const model = new ModelClass()
    const callCollectionCommand = jest.spyOn(ModelClass, "_callCollectionCommand").mockImplementation(() => {})
    const callMemberCommand = jest.fn()

    model.primaryKey = () => 123
    model._callMemberCommand = callMemberCommand

    ModelClass.testCollection({name: "Example"}, {instant: true})
    model.testMember({name: "Example"}, {instant: true})

    expect(callCollectionCommand).toHaveBeenCalledWith(
      {
        args: {name: "Example"},
        collectionName: "tasks",
        command: "test_collection",
        type: "collection"
      },
      {
        cacheResponse: true,
        instant: true
      }
    )
    expect(callMemberCommand).toHaveBeenCalledWith(
      {
        args: {name: "Example"},
        collectionName: "tasks",
        command: "test_member",
        primaryKey: 123,
        type: "member"
      },
      {
        cacheResponse: true,
        instant: true
      }
    )
  })
})
