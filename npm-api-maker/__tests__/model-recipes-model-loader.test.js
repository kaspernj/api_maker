import ApiMakerModelRecipesModelLoader from "../src/model-recipes-model-loader.js"
import {jest} from "@jest/globals"

describe("ApiMakerModelRecipesModelLoader", () => {
  it("defines ensure helpers for runtime recipe relationships", async() => {
    const modelRecipe = {
      attributes: {},
      collection_commands: {},
      member_commands: {},
      model_class_data: {
        collectionName: "users",
        name: "User"
      },
      relationships: {
        account: {
          active_record: {name: "User", primary_key: "id"},
          class_name: "Account",
          foreign_key: "account_id",
          klass: {primary_key: "id"},
          options: {as: null, primary_key: null, through: null},
          resource_name: "Account",
          type: "belongs_to"
        }
      }
    }
    const loader = new ApiMakerModelRecipesModelLoader({
      modelRecipe,
      modelRecipesLoader: {getModelClass: () => null}
    })
    const ModelClass = loader.createClass()
    const model = new ModelClass()
    const ensureAssociationLoadedSpy = jest.spyOn(model, "ensureAssociationLoaded").mockResolvedValue({id: 5})

    await expect(model.ensureAccountLoaded()).resolves.toEqual({id: 5})
    expect(ensureAssociationLoadedSpy).toHaveBeenCalledWith("account")
  })

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
