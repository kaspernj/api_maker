export default class ApiMakerModelPropType {
    static ofModel(modelClass: any): ApiMakerModelPropType;
    isNotRequired(props: any, propName: any, _componentName: any): any;
    isRequired(props: any, propName: any, _componentName: any): any;
    _withLoadedAssociations: {};
    previous(): any;
    setPreviousModelPropType(previousModelPropType: any): void;
    _previousModelPropType: any;
    withModelType(modelClass: any): void;
    _withModelType: any;
    validate({ model, propName }: {
        model: any;
        propName: any;
    }): any;
    withLoadedAbilities(arrayOfAbilities: any): this;
    _withLoadedAbilities: any;
    withLoadedAssociation(associationName: any): ApiMakerModelPropType;
    withLoadedAttributes(arrayOfAttributes: any): this;
    _withLoadedAttributes: any;
}
//# sourceMappingURL=model-prop-type.d.ts.map