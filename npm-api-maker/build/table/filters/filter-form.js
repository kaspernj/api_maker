import React, { useMemo, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import AttributeElement from "./attribute-element.js";
import BaseComponent from "../../base-component.js";
import Button from "../../utils/button.js";
import Card from "../../utils/card.js";
import { digg, digs } from "diggerize";
import * as inflection from "inflection";
import { Form } from "../../form.js";
import Header from "../../utils/header.js";
import Input from "../../inputs/input.js";
import memo from "set-state-compare/build/memo.js";
import Params from "../../params.js";
import PropTypes from "prop-types";
import PropTypesExact from "prop-types-exact";
import ReflectionElement from "./reflection-element.js";
import ScopeElement from "./scope-element.js";
import Select from "../../inputs/select.js";
import Services from "../../services.js";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import Text from "../../utils/text.js";
import useBreakpoint from "../../use-breakpoint.js";
import useI18n from "i18n-on-steroids/src/use-i18n.mjs";
export default memo(shapeComponent(class ApiMakerTableFiltersFilterForm extends BaseComponent {
    static propTypes = PropTypesExact({
        filter: PropTypes.object,
        modelClass: PropTypes.func.isRequired,
        onApplyClicked: PropTypes.func.isRequired,
        onRequestClose: PropTypes.func.isRequired,
        querySearchName: PropTypes.string.isRequired
    });
    setup() {
        const { t } = useI18n({ namespace: "js.api_maker.table.filters.filter_form" });
        this.useStates({
            associations: null,
            attribute: undefined,
            actualCurrentModelClass: () => ({ modelClass: this.p.modelClass }),
            loading: 0,
            modelClassName: digg(this.p.modelClass.modelClassData(), "className"),
            path: [],
            predicate: undefined,
            predicates: undefined,
            ransackableAttributes: undefined,
            ransackableScopes: undefined,
            scope: this.props.filter.sc,
            value: this.props.filter.v
        });
        this.setInstance({
            breakpoint: useBreakpoint(),
            t,
            valueInputRef: useRef(),
        });
        useMemo(() => {
            this.loadRansackPredicates();
            if (this.props.filter.v) {
                this.loadInitialValuesWithLoadingIndicator();
            }
        }, []);
        useMemo(() => {
            this.loadAssociations();
        }, [this.s.modelClassName]);
    }
    currentModelClass = () => digg(this.s.actualCurrentModelClass, "modelClass");
    parseAssociationData(result) {
        const associations = result.associations.map(({ human_name, model_class_name, reflection_name, resource }) => ({
            humanName: human_name,
            modelClassName: model_class_name,
            reflectionName: inflection.camelize(reflection_name, true),
            resource
        }));
        const ransackableAttributes = digg(result, "ransackable_attributes").map(({ attribute_name: attributeName, human_name: humanName }) => ({
            attributeName, humanName
        }));
        const ransackableScopes = digg(result, "ransackable_scopes");
        return { associations, ransackableAttributes, ransackableScopes };
    }
    async loadAssociations() {
        this.increaseLoading();
        try {
            if (!this.s.modelClassName)
                throw new Error("'modelClassName' not set in state");
            const result = await Services.current().sendRequest("Models::Associations", { model_class_name: this.s.modelClassName });
            const { associations, ransackableAttributes, ransackableScopes } = this.parseAssociationData(result);
            this.setState({ associations, ransackableAttributes, ransackableScopes });
        }
        finally {
            this.decreaseLoading();
        }
    }
    decreaseLoading = () => this.setState((prevState) => ({ loading: prevState.loading - 1 }));
    increaseLoading = () => this.setState((prevState) => ({ loading: prevState.loading + 1 }));
    async loadInitialValuesWithLoadingIndicator() {
        try {
            this.increaseLoading();
            await this.loadInitialValues();
        }
        finally {
            this.decreaseLoading();
        }
    }
    async loadInitialValues() {
        if (!this.s.modelClassName)
            throw new Error("'modelClassName' not set in state");
        let result = await Services.current().sendRequest("Models::Associations", { model_class_name: this.s.modelClassName });
        let data = this.parseAssociationData(result);
        let modelClassName = this.s.modelClassName;
        const path = [];
        for (const pathPart of this.props.filter.p) {
            const reflection = data.associations.find((association) => digg(association, "reflectionName") == inflection.camelize(pathPart, true));
            if (!reflection)
                throw new Error(`Couldn't find association by that name ${this.s.modelClassName}#${pathPart}`);
            modelClassName = digg(reflection, "modelClassName");
            if (!modelClassName) {
                const pathNames = path.map((pathPart) => pathPart.name()).join(".");
                throw new Error(`No model class name from ${pathNames}.${reflection.name()}`);
            }
            result = await Services.current().sendRequest("Models::Associations", { model_class_name: modelClassName });
            data = this.parseAssociationData(result);
            path.push(reflection);
        }
        const { ransackableAttributes } = data;
        const attribute = this.p.filter.a;
        const ransackableAttribute = ransackableAttributes.find((ransackableAttribute) => digg(ransackableAttribute, "attributeName") == attribute);
        this.setState({ attribute: ransackableAttribute, modelClassName, path });
    }
    async loadRansackPredicates() {
        this.increaseLoading();
        try {
            const response = await Services.current().sendRequest("Ransack::Predicates");
            const predicates = digg(response, "predicates");
            let currentPredicate;
            if (this.props.filter.pre) {
                currentPredicate = predicates.find((predicate) => predicate.name == this.props.filter.pre);
            }
            this.setState({
                predicate: currentPredicate,
                predicates
            });
        }
        finally {
            this.decreaseLoading();
        }
    }
    render() {
        const { breakpoint, t, valueInputRef } = this.tt;
        const { attribute, path, predicate, predicates, scope, value } = this.s;
        const { mdUp } = breakpoint;
        let submitEnabled = false;
        if (attribute && predicate) {
            submitEnabled = true;
        }
        else if (scope) {
            submitEnabled = true;
        }
        return (<Card testID="api-maker/table/filters/filter-form" style={this.cache("cardStyle", {
                width: mdUp ? undefined : "100%",
                minWidth: 50,
                minHeight: 50
            }, [mdUp])}>
        <Form onSubmit={this.tt.onSubmit}>
          <View style={{ flexDirection: "row" }}>
            {path.map(({ humanName, reflectionName }, pathPartIndex) => <View key={`${pathPartIndex}-${reflectionName}`} style={{ flexDirection: "row" }}>
                {pathPartIndex > 0 &&
                    <Text style={{ marginRight: 5, marginLeft: 5 }}>
                    -
                  </Text>}
                <Text>
                  {humanName}
                </Text>
              </View>)}
          </View>
          <View style={{ flexDirection: mdUp ? "row" : "column" }}>
            <View style={{ marginTop: mdUp ? undefined : 25 }}>
              <Header>
                {t(".relationships", { defaultValue: "Relationships" })}
              </Header>
              {this.s.associations && this.sortedReflectionsByName(this.s.associations).map((reflection) => <ReflectionElement key={reflection.reflectionName} modelClassName={this.s.modelClassName} onClick={this.tt.onReflectionClicked} reflection={reflection}/>)}
            </View>
            <View style={{ marginTop: mdUp ? undefined : 25 }}>
              <Header>
                {t(".attributes", { defaultValue: "Attributes" })}
              </Header>
              {this.s.ransackableAttributes && this.sortedAttributesByName(this.s.ransackableAttributes)?.map((attribute) => <AttributeElement active={attribute.attributeName == this.s.attribute?.attributeName} attribute={attribute} key={attribute.attributeName} modelClassName={this.s.modelClassName} onClick={this.tt.onAttributeClicked}/>)}
              {this.s.ransackableScopes?.map((scope) => <ScopeElement active={scope == this.s.scope} key={scope} scope={scope} onScopeClicked={this.tt.onScopeClicked}/>)}
            </View>
            <View style={{ marginTop: mdUp ? undefined : 25 }}>
              <Header>
                {t(".search", { defaultValue: "Search" })}
              </Header>
              <View>
                {predicates && !this.s.scope &&
                <Select className="predicate-select" defaultValue={predicate?.name} includeBlank onChange={this.tt.onPredicateChanged} options={predicates.map((predicate) => digg(predicate, "name"))}/>}
              </View>
              <View style={{ marginTop: 10 }}>
                {((attribute && predicate) || scope) &&
                <Input className="value-input" defaultValue={value} inputRef={valueInputRef}/>}
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "end", marginTop: 10 }}>
            <Button danger icon="remove" label={t(".cancel", { defaultValue: "Cancel" })} onPress={this.p.onRequestClose} pressableProps={this.cache("cancelButtonPressableProps", {
                marginRight: 5
            })}/>
            <Button disabled={!submitEnabled} icon="check" label={t(".apply", { defaultValue: "Apply" })} pressableProps={this.cache("appleButtonPressableProps", {
                style: { marginLeft: 5 },
                testID: "apply-filter-button"
            })} submit/>
          </View>
        </Form>
        {this.s.loading > 0 &&
                <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        width: "100%",
                        height: "100%"
                    }}>
            <ActivityIndicator size="large"/>
          </View>}
      </Card>);
    }
    currentModelClassFromPath(path) {
        const { modelClass } = this.p;
        let currentModelClass = modelClass;
        for (const pathPart of path) {
            const camelizedPathPart = inflection.camelize(pathPart, true);
            const association = currentModelClass.ransackableAssociations().find((reflection) => reflection.name() == camelizedPathPart);
            if (!association) {
                const ransackableAssociationNames = currentModelClass.ransackableAssociations().map((reflection) => reflection.name()).join(", ");
                throw new Error(`Could not find a Ransackable association by that name: ${camelizedPathPart} in ${ransackableAssociationNames}`);
            }
            currentModelClass = association.modelClass();
        }
        return currentModelClass;
    }
    currentPathParts() {
        const { modelClass } = this.p;
        const { path } = this.s;
        const result = [];
        let currentModelClass = modelClass;
        result.push({
            modelClass,
            translation: modelClass.modelName().human({ count: 2 })
        });
        for (const pathPart of path) {
            const camelizedPathPart = inflection.camelize(pathPart, true);
            const pathPartTranslation = currentModelClass.humanAttributeName(camelizedPathPart);
            currentModelClass = currentModelClass.ransackableAssociations().find((reflection) => reflection.name() == camelizedPathPart).modelClass();
            result.push({
                modelClass: currentModelClass,
                translation: pathPartTranslation
            });
        }
        return result;
    }
    onAttributeClicked = ({ attribute }) => {
        this.setState({
            attribute,
            scope: undefined
        });
    };
    onPredicateChanged = (e) => {
        const chosenPredicateName = digg(e, "target", "value");
        const predicate = this.s.predicates.find((predicate) => predicate.name == chosenPredicateName);
        this.setState({ predicate });
    };
    onReflectionClicked = ({ reflection }) => {
        const newPath = this.s.path.concat([reflection]);
        this.setState({
            associations: null,
            attribute: undefined,
            actualCurrentModelClass: { modelClass: digg(reflection, "resource") },
            modelClassName: digg(reflection, "modelClassName"),
            path: newPath,
            predicate: undefined
        });
    };
    onScopeClicked = ({ scope }) => {
        this.setState({
            attribute: undefined,
            predicate: undefined,
            scope
        });
    };
    onSubmit = () => {
        const { filter, querySearchName } = this.p;
        const { attribute, path, predicate, scope } = this.s;
        const { filterIndex } = digs(filter, "filterIndex");
        const searchParams = Params.parse()[querySearchName] || {};
        const value = digg(this.tt.valueInputRef, "current", "value");
        const p = path.map((reflection) => inflection.underscore(reflection.reflectionName));
        const newSearchParams = {
            p,
            v: value
        };
        if (attribute) {
            newSearchParams.a = digg(attribute, "attributeName");
            newSearchParams.pre = digg(predicate, "name");
        }
        else if (scope) {
            newSearchParams.sc = scope;
        }
        else {
            throw new Error("Dont know if should search for attribute or scope?");
        }
        searchParams[filterIndex] = JSON.stringify(newSearchParams);
        const newParams = {};
        newParams[querySearchName] = searchParams;
        Params.changeParams(newParams);
        this.props.onApplyClicked();
    };
    reflectionsWithModelClass(reflections) {
        return reflections.filter((reflection) => {
            try {
                reflection.modelClass();
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
    sortedAttributesByName(attributes) {
        return attributes.sort((a, b) => digg(a, "humanName")
            .toLowerCase()
            .localeCompare(digg(b, "humanName").toLowerCase()));
    }
    sortedReflectionsByName(reflections) {
        return reflections.sort((a, b) => digg(a, "humanName")
            .toLowerCase()
            .localeCompare(digg(b, "humanName").toLowerCase()));
    }
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLWZvcm0uanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL2ZpbHRlcnMvZmlsdGVyLWZvcm0uanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBQyxNQUFNLE9BQU8sQ0FBQTtBQUM1QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFDLE1BQU0sY0FBYyxDQUFBO0FBQ3BELE9BQU8sZ0JBQWdCLE1BQU0sd0JBQXdCLENBQUE7QUFDckQsT0FBTyxhQUFhLE1BQU0seUJBQXlCLENBQUE7QUFDbkQsT0FBTyxNQUFNLE1BQU0sdUJBQXVCLENBQUE7QUFDMUMsT0FBTyxJQUFJLE1BQU0scUJBQXFCLENBQUE7QUFDdEMsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsTUFBTSxXQUFXLENBQUE7QUFDcEMsT0FBTyxLQUFLLFVBQVUsTUFBTSxZQUFZLENBQUE7QUFDeEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQTtBQUNsQyxPQUFPLE1BQU0sTUFBTSx1QkFBdUIsQ0FBQTtBQUMxQyxPQUFPLEtBQUssTUFBTSx1QkFBdUIsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxpQ0FBaUMsQ0FBQTtBQUNsRCxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUE7QUFDbEMsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUE7QUFDN0MsT0FBTyxpQkFBaUIsTUFBTSx5QkFBeUIsQ0FBQTtBQUN2RCxPQUFPLFlBQVksTUFBTSxvQkFBb0IsQ0FBQTtBQUM3QyxPQUFPLE1BQU0sTUFBTSx3QkFBd0IsQ0FBQTtBQUMzQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUN4QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sNENBQTRDLENBQUE7QUFDekUsT0FBTyxJQUFJLE1BQU0scUJBQXFC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QUFBO1lBQ2IsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxLQUFLLENBQUE7WUFDZCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBRUQsc0JBQXNCLENBQUMsVUFBVTtRQUMvQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDOUIsSUFBSSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUM7YUFDakIsV0FBVyxFQUFFO2FBQ2IsYUFBYSxDQUNaLElBQUksQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQ25DLENBQ0osQ0FBQTtJQUNILENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxXQUFXO1FBQ2pDLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUMvQixJQUFJLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQzthQUNqQixXQUFXLEVBQUU7YUFDYixhQUFhLENBQ1osSUFBSSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FDbkMsQ0FDSixDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7dXNlTWVtbywgdXNlUmVmfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHtBY3Rpdml0eUluZGljYXRvciwgVmlld30gZnJvbSBcInJlYWN0LW5hdGl2ZVwiXG5pbXBvcnQgQXR0cmlidXRlRWxlbWVudCBmcm9tIFwiLi9hdHRyaWJ1dGUtZWxlbWVudC5qc1wiXG5pbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tIFwiLi4vLi4vYmFzZS1jb21wb25lbnQuanNcIlxuaW1wb3J0IEJ1dHRvbiBmcm9tIFwiLi4vLi4vdXRpbHMvYnV0dG9uLmpzXCJcbmltcG9ydCBDYXJkIGZyb20gXCIuLi8uLi91dGlscy9jYXJkLmpzXCJcbmltcG9ydCB7ZGlnZywgZGlnc30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCB7Rm9ybX0gZnJvbSBcIi4uLy4uL2Zvcm0uanNcIlxuaW1wb3J0IEhlYWRlciBmcm9tIFwiLi4vLi4vdXRpbHMvaGVhZGVyLmpzXCJcbmltcG9ydCBJbnB1dCBmcm9tIFwiLi4vLi4vaW5wdXRzL2lucHV0LmpzXCJcbmltcG9ydCBtZW1vIGZyb20gXCJzZXQtc3RhdGUtY29tcGFyZS9idWlsZC9tZW1vLmpzXCJcbmltcG9ydCBQYXJhbXMgZnJvbSBcIi4uLy4uL3BhcmFtcy5qc1wiXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gXCJwcm9wLXR5cGVzXCJcbmltcG9ydCBQcm9wVHlwZXNFeGFjdCBmcm9tIFwicHJvcC10eXBlcy1leGFjdFwiXG5pbXBvcnQgUmVmbGVjdGlvbkVsZW1lbnQgZnJvbSBcIi4vcmVmbGVjdGlvbi1lbGVtZW50LmpzXCJcbmltcG9ydCBTY29wZUVsZW1lbnQgZnJvbSBcIi4vc2NvcGUtZWxlbWVudC5qc1wiXG5pbXBvcnQgU2VsZWN0IGZyb20gXCIuLi8uLi9pbnB1dHMvc2VsZWN0LmpzXCJcbmltcG9ydCBTZXJ2aWNlcyBmcm9tIFwiLi4vLi4vc2VydmljZXMuanNcIlxuaW1wb3J0IHtzaGFwZUNvbXBvbmVudH0gZnJvbSBcInNldC1zdGF0ZS1jb21wYXJlL2J1aWxkL3NoYXBlLWNvbXBvbmVudC5qc1wiXG5pbXBvcnQgVGV4dCBmcm9tIFwiLi4vLi4vdXRpbHMvdGV4dC5qc1wiXG5pbXBvcnQgdXNlQnJlYWtwb2ludCBmcm9tIFwiLi4vLi4vdXNlLWJyZWFrcG9pbnQuanNcIlxuaW1wb3J0IHVzZUkxOG4gZnJvbSBcImkxOG4tb24tc3Rlcm9pZHMvc3JjL3VzZS1pMThuLm1qc1wiXG5cbmV4cG9ydCBkZWZhdWx0IG1lbW8oc2hhcGVDb21wb25lbnQoY2xhc3MgQXBpTWFrZXJUYWJsZUZpbHRlcnNGaWx0ZXJGb3JtIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSBQcm9wVHlwZXNFeGFjdCh7XG4gICAgZmlsdGVyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG1vZGVsQ2xhc3M6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25BcHBseUNsaWNrZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25SZXF1ZXN0Q2xvc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcXVlcnlTZWFyY2hOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWRcbiAgfSlcblxuICBzZXR1cCgpIHtcbiAgICBjb25zdCB7dH0gPSB1c2VJMThuKHtuYW1lc3BhY2U6IFwianMuYXBpX21ha2VyLnRhYmxlLmZpbHRlcnMuZmlsdGVyX2Zvcm1cIn0pXG5cbiAgICB0aGlzLnVzZVN0YXRlcyh7XG4gICAgICBhc3NvY2lhdGlvbnM6IG51bGwsXG4gICAgICBhdHRyaWJ1dGU6IHVuZGVmaW5lZCxcbiAgICAgIGFjdHVhbEN1cnJlbnRNb2RlbENsYXNzOiAoKSA9PiAoe21vZGVsQ2xhc3M6IHRoaXMucC5tb2RlbENsYXNzfSksXG4gICAgICBsb2FkaW5nOiAwLFxuICAgICAgbW9kZWxDbGFzc05hbWU6IGRpZ2codGhpcy5wLm1vZGVsQ2xhc3MubW9kZWxDbGFzc0RhdGEoKSwgXCJjbGFzc05hbWVcIiksXG4gICAgICBwYXRoOiBbXSxcbiAgICAgIHByZWRpY2F0ZTogdW5kZWZpbmVkLFxuICAgICAgcHJlZGljYXRlczogdW5kZWZpbmVkLFxuICAgICAgcmFuc2Fja2FibGVBdHRyaWJ1dGVzOiB1bmRlZmluZWQsXG4gICAgICByYW5zYWNrYWJsZVNjb3BlczogdW5kZWZpbmVkLFxuICAgICAgc2NvcGU6IHRoaXMucHJvcHMuZmlsdGVyLnNjLFxuICAgICAgdmFsdWU6IHRoaXMucHJvcHMuZmlsdGVyLnZcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRJbnN0YW5jZSh7XG4gICAgICBicmVha3BvaW50OiB1c2VCcmVha3BvaW50KCksXG4gICAgICB0LFxuICAgICAgdmFsdWVJbnB1dFJlZjogdXNlUmVmKCksXG4gICAgfSlcblxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgdGhpcy5sb2FkUmFuc2Fja1ByZWRpY2F0ZXMoKVxuXG4gICAgICBpZiAodGhpcy5wcm9wcy5maWx0ZXIudikge1xuICAgICAgICB0aGlzLmxvYWRJbml0aWFsVmFsdWVzV2l0aExvYWRpbmdJbmRpY2F0b3IoKVxuICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICB0aGlzLmxvYWRBc3NvY2lhdGlvbnMoKVxuICAgIH0sIFt0aGlzLnMubW9kZWxDbGFzc05hbWVdKVxuICB9XG5cbiAgY3VycmVudE1vZGVsQ2xhc3MgPSAoKSA9PiBkaWdnKHRoaXMucy5hY3R1YWxDdXJyZW50TW9kZWxDbGFzcywgXCJtb2RlbENsYXNzXCIpXG5cbiAgcGFyc2VBc3NvY2lhdGlvbkRhdGEocmVzdWx0KSB7XG4gICAgY29uc3QgYXNzb2NpYXRpb25zID0gcmVzdWx0LmFzc29jaWF0aW9ucy5tYXAoKHtodW1hbl9uYW1lLCBtb2RlbF9jbGFzc19uYW1lLCByZWZsZWN0aW9uX25hbWUsIHJlc291cmNlfSkgPT4gKHtcbiAgICAgIGh1bWFuTmFtZTogaHVtYW5fbmFtZSxcbiAgICAgIG1vZGVsQ2xhc3NOYW1lOiBtb2RlbF9jbGFzc19uYW1lLFxuICAgICAgcmVmbGVjdGlvbk5hbWU6IGluZmxlY3Rpb24uY2FtZWxpemUocmVmbGVjdGlvbl9uYW1lLCB0cnVlKSxcbiAgICAgIHJlc291cmNlXG4gICAgfSkpXG4gICAgY29uc3QgcmFuc2Fja2FibGVBdHRyaWJ1dGVzID0gZGlnZyhyZXN1bHQsIFwicmFuc2Fja2FibGVfYXR0cmlidXRlc1wiKS5tYXAoKHthdHRyaWJ1dGVfbmFtZTogYXR0cmlidXRlTmFtZSwgaHVtYW5fbmFtZTogaHVtYW5OYW1lfSkgPT4gKHtcbiAgICAgIGF0dHJpYnV0ZU5hbWUsIGh1bWFuTmFtZVxuICAgIH0pKVxuICAgIGNvbnN0IHJhbnNhY2thYmxlU2NvcGVzID0gZGlnZyhyZXN1bHQsIFwicmFuc2Fja2FibGVfc2NvcGVzXCIpXG5cbiAgICByZXR1cm4ge2Fzc29jaWF0aW9ucywgcmFuc2Fja2FibGVBdHRyaWJ1dGVzLCByYW5zYWNrYWJsZVNjb3Blc31cbiAgfVxuXG4gIGFzeW5jIGxvYWRBc3NvY2lhdGlvbnMoKSB7XG4gICAgdGhpcy5pbmNyZWFzZUxvYWRpbmcoKVxuXG4gICAgdHJ5IHtcbiAgICAgIGlmICghdGhpcy5zLm1vZGVsQ2xhc3NOYW1lKSB0aHJvdyBuZXcgRXJyb3IoXCInbW9kZWxDbGFzc05hbWUnIG5vdCBzZXQgaW4gc3RhdGVcIilcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgU2VydmljZXMuY3VycmVudCgpLnNlbmRSZXF1ZXN0KFwiTW9kZWxzOjpBc3NvY2lhdGlvbnNcIiwge21vZGVsX2NsYXNzX25hbWU6IHRoaXMucy5tb2RlbENsYXNzTmFtZX0pXG4gICAgICBjb25zdCB7YXNzb2NpYXRpb25zLCByYW5zYWNrYWJsZUF0dHJpYnV0ZXMsIHJhbnNhY2thYmxlU2NvcGVzfSA9IHRoaXMucGFyc2VBc3NvY2lhdGlvbkRhdGEocmVzdWx0KVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHthc3NvY2lhdGlvbnMsIHJhbnNhY2thYmxlQXR0cmlidXRlcywgcmFuc2Fja2FibGVTY29wZXN9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmRlY3JlYXNlTG9hZGluZygpXG4gICAgfVxuICB9XG5cbiAgZGVjcmVhc2VMb2FkaW5nID0gKCkgPT4gdGhpcy5zZXRTdGF0ZSgocHJldlN0YXRlKSA9PiAoe2xvYWRpbmc6IHByZXZTdGF0ZS5sb2FkaW5nIC0gMX0pKVxuICBpbmNyZWFzZUxvYWRpbmcgPSAoKSA9PiB0aGlzLnNldFN0YXRlKChwcmV2U3RhdGUpID0+ICh7bG9hZGluZzogcHJldlN0YXRlLmxvYWRpbmcgKyAxfSkpXG5cbiAgYXN5bmMgbG9hZEluaXRpYWxWYWx1ZXNXaXRoTG9hZGluZ0luZGljYXRvcigpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5pbmNyZWFzZUxvYWRpbmcoKVxuICAgICAgYXdhaXQgdGhpcy5sb2FkSW5pdGlhbFZhbHVlcygpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZGVjcmVhc2VMb2FkaW5nKClcbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2FkSW5pdGlhbFZhbHVlcygpIHtcbiAgICBpZiAoIXRoaXMucy5tb2RlbENsYXNzTmFtZSkgdGhyb3cgbmV3IEVycm9yKFwiJ21vZGVsQ2xhc3NOYW1lJyBub3Qgc2V0IGluIHN0YXRlXCIpXG5cbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgU2VydmljZXMuY3VycmVudCgpLnNlbmRSZXF1ZXN0KFwiTW9kZWxzOjpBc3NvY2lhdGlvbnNcIiwge21vZGVsX2NsYXNzX25hbWU6IHRoaXMucy5tb2RlbENsYXNzTmFtZX0pXG4gICAgbGV0IGRhdGEgPSB0aGlzLnBhcnNlQXNzb2NpYXRpb25EYXRhKHJlc3VsdClcbiAgICBsZXQgbW9kZWxDbGFzc05hbWUgPSB0aGlzLnMubW9kZWxDbGFzc05hbWVcbiAgICBjb25zdCBwYXRoID0gW11cblxuICAgIGZvciAoY29uc3QgcGF0aFBhcnQgb2YgdGhpcy5wcm9wcy5maWx0ZXIucCkge1xuICAgICAgY29uc3QgcmVmbGVjdGlvbiA9IGRhdGEuYXNzb2NpYXRpb25zLmZpbmQoKGFzc29jaWF0aW9uKSA9PiBkaWdnKGFzc29jaWF0aW9uLCBcInJlZmxlY3Rpb25OYW1lXCIpID09IGluZmxlY3Rpb24uY2FtZWxpemUocGF0aFBhcnQsIHRydWUpKVxuXG4gICAgICBpZiAoIXJlZmxlY3Rpb24pIHRocm93IG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCBhc3NvY2lhdGlvbiBieSB0aGF0IG5hbWUgJHt0aGlzLnMubW9kZWxDbGFzc05hbWV9IyR7cGF0aFBhcnR9YClcblxuICAgICAgbW9kZWxDbGFzc05hbWUgPSBkaWdnKHJlZmxlY3Rpb24sIFwibW9kZWxDbGFzc05hbWVcIilcblxuICAgICAgaWYgKCFtb2RlbENsYXNzTmFtZSkge1xuICAgICAgICBjb25zdCBwYXRoTmFtZXMgPSBwYXRoLm1hcCgocGF0aFBhcnQpID0+IHBhdGhQYXJ0Lm5hbWUoKSkuam9pbihcIi5cIilcblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1vZGVsIGNsYXNzIG5hbWUgZnJvbSAke3BhdGhOYW1lc30uJHtyZWZsZWN0aW9uLm5hbWUoKX1gKVxuICAgICAgfVxuXG4gICAgICByZXN1bHQgPSBhd2FpdCBTZXJ2aWNlcy5jdXJyZW50KCkuc2VuZFJlcXVlc3QoXCJNb2RlbHM6OkFzc29jaWF0aW9uc1wiLCB7bW9kZWxfY2xhc3NfbmFtZTogbW9kZWxDbGFzc05hbWV9KVxuICAgICAgZGF0YSA9IHRoaXMucGFyc2VBc3NvY2lhdGlvbkRhdGEocmVzdWx0KVxuXG4gICAgICBwYXRoLnB1c2gocmVmbGVjdGlvbilcbiAgICB9XG5cbiAgICBjb25zdCB7cmFuc2Fja2FibGVBdHRyaWJ1dGVzfSA9IGRhdGFcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSB0aGlzLnAuZmlsdGVyLmFcbiAgICBjb25zdCByYW5zYWNrYWJsZUF0dHJpYnV0ZSA9IHJhbnNhY2thYmxlQXR0cmlidXRlcy5maW5kKChyYW5zYWNrYWJsZUF0dHJpYnV0ZSkgPT4gZGlnZyhyYW5zYWNrYWJsZUF0dHJpYnV0ZSwgXCJhdHRyaWJ1dGVOYW1lXCIpID09IGF0dHJpYnV0ZSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe2F0dHJpYnV0ZTogcmFuc2Fja2FibGVBdHRyaWJ1dGUsIG1vZGVsQ2xhc3NOYW1lLCBwYXRofSlcbiAgfVxuXG4gIGFzeW5jIGxvYWRSYW5zYWNrUHJlZGljYXRlcygpIHtcbiAgICB0aGlzLmluY3JlYXNlTG9hZGluZygpXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBTZXJ2aWNlcy5jdXJyZW50KCkuc2VuZFJlcXVlc3QoXCJSYW5zYWNrOjpQcmVkaWNhdGVzXCIpXG4gICAgICBjb25zdCBwcmVkaWNhdGVzID0gZGlnZyhyZXNwb25zZSwgXCJwcmVkaWNhdGVzXCIpXG4gICAgICBsZXQgY3VycmVudFByZWRpY2F0ZVxuXG4gICAgICBpZiAodGhpcy5wcm9wcy5maWx0ZXIucHJlKSB7XG4gICAgICAgIGN1cnJlbnRQcmVkaWNhdGUgPSBwcmVkaWNhdGVzLmZpbmQoKHByZWRpY2F0ZSkgPT4gcHJlZGljYXRlLm5hbWUgPT0gdGhpcy5wcm9wcy5maWx0ZXIucHJlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcHJlZGljYXRlOiBjdXJyZW50UHJlZGljYXRlLFxuICAgICAgICBwcmVkaWNhdGVzXG4gICAgICB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmRlY3JlYXNlTG9hZGluZygpXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHticmVha3BvaW50LCB0LCB2YWx1ZUlucHV0UmVmfSA9IHRoaXMudHRcbiAgICBjb25zdCB7YXR0cmlidXRlLCBwYXRoLCBwcmVkaWNhdGUsIHByZWRpY2F0ZXMsIHNjb3BlLCB2YWx1ZX0gPSB0aGlzLnNcbiAgICBjb25zdCB7bWRVcH0gPSBicmVha3BvaW50XG4gICAgbGV0IHN1Ym1pdEVuYWJsZWQgPSBmYWxzZVxuXG4gICAgaWYgKGF0dHJpYnV0ZSAmJiBwcmVkaWNhdGUpIHtcbiAgICAgIHN1Ym1pdEVuYWJsZWQgPSB0cnVlXG4gICAgfSBlbHNlIGlmIChzY29wZSkge1xuICAgICAgc3VibWl0RW5hYmxlZCA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENhcmRcbiAgICAgICAgdGVzdElEPVwiYXBpLW1ha2VyL3RhYmxlL2ZpbHRlcnMvZmlsdGVyLWZvcm1cIlxuICAgICAgICBzdHlsZT17dGhpcy5jYWNoZShcImNhcmRTdHlsZVwiLCB7XG4gICAgICAgICAgd2lkdGg6IG1kVXAgPyB1bmRlZmluZWQgOiBcIjEwMCVcIixcbiAgICAgICAgICBtaW5XaWR0aDogNTAsXG4gICAgICAgICAgbWluSGVpZ2h0OiA1MFxuICAgICAgICB9LCBbbWRVcF0pfVxuICAgICAgPlxuICAgICAgICA8Rm9ybSBvblN1Ym1pdD17dGhpcy50dC5vblN1Ym1pdH0+XG4gICAgICAgICAgPFZpZXcgc3R5bGU9e3tmbGV4RGlyZWN0aW9uOiBcInJvd1wifX0+XG4gICAgICAgICAgICB7cGF0aC5tYXAoKHtodW1hbk5hbWUsIHJlZmxlY3Rpb25OYW1lfSwgcGF0aFBhcnRJbmRleCkgPT5cbiAgICAgICAgICAgICAgPFZpZXcga2V5PXtgJHtwYXRoUGFydEluZGV4fS0ke3JlZmxlY3Rpb25OYW1lfWB9IHN0eWxlPXt7ZmxleERpcmVjdGlvbjogXCJyb3dcIn19PlxuICAgICAgICAgICAgICAgIHtwYXRoUGFydEluZGV4ID4gMCAmJlxuICAgICAgICAgICAgICAgICAgPFRleHQgc3R5bGU9e3ttYXJnaW5SaWdodDogNSwgbWFyZ2luTGVmdDogNX19PlxuICAgICAgICAgICAgICAgICAgICAtXG4gICAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgICAgICAge2h1bWFuTmFtZX1cbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvVmlldz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgIDxWaWV3IHN0eWxlPXt7ZmxleERpcmVjdGlvbjogbWRVcCA/IFwicm93XCIgOiBcImNvbHVtblwifX0+XG4gICAgICAgICAgICA8VmlldyBzdHlsZT17e21hcmdpblRvcDogbWRVcCA/IHVuZGVmaW5lZCA6IDI1fX0+XG4gICAgICAgICAgICAgIDxIZWFkZXI+XG4gICAgICAgICAgICAgICAge3QoXCIucmVsYXRpb25zaGlwc1wiLCB7ZGVmYXVsdFZhbHVlOiBcIlJlbGF0aW9uc2hpcHNcIn0pfVxuICAgICAgICAgICAgICA8L0hlYWRlcj5cbiAgICAgICAgICAgICAge3RoaXMucy5hc3NvY2lhdGlvbnMgJiYgdGhpcy5zb3J0ZWRSZWZsZWN0aW9uc0J5TmFtZSh0aGlzLnMuYXNzb2NpYXRpb25zKS5tYXAoKHJlZmxlY3Rpb24pID0+XG4gICAgICAgICAgICAgICAgPFJlZmxlY3Rpb25FbGVtZW50XG4gICAgICAgICAgICAgICAgICBrZXk9e3JlZmxlY3Rpb24ucmVmbGVjdGlvbk5hbWV9XG4gICAgICAgICAgICAgICAgICBtb2RlbENsYXNzTmFtZT17dGhpcy5zLm1vZGVsQ2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy50dC5vblJlZmxlY3Rpb25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgcmVmbGVjdGlvbj17cmVmbGVjdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgPFZpZXcgc3R5bGU9e3ttYXJnaW5Ub3A6IG1kVXAgPyB1bmRlZmluZWQgOiAyNX19PlxuICAgICAgICAgICAgICA8SGVhZGVyPlxuICAgICAgICAgICAgICAgIHt0KFwiLmF0dHJpYnV0ZXNcIiwge2RlZmF1bHRWYWx1ZTogXCJBdHRyaWJ1dGVzXCJ9KX1cbiAgICAgICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgICAgICAgIHt0aGlzLnMucmFuc2Fja2FibGVBdHRyaWJ1dGVzICYmIHRoaXMuc29ydGVkQXR0cmlidXRlc0J5TmFtZSh0aGlzLnMucmFuc2Fja2FibGVBdHRyaWJ1dGVzKT8ubWFwKChhdHRyaWJ1dGUpID0+XG4gICAgICAgICAgICAgICAgPEF0dHJpYnV0ZUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZT17YXR0cmlidXRlLmF0dHJpYnV0ZU5hbWUgPT0gdGhpcy5zLmF0dHJpYnV0ZT8uYXR0cmlidXRlTmFtZX1cbiAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZT17YXR0cmlidXRlfVxuICAgICAgICAgICAgICAgICAga2V5PXthdHRyaWJ1dGUuYXR0cmlidXRlTmFtZX1cbiAgICAgICAgICAgICAgICAgIG1vZGVsQ2xhc3NOYW1lPXt0aGlzLnMubW9kZWxDbGFzc05hbWV9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnR0Lm9uQXR0cmlidXRlQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7dGhpcy5zLnJhbnNhY2thYmxlU2NvcGVzPy5tYXAoKHNjb3BlKSA9PlxuICAgICAgICAgICAgICAgIDxTY29wZUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZT17c2NvcGUgPT0gdGhpcy5zLnNjb3BlfVxuICAgICAgICAgICAgICAgICAga2V5PXtzY29wZX1cbiAgICAgICAgICAgICAgICAgIHNjb3BlPXtzY29wZX1cbiAgICAgICAgICAgICAgICAgIG9uU2NvcGVDbGlja2VkPXt0aGlzLnR0Lm9uU2NvcGVDbGlja2VkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgICAgICA8VmlldyBzdHlsZT17e21hcmdpblRvcDogbWRVcCA/IHVuZGVmaW5lZCA6IDI1fX0+XG4gICAgICAgICAgICAgIDxIZWFkZXI+XG4gICAgICAgICAgICAgICAge3QoXCIuc2VhcmNoXCIsIHtkZWZhdWx0VmFsdWU6IFwiU2VhcmNoXCJ9KX1cbiAgICAgICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgICAgICAgIDxWaWV3PlxuICAgICAgICAgICAgICAgIHtwcmVkaWNhdGVzICYmICF0aGlzLnMuc2NvcGUgJiZcbiAgICAgICAgICAgICAgICAgIDxTZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHJlZGljYXRlLXNlbGVjdFwiXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17cHJlZGljYXRlPy5uYW1lfVxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQmxhbmtcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMudHQub25QcmVkaWNhdGVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtwcmVkaWNhdGVzLm1hcCgocHJlZGljYXRlKSA9PiBkaWdnKHByZWRpY2F0ZSwgXCJuYW1lXCIpKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgICAgICAgIDxWaWV3IHN0eWxlPXt7bWFyZ2luVG9wOiAxMH19PlxuICAgICAgICAgICAgICAgIHsoKGF0dHJpYnV0ZSAmJiBwcmVkaWNhdGUpIHx8IHNjb3BlKSAmJlxuICAgICAgICAgICAgICAgICAgPElucHV0IGNsYXNzTmFtZT1cInZhbHVlLWlucHV0XCIgZGVmYXVsdFZhbHVlPXt2YWx1ZX0gaW5wdXRSZWY9e3ZhbHVlSW5wdXRSZWZ9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgIDxWaWV3IHN0eWxlPXt7ZmxleERpcmVjdGlvbjogXCJyb3dcIiwganVzdGlmeUNvbnRlbnQ6IFwiZW5kXCIsIG1hcmdpblRvcDogMTB9fT5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGFuZ2VyXG4gICAgICAgICAgICAgIGljb249XCJyZW1vdmVcIlxuICAgICAgICAgICAgICBsYWJlbD17dChcIi5jYW5jZWxcIiwge2RlZmF1bHRWYWx1ZTogXCJDYW5jZWxcIn0pfVxuICAgICAgICAgICAgICBvblByZXNzPXt0aGlzLnAub25SZXF1ZXN0Q2xvc2V9XG4gICAgICAgICAgICAgIHByZXNzYWJsZVByb3BzPXt0aGlzLmNhY2hlKFwiY2FuY2VsQnV0dG9uUHJlc3NhYmxlUHJvcHNcIiwge1xuICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiA1XG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFzdWJtaXRFbmFibGVkfVxuICAgICAgICAgICAgICBpY29uPVwiY2hlY2tcIlxuICAgICAgICAgICAgICBsYWJlbD17dChcIi5hcHBseVwiLCB7ZGVmYXVsdFZhbHVlOiBcIkFwcGx5XCJ9KX1cbiAgICAgICAgICAgICAgcHJlc3NhYmxlUHJvcHM9e3RoaXMuY2FjaGUoXCJhcHBsZUJ1dHRvblByZXNzYWJsZVByb3BzXCIsIHtcbiAgICAgICAgICAgICAgICBzdHlsZToge21hcmdpbkxlZnQ6IDV9LFxuICAgICAgICAgICAgICAgIHRlc3RJRDogXCJhcHBseS1maWx0ZXItYnV0dG9uXCJcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIHN1Ym1pdFxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgIDwvRm9ybT5cbiAgICAgICAge3RoaXMucy5sb2FkaW5nID4gMCAmJlxuICAgICAgICAgIDxWaWV3XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxBY3Rpdml0eUluZGljYXRvciBzaXplPVwibGFyZ2VcIiAvPlxuICAgICAgICAgIDwvVmlldz5cbiAgICAgICAgfVxuICAgICAgPC9DYXJkPlxuICAgIClcbiAgfVxuXG4gIGN1cnJlbnRNb2RlbENsYXNzRnJvbVBhdGgocGF0aCkge1xuICAgIGNvbnN0IHttb2RlbENsYXNzfSA9IHRoaXMucFxuICAgIGxldCBjdXJyZW50TW9kZWxDbGFzcyA9IG1vZGVsQ2xhc3NcblxuICAgIGZvciAoY29uc3QgcGF0aFBhcnQgb2YgcGF0aCkge1xuICAgICAgY29uc3QgY2FtZWxpemVkUGF0aFBhcnQgPSBpbmZsZWN0aW9uLmNhbWVsaXplKHBhdGhQYXJ0LCB0cnVlKVxuICAgICAgY29uc3QgYXNzb2NpYXRpb24gPSBjdXJyZW50TW9kZWxDbGFzcy5yYW5zYWNrYWJsZUFzc29jaWF0aW9ucygpLmZpbmQoKHJlZmxlY3Rpb24pID0+IHJlZmxlY3Rpb24ubmFtZSgpID09IGNhbWVsaXplZFBhdGhQYXJ0KVxuXG4gICAgICBpZiAoIWFzc29jaWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHJhbnNhY2thYmxlQXNzb2NpYXRpb25OYW1lcyA9IGN1cnJlbnRNb2RlbENsYXNzLnJhbnNhY2thYmxlQXNzb2NpYXRpb25zKCkubWFwKChyZWZsZWN0aW9uKSA9PiByZWZsZWN0aW9uLm5hbWUoKSkuam9pbihcIiwgXCIpXG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIFJhbnNhY2thYmxlIGFzc29jaWF0aW9uIGJ5IHRoYXQgbmFtZTogJHtjYW1lbGl6ZWRQYXRoUGFydH0gaW4gJHtyYW5zYWNrYWJsZUFzc29jaWF0aW9uTmFtZXN9YClcbiAgICAgIH1cblxuICAgICAgY3VycmVudE1vZGVsQ2xhc3MgPSBhc3NvY2lhdGlvbi5tb2RlbENsYXNzKClcbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudE1vZGVsQ2xhc3NcbiAgfVxuXG4gIGN1cnJlbnRQYXRoUGFydHMoKSB7XG4gICAgY29uc3Qge21vZGVsQ2xhc3N9ID0gdGhpcy5wXG4gICAgY29uc3Qge3BhdGh9ID0gdGhpcy5zXG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBsZXQgY3VycmVudE1vZGVsQ2xhc3MgPSBtb2RlbENsYXNzXG5cbiAgICByZXN1bHQucHVzaCh7XG4gICAgICBtb2RlbENsYXNzLFxuICAgICAgdHJhbnNsYXRpb246IG1vZGVsQ2xhc3MubW9kZWxOYW1lKCkuaHVtYW4oe2NvdW50OiAyfSlcbiAgICB9KVxuXG4gICAgZm9yIChjb25zdCBwYXRoUGFydCBvZiBwYXRoKSB7XG4gICAgICBjb25zdCBjYW1lbGl6ZWRQYXRoUGFydCA9IGluZmxlY3Rpb24uY2FtZWxpemUocGF0aFBhcnQsIHRydWUpXG4gICAgICBjb25zdCBwYXRoUGFydFRyYW5zbGF0aW9uID0gY3VycmVudE1vZGVsQ2xhc3MuaHVtYW5BdHRyaWJ1dGVOYW1lKGNhbWVsaXplZFBhdGhQYXJ0KVxuXG4gICAgICBjdXJyZW50TW9kZWxDbGFzcyA9IGN1cnJlbnRNb2RlbENsYXNzLnJhbnNhY2thYmxlQXNzb2NpYXRpb25zKCkuZmluZCgocmVmbGVjdGlvbikgPT4gcmVmbGVjdGlvbi5uYW1lKCkgPT0gY2FtZWxpemVkUGF0aFBhcnQpLm1vZGVsQ2xhc3MoKVxuXG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG1vZGVsQ2xhc3M6IGN1cnJlbnRNb2RlbENsYXNzLFxuICAgICAgICB0cmFuc2xhdGlvbjogcGF0aFBhcnRUcmFuc2xhdGlvblxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBvbkF0dHJpYnV0ZUNsaWNrZWQgPSAoe2F0dHJpYnV0ZX0pID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF0dHJpYnV0ZSxcbiAgICAgIHNjb3BlOiB1bmRlZmluZWRcbiAgICB9KVxuICB9XG5cbiAgb25QcmVkaWNhdGVDaGFuZ2VkID0gKGUpID0+IHtcbiAgICBjb25zdCBjaG9zZW5QcmVkaWNhdGVOYW1lID0gZGlnZyhlLCBcInRhcmdldFwiLCBcInZhbHVlXCIpXG4gICAgY29uc3QgcHJlZGljYXRlID0gdGhpcy5zLnByZWRpY2F0ZXMuZmluZCgocHJlZGljYXRlKSA9PiBwcmVkaWNhdGUubmFtZSA9PSBjaG9zZW5QcmVkaWNhdGVOYW1lKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7cHJlZGljYXRlfSlcbiAgfVxuXG4gIG9uUmVmbGVjdGlvbkNsaWNrZWQgPSAoe3JlZmxlY3Rpb259KSA9PiB7XG4gICAgY29uc3QgbmV3UGF0aCA9IHRoaXMucy5wYXRoLmNvbmNhdChbcmVmbGVjdGlvbl0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFzc29jaWF0aW9uczogbnVsbCxcbiAgICAgIGF0dHJpYnV0ZTogdW5kZWZpbmVkLFxuICAgICAgYWN0dWFsQ3VycmVudE1vZGVsQ2xhc3M6IHttb2RlbENsYXNzOiBkaWdnKHJlZmxlY3Rpb24sIFwicmVzb3VyY2VcIil9LFxuICAgICAgbW9kZWxDbGFzc05hbWU6IGRpZ2cocmVmbGVjdGlvbiwgXCJtb2RlbENsYXNzTmFtZVwiKSxcbiAgICAgIHBhdGg6IG5ld1BhdGgsXG4gICAgICBwcmVkaWNhdGU6IHVuZGVmaW5lZFxuICAgIH0pXG4gIH1cblxuICBvblNjb3BlQ2xpY2tlZCA9ICh7c2NvcGV9KSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRyaWJ1dGU6IHVuZGVmaW5lZCxcbiAgICAgIHByZWRpY2F0ZTogdW5kZWZpbmVkLFxuICAgICAgc2NvcGVcbiAgICB9KVxuICB9XG5cbiAgb25TdWJtaXQgPSAoKSA9PiB7XG4gICAgY29uc3Qge2ZpbHRlciwgcXVlcnlTZWFyY2hOYW1lfSA9IHRoaXMucFxuICAgIGNvbnN0IHthdHRyaWJ1dGUsIHBhdGgsIHByZWRpY2F0ZSwgc2NvcGV9ID0gdGhpcy5zXG4gICAgY29uc3Qge2ZpbHRlckluZGV4fSA9IGRpZ3MoZmlsdGVyLCBcImZpbHRlckluZGV4XCIpXG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zID0gUGFyYW1zLnBhcnNlKClbcXVlcnlTZWFyY2hOYW1lXSB8fCB7fVxuICAgIGNvbnN0IHZhbHVlID0gZGlnZyh0aGlzLnR0LnZhbHVlSW5wdXRSZWYsIFwiY3VycmVudFwiLCBcInZhbHVlXCIpXG4gICAgY29uc3QgcCA9IHBhdGgubWFwKChyZWZsZWN0aW9uKSA9PiBpbmZsZWN0aW9uLnVuZGVyc2NvcmUocmVmbGVjdGlvbi5yZWZsZWN0aW9uTmFtZSkpXG4gICAgY29uc3QgbmV3U2VhcmNoUGFyYW1zID0ge1xuICAgICAgcCxcbiAgICAgIHY6IHZhbHVlXG4gICAgfVxuXG4gICAgaWYgKGF0dHJpYnV0ZSkge1xuICAgICAgbmV3U2VhcmNoUGFyYW1zLmEgPSBkaWdnKGF0dHJpYnV0ZSwgXCJhdHRyaWJ1dGVOYW1lXCIpXG4gICAgICBuZXdTZWFyY2hQYXJhbXMucHJlID0gZGlnZyhwcmVkaWNhdGUsIFwibmFtZVwiKVxuICAgIH0gZWxzZSBpZiAoc2NvcGUpIHtcbiAgICAgIG5ld1NlYXJjaFBhcmFtcy5zYyA9IHNjb3BlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvbnQga25vdyBpZiBzaG91bGQgc2VhcmNoIGZvciBhdHRyaWJ1dGUgb3Igc2NvcGU/XCIpXG4gICAgfVxuXG4gICAgc2VhcmNoUGFyYW1zW2ZpbHRlckluZGV4XSA9IEpTT04uc3RyaW5naWZ5KG5ld1NlYXJjaFBhcmFtcylcblxuICAgIGNvbnN0IG5ld1BhcmFtcyA9IHt9XG5cbiAgICBuZXdQYXJhbXNbcXVlcnlTZWFyY2hOYW1lXSA9IHNlYXJjaFBhcmFtc1xuXG4gICAgUGFyYW1zLmNoYW5nZVBhcmFtcyhuZXdQYXJhbXMpXG5cbiAgICB0aGlzLnByb3BzLm9uQXBwbHlDbGlja2VkKClcbiAgfVxuXG4gIHJlZmxlY3Rpb25zV2l0aE1vZGVsQ2xhc3MocmVmbGVjdGlvbnMpIHtcbiAgICByZXR1cm4gcmVmbGVjdGlvbnMuZmlsdGVyKChyZWZsZWN0aW9uKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZWZsZWN0aW9uLm1vZGVsQ2xhc3MoKVxuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgc29ydGVkQXR0cmlidXRlc0J5TmFtZShhdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZXMuc29ydCgoYSwgYikgPT5cbiAgICAgIGRpZ2coYSwgXCJodW1hbk5hbWVcIilcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgZGlnZyhiLCBcImh1bWFuTmFtZVwiKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIClcbiAgICApXG4gIH1cblxuICBzb3J0ZWRSZWZsZWN0aW9uc0J5TmFtZShyZWZsZWN0aW9ucykge1xuICAgIHJldHVybiByZWZsZWN0aW9ucy5zb3J0KChhLCBiKSA9PlxuICAgICAgZGlnZyhhLCBcImh1bWFuTmFtZVwiKVxuICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAubG9jYWxlQ29tcGFyZShcbiAgICAgICAgICBkaWdnKGIsIFwiaHVtYW5OYW1lXCIpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgKVxuICAgIClcbiAgfVxufSkpXG4iXX0=