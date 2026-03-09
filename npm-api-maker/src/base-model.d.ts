import ApiMakerCollection from "./collection.js"
import Attribute from "./base-model/attribute.js"
import Reflection from "./base-model/reflection.js"
import Scope from "./base-model/scope.js"

export type ModelClassDataType = {
  attributes: Record<string, import("./base-model/attribute.js").AttributeArgType>
  camelizedLower: string
  className: string
  collectionKey: string
  collectionName: string
  i18nKey: string
  name: string
  nameDasherized: string
  paramKey: string
  pluralName: string
  primaryKey: string
  ransackable_associations: Array<Record<string, any>>
  ransackable_attributes: import("./base-model/attribute.js").AttributeArgType[]
  ransackable_scopes: Array<Record<string, any>>
  relationships: Array<Record<string, any>>
}

export default class BaseModel {
  static apiMakerType: string

  static attributes(): Attribute[]
  static hasAttribute(attributeName: string): boolean
  static modelClassData(): ModelClassDataType
  static modelName(): import("./model-name.js").default
  static primaryKey(): string

  static find<T extends typeof BaseModel>(this: T, id: number | string): Promise<InstanceType<T>>
  static all<T extends typeof BaseModel>(this: T): ApiMakerCollection<T>
  static ransack<T extends typeof BaseModel>(this: T, query?: Record<string, any>): ApiMakerCollection<T>
  static select<T extends typeof BaseModel>(this: T, select?: Record<string, any>): ApiMakerCollection<T>

  static ransackableAssociations(): Reflection[]
  static ransackableAttributes(): Attribute[]
  static ransackableScopes(): Scope[]
  static reflections(): Reflection[]
  static reflection(name: string): Reflection

  static _callCollectionCommand(args: {
    args: Record<string, any> | HTMLFormElement | FormData
    command: string
    collectionName: string
    type: "collection"
  }, commandArgs?: Record<string, any>): Promise<any>

  changes: Record<string, any>
  newRecord?: boolean
  relationshipsCache: Record<string, any>
  relationships: Record<string, any>
  abilities: Record<string, any>
  modelData: Record<string, any>

  constructor(args?: {
    isNewRecord?: boolean
    data?: object
    a?: Record<string, any>
    b?: Record<string, any>
    collection?: ApiMakerCollection<any>
  })

  modelClass(): typeof BaseModel
  modelClassData(): ModelClassDataType

  readAttributeUnderscore(attributeName: string): any
  _isPresent(value: any): boolean
  _callMemberCommand(args: {
    args: Record<string, any> | HTMLFormElement | FormData
    command: string
    primaryKey: string | number
    collectionName: string
    type: "member"
  }, commandArgs?: Record<string, any>): Promise<any>

  _readBelongsToReflection<AssocMC extends typeof BaseModel>(args: {
    reflectionName: string
    modelClass: AssocMC
  }): InstanceType<AssocMC> | null

  _loadBelongsToReflection<AssocMC extends typeof BaseModel>(args: {
    reflectionName: string
    model: this
    modelClass: AssocMC
  }, queryArgs?: Record<string, any>): Promise<InstanceType<AssocMC> | null>

  _readHasOneReflection<AssocMC extends typeof BaseModel>(args: {
    reflectionName: string
    modelClass: AssocMC
  }): InstanceType<AssocMC> | null

  _loadHasOneReflection<AssocMC extends typeof BaseModel>(args: {
    reflectionName: string
    model: this
    modelClass: AssocMC
  }, queryArgs?: Record<string, any>): Promise<InstanceType<AssocMC> | null>

  _loadHasManyReflection<AssocMC extends typeof BaseModel>(args: {
    reflectionName: string
    model: this
    modelClass: AssocMC
  }, queryArgs?: Record<string, any>): Promise<Array<InstanceType<AssocMC>>>

  primaryKey(): string | number
}
