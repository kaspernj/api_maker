import { digg } from "diggerize";
import Inflection from "inflection";
export default class ApiMakerModelPropType {
    static ofModel(modelClass) {
        const modelPropTypeInstance = new ApiMakerModelPropType();
        modelPropTypeInstance.withModelType(modelClass);
        return modelPropTypeInstance;
    }
    constructor() {
        this.isNotRequired = this.isNotRequired.bind(this);
        this.isRequired = this.isRequired.bind(this);
        this._withLoadedAssociations = {};
    }
    isNotRequired(props, propName, _componentName) {
        const model = props[propName];
        if (model) {
            return this.validate({ model, propName });
        }
    }
    isRequired(props, propName, _componentName) {
        const model = props[propName];
        if (!model)
            return new Error(`${propName} was required but not given`);
        return this.validate({ model, propName });
    }
    previous() {
        if (!this._previousModelPropType)
            throw new Error("No previous model prop type set");
        return this._previousModelPropType;
    }
    setPreviousModelPropType(previousModelPropType) {
        this._previousModelPropType = previousModelPropType;
    }
    withModelType(modelClass) {
        this._withModelType = modelClass;
    }
    validate({ model, propName }) {
        if (this._withModelType && this._withModelType.name != model.constructor.name)
            return new Error(`Expected ${propName} to be of type ${this._withModelType.name} but it wasn't: ${model.constructor.name}`);
        if (this._withLoadedAbilities) {
            for (const abilityName of this._withLoadedAbilities) {
                const underscoreAbilityName = Inflection.underscore(abilityName);
                if (!(underscoreAbilityName in model.abilities))
                    return new Error(`The ability ${abilityName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`);
            }
        }
        if (this._withLoadedAssociations) {
            for (const associationName in this._withLoadedAssociations) {
                const associationModelPropType = digg(this._withLoadedAssociations, associationName);
                const underscoreAssociationName = Inflection.underscore(associationName);
                if (!(underscoreAssociationName in model.relationshipsCache))
                    return new Error(`The association ${associationName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`);
                const associationCache = digg(model.relationshipsCache, underscoreAssociationName);
                // Find a model to run sub-model-prop-type-validations on
                if (Array.isArray(associationCache)) {
                    for (const preloadedModel of associationCache) {
                        const validationResult = associationModelPropType.validate({
                            model: preloadedModel,
                            propName: `${propName}.${associationName}`
                        });
                        if (validationResult)
                            return validationResult;
                    }
                }
                else if (associationCache) {
                    const validationResult = associationModelPropType.validate({
                        model: associationCache,
                        propName: `${propName}.${associationName}`
                    });
                    if (validationResult)
                        return validationResult;
                }
            }
        }
        if (this._withLoadedAttributes && model.isPersisted()) {
            for (const attributeName of this._withLoadedAttributes) {
                const underscoreAttributeName = Inflection.underscore(attributeName);
                if (!(underscoreAttributeName in model.modelData)) {
                    return new Error(`The attribute ${attributeName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`);
                }
            }
        }
    }
    withLoadedAbilities(arrayOfAbilities) {
        this._withLoadedAbilities = arrayOfAbilities;
        return this;
    }
    withLoadedAssociation(associationName) {
        const associationModelPropType = new ApiMakerModelPropType();
        associationModelPropType.setPreviousModelPropType(this);
        this._withLoadedAssociations[associationName] = associationModelPropType;
        return associationModelPropType;
    }
    withLoadedAttributes(arrayOfAttributes) {
        this._withLoadedAttributes = arrayOfAttributes;
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtcHJvcC10eXBlLmpzIiwic291cmNlUm9vdCI6Ii9zcmMvIiwic291cmNlcyI6WyJtb2RlbC1wcm9wLXR5cGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFFbkMsTUFBTSxDQUFDLE9BQU8sT0FBTyxxQkFBcUI7SUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBRSxVQUFVO1FBQ3hCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFBO1FBRXpELHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUUvQyxPQUFPLHFCQUFxQixDQUFBO0lBQzlCLENBQUM7SUFFRDtRQUNFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM1QyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFBO0lBQ25DLENBQUM7SUFFRCxhQUFhLENBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjO1FBQzVDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU3QixJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUE7UUFDekMsQ0FBQztJQUNILENBQUM7SUFFRCxVQUFVLENBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxjQUFjO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU3QixJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sSUFBSSxLQUFLLENBQUMs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b250ZW50IjpbImltcG9ydCB7ZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgSW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwaU1ha2VyTW9kZWxQcm9wVHlwZSB7XG4gIHN0YXRpYyBvZk1vZGVsIChtb2RlbENsYXNzKSB7XG4gICAgY29uc3QgbW9kZWxQcm9wVHlwZUluc3RhbmNlID0gbmV3IEFwaU1ha2VyTW9kZWxQcm9wVHlwZSgpXG5cbiAgICBtb2RlbFByb3BUeXBlSW5zdGFuY2Uud2l0aE1vZGVsVHlwZShtb2RlbENsYXNzKVxuXG4gICAgcmV0dXJuIG1vZGVsUHJvcFR5cGVJbnN0YW5jZVxuICB9XG5cbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMuaXNOb3RSZXF1aXJlZCA9IHRoaXMuaXNOb3RSZXF1aXJlZC5iaW5kKHRoaXMpXG4gICAgdGhpcy5pc1JlcXVpcmVkID0gdGhpcy5pc1JlcXVpcmVkLmJpbmQodGhpcylcbiAgICB0aGlzLl93aXRoTG9hZGVkQXNzb2NpYXRpb25zID0ge31cbiAgfVxuXG4gIGlzTm90UmVxdWlyZWQgKHByb3BzLCBwcm9wTmFtZSwgX2NvbXBvbmVudE5hbWUpIHtcbiAgICBjb25zdCBtb2RlbCA9IHByb3BzW3Byb3BOYW1lXVxuXG4gICAgaWYgKG1vZGVsKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZSh7bW9kZWwsIHByb3BOYW1lfSlcbiAgICB9XG4gIH1cblxuICBpc1JlcXVpcmVkIChwcm9wcywgcHJvcE5hbWUsIF9jb21wb25lbnROYW1lKSB7XG4gICAgY29uc3QgbW9kZWwgPSBwcm9wc1twcm9wTmFtZV1cblxuICAgIGlmICghbW9kZWwpIHJldHVybiBuZXcgRXJyb3IoYCR7cHJvcE5hbWV9IHdhcyByZXF1aXJlZCBidXQgbm90IGdpdmVuYClcblxuICAgIHJldHVybiB0aGlzLnZhbGlkYXRlKHttb2RlbCwgcHJvcE5hbWV9KVxuICB9XG5cbiAgcHJldmlvdXMgKCkge1xuICAgIGlmICghdGhpcy5fcHJldmlvdXNNb2RlbFByb3BUeXBlKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBwcmV2aW91cyBtb2RlbCBwcm9wIHR5cGUgc2V0XCIpXG5cbiAgICByZXR1cm4gdGhpcy5fcHJldmlvdXNNb2RlbFByb3BUeXBlXG4gIH1cblxuICBzZXRQcmV2aW91c01vZGVsUHJvcFR5cGUgKHByZXZpb3VzTW9kZWxQcm9wVHlwZSkge1xuICAgIHRoaXMuX3ByZXZpb3VzTW9kZWxQcm9wVHlwZSA9IHByZXZpb3VzTW9kZWxQcm9wVHlwZVxuICB9XG5cbiAgd2l0aE1vZGVsVHlwZSAobW9kZWxDbGFzcykge1xuICAgIHRoaXMuX3dpdGhNb2RlbFR5cGUgPSBtb2RlbENsYXNzXG4gIH1cblxuICB2YWxpZGF0ZSAoe21vZGVsLCBwcm9wTmFtZX0pIHtcbiAgICBpZiAodGhpcy5fd2l0aE1vZGVsVHlwZSAmJiB0aGlzLl93aXRoTW9kZWxUeXBlLm5hbWUgIT0gbW9kZWwuY29uc3RydWN0b3IubmFtZSlcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoYEV4cGVjdGVkICR7cHJvcE5hbWV9IHRvIGJlIG9mIHR5cGUgJHt0aGlzLl93aXRoTW9kZWxUeXBlLm5hbWV9IGJ1dCBpdCB3YXNuJ3Q6ICR7bW9kZWwuY29uc3RydWN0b3IubmFtZX1gKVxuXG4gICAgaWYgKHRoaXMuX3dpdGhMb2FkZWRBYmlsaXRpZXMpIHtcbiAgICAgIGZvciAoY29uc3QgYWJpbGl0eU5hbWUgb2YgdGhpcy5fd2l0aExvYWRlZEFiaWxpdGllcykge1xuICAgICAgICBjb25zdCB1bmRlcnNjb3JlQWJpbGl0eU5hbWUgPSBJbmZsZWN0aW9uLnVuZGVyc2NvcmUoYWJpbGl0eU5hbWUpXG5cbiAgICAgICAgaWYgKCEodW5kZXJzY29yZUFiaWxpdHlOYW1lIGluIG1vZGVsLmFiaWxpdGllcykpXG4gICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihgVGhlIGFiaWxpdHkgJHthYmlsaXR5TmFtZX0gd2FzIHJlcXVpcmVkIHRvIGJlIGxvYWRlZCBpbiAke3Byb3BOYW1lfSBvZiB0aGUgJHttb2RlbC5jb25zdHJ1Y3Rvci5uYW1lfSB0eXBlIGJ1dCBpdCB3YXNuJ3RgKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl93aXRoTG9hZGVkQXNzb2NpYXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IGFzc29jaWF0aW9uTmFtZSBpbiB0aGlzLl93aXRoTG9hZGVkQXNzb2NpYXRpb25zKSB7XG4gICAgICAgIGNvbnN0IGFzc29jaWF0aW9uTW9kZWxQcm9wVHlwZSA9IGRpZ2codGhpcy5fd2l0aExvYWRlZEFzc29jaWF0aW9ucywgYXNzb2NpYXRpb25OYW1lKVxuICAgICAgICBjb25zdCB1bmRlcnNjb3JlQXNzb2NpYXRpb25OYW1lID0gSW5mbGVjdGlvbi51bmRlcnNjb3JlKGFzc29jaWF0aW9uTmFtZSlcblxuICAgICAgICBpZiAoISh1bmRlcnNjb3JlQXNzb2NpYXRpb25OYW1lIGluIG1vZGVsLnJlbGF0aW9uc2hpcHNDYWNoZSkpXG4gICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihgVGhlIGFzc29jaWF0aW9uICR7YXNzb2NpYXRpb25OYW1lfSB3YXMgcmVxdWlyZWQgdG8gYmUgbG9hZGVkIGluICR7cHJvcE5hbWV9IG9mIHRoZSAke21vZGVsLmNvbnN0cnVjdG9yLm5hbWV9IHR5cGUgYnV0IGl0IHdhc24ndGApXG5cbiAgICAgICAgY29uc3QgYXNzb2NpYXRpb25DYWNoZSA9IGRpZ2cobW9kZWwucmVsYXRpb25zaGlwc0NhY2hlLCB1bmRlcnNjb3JlQXNzb2NpYXRpb25OYW1lKVxuXG4gICAgICAgIC8vIEZpbmQgYSBtb2RlbCB0byBydW4gc3ViLW1vZGVsLXByb3AtdHlwZS12YWxpZGF0aW9ucyBvblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhc3NvY2lhdGlvbkNhY2hlKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgcHJlbG9hZGVkTW9kZWwgb2YgYXNzb2NpYXRpb25DYWNoZSkge1xuICAgICAgICAgICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IGFzc29jaWF0aW9uTW9kZWxQcm9wVHlwZS52YWxpZGF0ZSh7XG4gICAgICAgICAgICAgIG1vZGVsOiBwcmVsb2FkZWRNb2RlbCxcbiAgICAgICAgICAgICAgcHJvcE5hbWU6IGAke3Byb3BOYW1lfS4ke2Fzc29jaWF0aW9uTmFtZX1gXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpZiAodmFsaWRhdGlvblJlc3VsdCkgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHRcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYXNzb2NpYXRpb25DYWNoZSkge1xuICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSBhc3NvY2lhdGlvbk1vZGVsUHJvcFR5cGUudmFsaWRhdGUoe1xuICAgICAgICAgICAgbW9kZWw6IGFzc29jaWF0aW9uQ2FjaGUsXG4gICAgICAgICAgICBwcm9wTmFtZTogYCR7cHJvcE5hbWV9LiR7YXNzb2NpYXRpb25OYW1lfWBcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKHZhbGlkYXRpb25SZXN1bHQpIHJldHVybiB2YWxpZGF0aW9uUmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fd2l0aExvYWRlZEF0dHJpYnV0ZXMgJiYgbW9kZWwuaXNQZXJzaXN0ZWQoKSkge1xuICAgICAgZm9yIChjb25zdCBhdHRyaWJ1dGVOYW1lIG9mIHRoaXMuX3dpdGhMb2FkZWRBdHRyaWJ1dGVzKSB7XG4gICAgICAgIGNvbnN0IHVuZGVyc2NvcmVBdHRyaWJ1dGVOYW1lID0gSW5mbGVjdGlvbi51bmRlcnNjb3JlKGF0dHJpYnV0ZU5hbWUpXG5cbiAgICAgICAgaWYgKCEodW5kZXJzY29yZUF0dHJpYnV0ZU5hbWUgaW4gbW9kZWwubW9kZWxEYXRhKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgRXJyb3IoYFRoZSBhdHRyaWJ1dGUgJHthdHRyaWJ1dGVOYW1lfSB3YXMgcmVxdWlyZWQgdG8gYmUgbG9hZGVkIGluICR7cHJvcE5hbWV9IG9mIHRoZSAke21vZGVsLmNvbnN0cnVjdG9yLm5hbWV9IHR5cGUgYnV0IGl0IHdhc24ndGApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB3aXRoTG9hZGVkQWJpbGl0aWVzIChhcnJheU9mQWJpbGl0aWVzKSB7XG4gICAgdGhpcy5fd2l0aExvYWRlZEFiaWxpdGllcyA9IGFycmF5T2ZBYmlsaXRpZXNcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB3aXRoTG9hZGVkQXNzb2NpYXRpb24gKGFzc29jaWF0aW9uTmFtZSkge1xuICAgIGNvbnN0IGFzc29jaWF0aW9uTW9kZWxQcm9wVHlwZSA9IG5ldyBBcGlNYWtlck1vZGVsUHJvcFR5cGUoKVxuXG4gICAgYXNzb2NpYXRpb25Nb2RlbFByb3BUeXBlLnNldFByZXZpb3VzTW9kZWxQcm9wVHlwZSh0aGlzKVxuICAgIHRoaXMuX3dpdGhMb2FkZWRBc3NvY2lhdGlvbnNbYXNzb2NpYXRpb25OYW1lXSA9IGFzc29jaWF0aW9uTW9kZWxQcm9wVHlwZVxuXG4gICAgcmV0dXJuIGFzc29jaWF0aW9uTW9kZWxQcm9wVHlwZVxuICB9XG5cbiAgd2l0aExvYWRlZEF0dHJpYnV0ZXMgKGFycmF5T2ZBdHRyaWJ1dGVzKSB7XG4gICAgdGhpcy5fd2l0aExvYWRlZEF0dHJpYnV0ZXMgPSBhcnJheU9mQXR0cmlidXRlc1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19