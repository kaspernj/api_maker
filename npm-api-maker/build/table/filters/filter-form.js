import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import AttributeElement from "./attribute-element";
import BaseComponent from "../../base-component";
import Button from "../../utils/button";
import Card from "../../utils/card";
import { digg, digs } from "diggerize";
import * as inflection from "inflection";
import { Form } from "../../form";
import Header from "../../utils/header";
import Input from "../../inputs/input";
import memo from "set-state-compare/build/memo.js";
import Params from "../../params.js";
import PropTypes from "prop-types";
import PropTypesExact from "prop-types-exact";
import ReflectionElement from "./reflection-element";
import ScopeElement from "./scope-element";
import Select from "../../inputs/select";
import Services from "../../services.js";
import { shapeComponent } from "set-state-compare/build/shape-component.js";
import Text from "../../utils/text";
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
        return (_jsxs(Card, { testID: "api-maker/table/filters/filter-form", style: this.cache("cardStyle", {
                width: mdUp ? undefined : "100%",
                minWidth: 50,
                minHeight: 50
            }, [mdUp]), children: [_jsxs(Form, { onSubmit: this.tt.onSubmit, children: [_jsx(View, { style: { flexDirection: "row" }, children: path.map(({ humanName, reflectionName }, pathPartIndex) => _jsxs(View, { style: { flexDirection: "row" }, children: [pathPartIndex > 0 &&
                                        _jsx(Text, { style: { marginRight: 5, marginLeft: 5 }, children: "-" }), _jsx(Text, { children: humanName })] }, `${pathPartIndex}-${reflectionName}`)) }), _jsxs(View, { style: { flexDirection: mdUp ? "row" : "column" }, children: [_jsxs(View, { style: { marginTop: mdUp ? undefined : 25 }, children: [_jsx(Header, { children: t(".relationships", { defaultValue: "Relationships" }) }), this.s.associations && this.sortedReflectionsByName(this.s.associations).map((reflection) => _jsx(ReflectionElement, { modelClassName: this.s.modelClassName, onClick: this.tt.onReflectionClicked, reflection: reflection }, reflection.reflectionName))] }), _jsxs(View, { style: { marginTop: mdUp ? undefined : 25 }, children: [_jsx(Header, { children: t(".attributes", { defaultValue: "Attributes" }) }), this.s.ransackableAttributes && this.sortedAttributesByName(this.s.ransackableAttributes)?.map((attribute) => _jsx(AttributeElement, { active: attribute.attributeName == this.s.attribute?.attributeName, attribute: attribute, modelClassName: this.s.modelClassName, onClick: this.tt.onAttributeClicked }, attribute.attributeName)), this.s.ransackableScopes?.map((scope) => _jsx(ScopeElement, { active: scope == this.s.scope, scope: scope, onScopeClicked: this.tt.onScopeClicked }, scope))] }), _jsxs(View, { style: { marginTop: mdUp ? undefined : 25 }, children: [_jsx(Header, { children: t(".search", { defaultValue: "Search" }) }), _jsx(View, { children: predicates && !this.s.scope &&
                                                _jsx(Select, { className: "predicate-select", defaultValue: predicate?.name, includeBlank: true, onChange: this.tt.onPredicateChanged, options: predicates.map((predicate) => digg(predicate, "name")) }) }), _jsx(View, { style: { marginTop: 10 }, children: ((attribute && predicate) || scope) &&
                                                _jsx(Input, { className: "value-input", defaultValue: value, inputRef: valueInputRef }) })] })] }), _jsxs(View, { style: { flexDirection: "row", justifyContent: "end", marginTop: 10 }, children: [_jsx(Button, { danger: true, icon: "remove", label: t(".cancel", { defaultValue: "Cancel" }), onPress: this.p.onRequestClose, pressableProps: this.cache("cancelButtonPressableProps", {
                                        marginRight: 5
                                    }) }), _jsx(Button, { disabled: !submitEnabled, icon: "check", label: t(".apply", { defaultValue: "Apply" }), pressableProps: this.cache("appleButtonPressableProps", {
                                        style: { marginLeft: 5 },
                                        testID: "apply-filter-button"
                                    }), submit: true })] })] }), this.s.loading > 0 &&
                    _jsx(View, { style: {
                            alignItems: "center",
                            justifyContent: "center",
                            position: "absolute",
                            width: "100%",
                            height: "100%"
                        }, children: _jsx(ActivityIndicator, { size: "large" }) })] }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLWZvcm0uanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInRhYmxlL2ZpbHRlcnMvZmlsdGVyLWZvcm0uanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsTUFBTSxPQUFPLENBQUE7QUFDNUMsT0FBTyxFQUFDLGlCQUFpQixFQUFFLElBQUksRUFBQyxNQUFNLGNBQWMsQ0FBQTtBQUNwRCxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFBO0FBQ2xELE9BQU8sYUFBYSxNQUFNLHNCQUFzQixDQUFBO0FBQ2hELE9BQU8sTUFBTSxNQUFNLG9CQUFvQixDQUFBO0FBQ3ZDLE9BQU8sSUFBSSxNQUFNLGtCQUFrQixDQUFBO0FBQ25DLE9BQU8sRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLE1BQU0sV0FBVyxDQUFBO0FBQ3BDLE9BQU8sS0FBSyxVQUFVLE1BQU0sWUFBWSxDQUFBO0FBQ3hDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxZQUFZLENBQUE7QUFDL0IsT0FBTyxNQUFNLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxLQUFLLE1BQU0sb0JBQW9CLENBQUE7QUFDdEMsT0FBTyxJQUFJLE1BQU0saUNBQWlDLENBQUE7QUFDbEQsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFDcEMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFBO0FBQ2xDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFBO0FBQzdDLE9BQU8saUJBQWlCLE1BQU0sc0JBQXNCLENBQUE7QUFDcEQsT0FBTyxZQUFZLE1BQU0saUJBQWlCLENBQUE7QUFDMUMsT0FBTyxNQUFNLE1BQU0scUJBQXFCLENBQUE7QUFDeEMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUE7QUFDeEMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDRDQUE0QyxDQUFBO0FBQ3pFLE9BQU8sSUFBSSxNQUFNLGtCQUFr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RSxDQUFBO2dCQUV2QixPQUFPLElBQUksQ0FBQTtZQUNiLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLE9BQU8sS0FBSyxDQUFBO1lBQ2QsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELHNCQUFzQixDQUFDLFVBQVU7UUFDL0IsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQzlCLElBQUksQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDO2FBQ2pCLFdBQVcsRUFBRTthQUNiLGFBQWEsQ0FDWixJQUFJLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUNuQyxDQUNKLENBQUE7SUFDSCxDQUFDO0lBRUQsdUJBQXVCLENBQUMsV0FBVztRQUNqQyxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FDL0IsSUFBSSxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUM7YUFDakIsV0FBVyxFQUFFO2FBQ2IsYUFBYSxDQUNaLElBQUksQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQ25DLENBQ0osQ0FBQTtJQUNILENBQUM7Q0FDRixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwge3VzZU1lbW8sIHVzZVJlZn0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7QWN0aXZpdHlJbmRpY2F0b3IsIFZpZXd9IGZyb20gXCJyZWFjdC1uYXRpdmVcIlxuaW1wb3J0IEF0dHJpYnV0ZUVsZW1lbnQgZnJvbSBcIi4vYXR0cmlidXRlLWVsZW1lbnRcIlxuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSBcIi4uLy4uL2Jhc2UtY29tcG9uZW50XCJcbmltcG9ydCBCdXR0b24gZnJvbSBcIi4uLy4uL3V0aWxzL2J1dHRvblwiXG5pbXBvcnQgQ2FyZCBmcm9tIFwiLi4vLi4vdXRpbHMvY2FyZFwiXG5pbXBvcnQge2RpZ2csIGRpZ3N9IGZyb20gXCJkaWdnZXJpemVcIlxuaW1wb3J0ICogYXMgaW5mbGVjdGlvbiBmcm9tIFwiaW5mbGVjdGlvblwiXG5pbXBvcnQge0Zvcm19IGZyb20gXCIuLi8uLi9mb3JtXCJcbmltcG9ydCBIZWFkZXIgZnJvbSBcIi4uLy4uL3V0aWxzL2hlYWRlclwiXG5pbXBvcnQgSW5wdXQgZnJvbSBcIi4uLy4uL2lucHV0cy9pbnB1dFwiXG5pbXBvcnQgbWVtbyBmcm9tIFwic2V0LXN0YXRlLWNvbXBhcmUvYnVpbGQvbWVtby5qc1wiXG5pbXBvcnQgUGFyYW1zIGZyb20gXCIuLi8uLi9wYXJhbXMuanNcIlxuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiXG5pbXBvcnQgUHJvcFR5cGVzRXhhY3QgZnJvbSBcInByb3AtdHlwZXMtZXhhY3RcIlxuaW1wb3J0IFJlZmxlY3Rpb25FbGVtZW50IGZyb20gXCIuL3JlZmxlY3Rpb24tZWxlbWVudFwiXG5pbXBvcnQgU2NvcGVFbGVtZW50IGZyb20gXCIuL3Njb3BlLWVsZW1lbnRcIlxuaW1wb3J0IFNlbGVjdCBmcm9tIFwiLi4vLi4vaW5wdXRzL3NlbGVjdFwiXG5pbXBvcnQgU2VydmljZXMgZnJvbSBcIi4uLy4uL3NlcnZpY2VzLmpzXCJcbmltcG9ydCB7c2hhcGVDb21wb25lbnR9IGZyb20gXCJzZXQtc3RhdGUtY29tcGFyZS9idWlsZC9zaGFwZS1jb21wb25lbnQuanNcIlxuaW1wb3J0IFRleHQgZnJvbSBcIi4uLy4uL3V0aWxzL3RleHRcIlxuaW1wb3J0IHVzZUJyZWFrcG9pbnQgZnJvbSBcIi4uLy4uL3VzZS1icmVha3BvaW50LmpzXCJcbmltcG9ydCB1c2VJMThuIGZyb20gXCJpMThuLW9uLXN0ZXJvaWRzL3NyYy91c2UtaTE4bi5tanNcIlxuXG5leHBvcnQgZGVmYXVsdCBtZW1vKHNoYXBlQ29tcG9uZW50KGNsYXNzIEFwaU1ha2VyVGFibGVGaWx0ZXJzRmlsdGVyRm9ybSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0gUHJvcFR5cGVzRXhhY3Qoe1xuICAgIGZpbHRlcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBtb2RlbENsYXNzOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uQXBwbHlDbGlja2VkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uUmVxdWVzdENsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHF1ZXJ5U2VhcmNoTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkXG4gIH0pXG5cbiAgc2V0dXAoKSB7XG4gICAgY29uc3Qge3R9ID0gdXNlSTE4bih7bmFtZXNwYWNlOiBcImpzLmFwaV9tYWtlci50YWJsZS5maWx0ZXJzLmZpbHRlcl9mb3JtXCJ9KVxuXG4gICAgdGhpcy51c2VTdGF0ZXMoe1xuICAgICAgYXNzb2NpYXRpb25zOiBudWxsLFxuICAgICAgYXR0cmlidXRlOiB1bmRlZmluZWQsXG4gICAgICBhY3R1YWxDdXJyZW50TW9kZWxDbGFzczogKCkgPT4gKHttb2RlbENsYXNzOiB0aGlzLnAubW9kZWxDbGFzc30pLFxuICAgICAgbG9hZGluZzogMCxcbiAgICAgIG1vZGVsQ2xhc3NOYW1lOiBkaWdnKHRoaXMucC5tb2RlbENsYXNzLm1vZGVsQ2xhc3NEYXRhKCksIFwiY2xhc3NOYW1lXCIpLFxuICAgICAgcGF0aDogW10sXG4gICAgICBwcmVkaWNhdGU6IHVuZGVmaW5lZCxcbiAgICAgIHByZWRpY2F0ZXM6IHVuZGVmaW5lZCxcbiAgICAgIHJhbnNhY2thYmxlQXR0cmlidXRlczogdW5kZWZpbmVkLFxuICAgICAgcmFuc2Fja2FibGVTY29wZXM6IHVuZGVmaW5lZCxcbiAgICAgIHNjb3BlOiB0aGlzLnByb3BzLmZpbHRlci5zYyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpbHRlci52XG4gICAgfSlcblxuICAgIHRoaXMuc2V0SW5zdGFuY2Uoe1xuICAgICAgYnJlYWtwb2ludDogdXNlQnJlYWtwb2ludCgpLFxuICAgICAgdCxcbiAgICAgIHZhbHVlSW5wdXRSZWY6IHVzZVJlZigpLFxuICAgIH0pXG5cbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHRoaXMubG9hZFJhbnNhY2tQcmVkaWNhdGVzKClcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZmlsdGVyLnYpIHtcbiAgICAgICAgdGhpcy5sb2FkSW5pdGlhbFZhbHVlc1dpdGhMb2FkaW5nSW5kaWNhdG9yKClcbiAgICAgIH1cbiAgICB9LCBbXSlcblxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgdGhpcy5sb2FkQXNzb2NpYXRpb25zKClcbiAgICB9LCBbdGhpcy5zLm1vZGVsQ2xhc3NOYW1lXSlcbiAgfVxuXG4gIGN1cnJlbnRNb2RlbENsYXNzID0gKCkgPT4gZGlnZyh0aGlzLnMuYWN0dWFsQ3VycmVudE1vZGVsQ2xhc3MsIFwibW9kZWxDbGFzc1wiKVxuXG4gIHBhcnNlQXNzb2NpYXRpb25EYXRhKHJlc3VsdCkge1xuICAgIGNvbnN0IGFzc29jaWF0aW9ucyA9IHJlc3VsdC5hc3NvY2lhdGlvbnMubWFwKCh7aHVtYW5fbmFtZSwgbW9kZWxfY2xhc3NfbmFtZSwgcmVmbGVjdGlvbl9uYW1lLCByZXNvdXJjZX0pID0+ICh7XG4gICAgICBodW1hbk5hbWU6IGh1bWFuX25hbWUsXG4gICAgICBtb2RlbENsYXNzTmFtZTogbW9kZWxfY2xhc3NfbmFtZSxcbiAgICAgIHJlZmxlY3Rpb25OYW1lOiBpbmZsZWN0aW9uLmNhbWVsaXplKHJlZmxlY3Rpb25fbmFtZSwgdHJ1ZSksXG4gICAgICByZXNvdXJjZVxuICAgIH0pKVxuICAgIGNvbnN0IHJhbnNhY2thYmxlQXR0cmlidXRlcyA9IGRpZ2cocmVzdWx0LCBcInJhbnNhY2thYmxlX2F0dHJpYnV0ZXNcIikubWFwKCh7YXR0cmlidXRlX25hbWU6IGF0dHJpYnV0ZU5hbWUsIGh1bWFuX25hbWU6IGh1bWFuTmFtZX0pID0+ICh7XG4gICAgICBhdHRyaWJ1dGVOYW1lLCBodW1hbk5hbWVcbiAgICB9KSlcbiAgICBjb25zdCByYW5zYWNrYWJsZVNjb3BlcyA9IGRpZ2cocmVzdWx0LCBcInJhbnNhY2thYmxlX3Njb3Blc1wiKVxuXG4gICAgcmV0dXJuIHthc3NvY2lhdGlvbnMsIHJhbnNhY2thYmxlQXR0cmlidXRlcywgcmFuc2Fja2FibGVTY29wZXN9XG4gIH1cblxuICBhc3luYyBsb2FkQXNzb2NpYXRpb25zKCkge1xuICAgIHRoaXMuaW5jcmVhc2VMb2FkaW5nKClcblxuICAgIHRyeSB7XG4gICAgICBpZiAoIXRoaXMucy5tb2RlbENsYXNzTmFtZSkgdGhyb3cgbmV3IEVycm9yKFwiJ21vZGVsQ2xhc3NOYW1lJyBub3Qgc2V0IGluIHN0YXRlXCIpXG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFNlcnZpY2VzLmN1cnJlbnQoKS5zZW5kUmVxdWVzdChcIk1vZGVsczo6QXNzb2NpYXRpb25zXCIsIHttb2RlbF9jbGFzc19uYW1lOiB0aGlzLnMubW9kZWxDbGFzc05hbWV9KVxuICAgICAgY29uc3Qge2Fzc29jaWF0aW9ucywgcmFuc2Fja2FibGVBdHRyaWJ1dGVzLCByYW5zYWNrYWJsZVNjb3Blc30gPSB0aGlzLnBhcnNlQXNzb2NpYXRpb25EYXRhKHJlc3VsdClcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7YXNzb2NpYXRpb25zLCByYW5zYWNrYWJsZUF0dHJpYnV0ZXMsIHJhbnNhY2thYmxlU2NvcGVzfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5kZWNyZWFzZUxvYWRpbmcoKVxuICAgIH1cbiAgfVxuXG4gIGRlY3JlYXNlTG9hZGluZyA9ICgpID0+IHRoaXMuc2V0U3RhdGUoKHByZXZTdGF0ZSkgPT4gKHtsb2FkaW5nOiBwcmV2U3RhdGUubG9hZGluZyAtIDF9KSlcbiAgaW5jcmVhc2VMb2FkaW5nID0gKCkgPT4gdGhpcy5zZXRTdGF0ZSgocHJldlN0YXRlKSA9PiAoe2xvYWRpbmc6IHByZXZTdGF0ZS5sb2FkaW5nICsgMX0pKVxuXG4gIGFzeW5jIGxvYWRJbml0aWFsVmFsdWVzV2l0aExvYWRpbmdJbmRpY2F0b3IoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuaW5jcmVhc2VMb2FkaW5nKClcbiAgICAgIGF3YWl0IHRoaXMubG9hZEluaXRpYWxWYWx1ZXMoKVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLmRlY3JlYXNlTG9hZGluZygpXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgbG9hZEluaXRpYWxWYWx1ZXMoKSB7XG4gICAgaWYgKCF0aGlzLnMubW9kZWxDbGFzc05hbWUpIHRocm93IG5ldyBFcnJvcihcIidtb2RlbENsYXNzTmFtZScgbm90IHNldCBpbiBzdGF0ZVwiKVxuXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IFNlcnZpY2VzLmN1cnJlbnQoKS5zZW5kUmVxdWVzdChcIk1vZGVsczo6QXNzb2NpYXRpb25zXCIsIHttb2RlbF9jbGFzc19uYW1lOiB0aGlzLnMubW9kZWxDbGFzc05hbWV9KVxuICAgIGxldCBkYXRhID0gdGhpcy5wYXJzZUFzc29jaWF0aW9uRGF0YShyZXN1bHQpXG4gICAgbGV0IG1vZGVsQ2xhc3NOYW1lID0gdGhpcy5zLm1vZGVsQ2xhc3NOYW1lXG4gICAgY29uc3QgcGF0aCA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHBhdGhQYXJ0IG9mIHRoaXMucHJvcHMuZmlsdGVyLnApIHtcbiAgICAgIGNvbnN0IHJlZmxlY3Rpb24gPSBkYXRhLmFzc29jaWF0aW9ucy5maW5kKChhc3NvY2lhdGlvbikgPT4gZGlnZyhhc3NvY2lhdGlvbiwgXCJyZWZsZWN0aW9uTmFtZVwiKSA9PSBpbmZsZWN0aW9uLmNhbWVsaXplKHBhdGhQYXJ0LCB0cnVlKSlcblxuICAgICAgaWYgKCFyZWZsZWN0aW9uKSB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgYXNzb2NpYXRpb24gYnkgdGhhdCBuYW1lICR7dGhpcy5zLm1vZGVsQ2xhc3NOYW1lfSMke3BhdGhQYXJ0fWApXG5cbiAgICAgIG1vZGVsQ2xhc3NOYW1lID0gZGlnZyhyZWZsZWN0aW9uLCBcIm1vZGVsQ2xhc3NOYW1lXCIpXG5cbiAgICAgIGlmICghbW9kZWxDbGFzc05hbWUpIHtcbiAgICAgICAgY29uc3QgcGF0aE5hbWVzID0gcGF0aC5tYXAoKHBhdGhQYXJ0KSA9PiBwYXRoUGFydC5uYW1lKCkpLmpvaW4oXCIuXCIpXG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBtb2RlbCBjbGFzcyBuYW1lIGZyb20gJHtwYXRoTmFtZXN9LiR7cmVmbGVjdGlvbi5uYW1lKCl9YClcbiAgICAgIH1cblxuICAgICAgcmVzdWx0ID0gYXdhaXQgU2VydmljZXMuY3VycmVudCgpLnNlbmRSZXF1ZXN0KFwiTW9kZWxzOjpBc3NvY2lhdGlvbnNcIiwge21vZGVsX2NsYXNzX25hbWU6IG1vZGVsQ2xhc3NOYW1lfSlcbiAgICAgIGRhdGEgPSB0aGlzLnBhcnNlQXNzb2NpYXRpb25EYXRhKHJlc3VsdClcblxuICAgICAgcGF0aC5wdXNoKHJlZmxlY3Rpb24pXG4gICAgfVxuXG4gICAgY29uc3Qge3JhbnNhY2thYmxlQXR0cmlidXRlc30gPSBkYXRhXG4gICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5wLmZpbHRlci5hXG4gICAgY29uc3QgcmFuc2Fja2FibGVBdHRyaWJ1dGUgPSByYW5zYWNrYWJsZUF0dHJpYnV0ZXMuZmluZCgocmFuc2Fja2FibGVBdHRyaWJ1dGUpID0+IGRpZ2cocmFuc2Fja2FibGVBdHRyaWJ1dGUsIFwiYXR0cmlidXRlTmFtZVwiKSA9PSBhdHRyaWJ1dGUpXG5cbiAgICB0aGlzLnNldFN0YXRlKHthdHRyaWJ1dGU6IHJhbnNhY2thYmxlQXR0cmlidXRlLCBtb2RlbENsYXNzTmFtZSwgcGF0aH0pXG4gIH1cblxuICBhc3luYyBsb2FkUmFuc2Fja1ByZWRpY2F0ZXMoKSB7XG4gICAgdGhpcy5pbmNyZWFzZUxvYWRpbmcoKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgU2VydmljZXMuY3VycmVudCgpLnNlbmRSZXF1ZXN0KFwiUmFuc2Fjazo6UHJlZGljYXRlc1wiKVxuICAgICAgY29uc3QgcHJlZGljYXRlcyA9IGRpZ2cocmVzcG9uc2UsIFwicHJlZGljYXRlc1wiKVxuICAgICAgbGV0IGN1cnJlbnRQcmVkaWNhdGVcblxuICAgICAgaWYgKHRoaXMucHJvcHMuZmlsdGVyLnByZSkge1xuICAgICAgICBjdXJyZW50UHJlZGljYXRlID0gcHJlZGljYXRlcy5maW5kKChwcmVkaWNhdGUpID0+IHByZWRpY2F0ZS5uYW1lID09IHRoaXMucHJvcHMuZmlsdGVyLnByZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHByZWRpY2F0ZTogY3VycmVudFByZWRpY2F0ZSxcbiAgICAgICAgcHJlZGljYXRlc1xuICAgICAgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5kZWNyZWFzZUxvYWRpbmcoKVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludCwgdCwgdmFsdWVJbnB1dFJlZn0gPSB0aGlzLnR0XG4gICAgY29uc3Qge2F0dHJpYnV0ZSwgcGF0aCwgcHJlZGljYXRlLCBwcmVkaWNhdGVzLCBzY29wZSwgdmFsdWV9ID0gdGhpcy5zXG4gICAgY29uc3Qge21kVXB9ID0gYnJlYWtwb2ludFxuICAgIGxldCBzdWJtaXRFbmFibGVkID0gZmFsc2VcblxuICAgIGlmIChhdHRyaWJ1dGUgJiYgcHJlZGljYXRlKSB7XG4gICAgICBzdWJtaXRFbmFibGVkID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoc2NvcGUpIHtcbiAgICAgIHN1Ym1pdEVuYWJsZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxDYXJkXG4gICAgICAgIHRlc3RJRD1cImFwaS1tYWtlci90YWJsZS9maWx0ZXJzL2ZpbHRlci1mb3JtXCJcbiAgICAgICAgc3R5bGU9e3RoaXMuY2FjaGUoXCJjYXJkU3R5bGVcIiwge1xuICAgICAgICAgIHdpZHRoOiBtZFVwID8gdW5kZWZpbmVkIDogXCIxMDAlXCIsXG4gICAgICAgICAgbWluV2lkdGg6IDUwLFxuICAgICAgICAgIG1pbkhlaWdodDogNTBcbiAgICAgICAgfSwgW21kVXBdKX1cbiAgICAgID5cbiAgICAgICAgPEZvcm0gb25TdWJtaXQ9e3RoaXMudHQub25TdWJtaXR9PlxuICAgICAgICAgIDxWaWV3IHN0eWxlPXt7ZmxleERpcmVjdGlvbjogXCJyb3dcIn19PlxuICAgICAgICAgICAge3BhdGgubWFwKCh7aHVtYW5OYW1lLCByZWZsZWN0aW9uTmFtZX0sIHBhdGhQYXJ0SW5kZXgpID0+XG4gICAgICAgICAgICAgIDxWaWV3IGtleT17YCR7cGF0aFBhcnRJbmRleH0tJHtyZWZsZWN0aW9uTmFtZX1gfSBzdHlsZT17e2ZsZXhEaXJlY3Rpb246IFwicm93XCJ9fT5cbiAgICAgICAgICAgICAgICB7cGF0aFBhcnRJbmRleCA+IDAgJiZcbiAgICAgICAgICAgICAgICAgIDxUZXh0IHN0eWxlPXt7bWFyZ2luUmlnaHQ6IDUsIG1hcmdpbkxlZnQ6IDV9fT5cbiAgICAgICAgICAgICAgICAgICAgLVxuICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgICAgIHtodW1hbk5hbWV9XG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvVmlldz5cbiAgICAgICAgICA8VmlldyBzdHlsZT17e2ZsZXhEaXJlY3Rpb246IG1kVXAgPyBcInJvd1wiIDogXCJjb2x1bW5cIn19PlxuICAgICAgICAgICAgPFZpZXcgc3R5bGU9e3ttYXJnaW5Ub3A6IG1kVXAgPyB1bmRlZmluZWQgOiAyNX19PlxuICAgICAgICAgICAgICA8SGVhZGVyPlxuICAgICAgICAgICAgICAgIHt0KFwiLnJlbGF0aW9uc2hpcHNcIiwge2RlZmF1bHRWYWx1ZTogXCJSZWxhdGlvbnNoaXBzXCJ9KX1cbiAgICAgICAgICAgICAgPC9IZWFkZXI+XG4gICAgICAgICAgICAgIHt0aGlzLnMuYXNzb2NpYXRpb25zICYmIHRoaXMuc29ydGVkUmVmbGVjdGlvbnNCeU5hbWUodGhpcy5zLmFzc29jaWF0aW9ucykubWFwKChyZWZsZWN0aW9uKSA9PlxuICAgICAgICAgICAgICAgIDxSZWZsZWN0aW9uRWxlbWVudFxuICAgICAgICAgICAgICAgICAga2V5PXtyZWZsZWN0aW9uLnJlZmxlY3Rpb25OYW1lfVxuICAgICAgICAgICAgICAgICAgbW9kZWxDbGFzc05hbWU9e3RoaXMucy5tb2RlbENsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudHQub25SZWZsZWN0aW9uQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAgIHJlZmxlY3Rpb249e3JlZmxlY3Rpb259XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvVmlldz5cbiAgICAgICAgICAgIDxWaWV3IHN0eWxlPXt7bWFyZ2luVG9wOiBtZFVwID8gdW5kZWZpbmVkIDogMjV9fT5cbiAgICAgICAgICAgICAgPEhlYWRlcj5cbiAgICAgICAgICAgICAgICB7dChcIi5hdHRyaWJ1dGVzXCIsIHtkZWZhdWx0VmFsdWU6IFwiQXR0cmlidXRlc1wifSl9XG4gICAgICAgICAgICAgIDwvSGVhZGVyPlxuICAgICAgICAgICAgICB7dGhpcy5zLnJhbnNhY2thYmxlQXR0cmlidXRlcyAmJiB0aGlzLnNvcnRlZEF0dHJpYnV0ZXNCeU5hbWUodGhpcy5zLnJhbnNhY2thYmxlQXR0cmlidXRlcyk/Lm1hcCgoYXR0cmlidXRlKSA9PlxuICAgICAgICAgICAgICAgIDxBdHRyaWJ1dGVFbGVtZW50XG4gICAgICAgICAgICAgICAgICBhY3RpdmU9e2F0dHJpYnV0ZS5hdHRyaWJ1dGVOYW1lID09IHRoaXMucy5hdHRyaWJ1dGU/LmF0dHJpYnV0ZU5hbWV9XG4gICAgICAgICAgICAgICAgICBhdHRyaWJ1dGU9e2F0dHJpYnV0ZX1cbiAgICAgICAgICAgICAgICAgIGtleT17YXR0cmlidXRlLmF0dHJpYnV0ZU5hbWV9XG4gICAgICAgICAgICAgICAgICBtb2RlbENsYXNzTmFtZT17dGhpcy5zLm1vZGVsQ2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy50dC5vbkF0dHJpYnV0ZUNsaWNrZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge3RoaXMucy5yYW5zYWNrYWJsZVNjb3Blcz8ubWFwKChzY29wZSkgPT5cbiAgICAgICAgICAgICAgICA8U2NvcGVFbGVtZW50XG4gICAgICAgICAgICAgICAgICBhY3RpdmU9e3Njb3BlID09IHRoaXMucy5zY29wZX1cbiAgICAgICAgICAgICAgICAgIGtleT17c2NvcGV9XG4gICAgICAgICAgICAgICAgICBzY29wZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgICBvblNjb3BlQ2xpY2tlZD17dGhpcy50dC5vblNjb3BlQ2xpY2tlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgPFZpZXcgc3R5bGU9e3ttYXJnaW5Ub3A6IG1kVXAgPyB1bmRlZmluZWQgOiAyNX19PlxuICAgICAgICAgICAgICA8SGVhZGVyPlxuICAgICAgICAgICAgICAgIHt0KFwiLnNlYXJjaFwiLCB7ZGVmYXVsdFZhbHVlOiBcIlNlYXJjaFwifSl9XG4gICAgICAgICAgICAgIDwvSGVhZGVyPlxuICAgICAgICAgICAgICA8Vmlldz5cbiAgICAgICAgICAgICAgICB7cHJlZGljYXRlcyAmJiAhdGhpcy5zLnNjb3BlICYmXG4gICAgICAgICAgICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInByZWRpY2F0ZS1zZWxlY3RcIlxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e3ByZWRpY2F0ZT8ubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUJsYW5rXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLnR0Lm9uUHJlZGljYXRlQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz17cHJlZGljYXRlcy5tYXAoKHByZWRpY2F0ZSkgPT4gZGlnZyhwcmVkaWNhdGUsIFwibmFtZVwiKSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgICA8VmlldyBzdHlsZT17e21hcmdpblRvcDogMTB9fT5cbiAgICAgICAgICAgICAgICB7KChhdHRyaWJ1dGUgJiYgcHJlZGljYXRlKSB8fCBzY29wZSkgJiZcbiAgICAgICAgICAgICAgICAgIDxJbnB1dCBjbGFzc05hbWU9XCJ2YWx1ZS1pbnB1dFwiIGRlZmF1bHRWYWx1ZT17dmFsdWV9IGlucHV0UmVmPXt2YWx1ZUlucHV0UmVmfSAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgICAgPC9WaWV3PlxuICAgICAgICAgIDwvVmlldz5cbiAgICAgICAgICA8VmlldyBzdHlsZT17e2ZsZXhEaXJlY3Rpb246IFwicm93XCIsIGp1c3RpZnlDb250ZW50OiBcImVuZFwiLCBtYXJnaW5Ub3A6IDEwfX0+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRhbmdlclxuICAgICAgICAgICAgICBpY29uPVwicmVtb3ZlXCJcbiAgICAgICAgICAgICAgbGFiZWw9e3QoXCIuY2FuY2VsXCIsIHtkZWZhdWx0VmFsdWU6IFwiQ2FuY2VsXCJ9KX1cbiAgICAgICAgICAgICAgb25QcmVzcz17dGhpcy5wLm9uUmVxdWVzdENsb3NlfVxuICAgICAgICAgICAgICBwcmVzc2FibGVQcm9wcz17dGhpcy5jYWNoZShcImNhbmNlbEJ1dHRvblByZXNzYWJsZVByb3BzXCIsIHtcbiAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogNVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRpc2FibGVkPXshc3VibWl0RW5hYmxlZH1cbiAgICAgICAgICAgICAgaWNvbj1cImNoZWNrXCJcbiAgICAgICAgICAgICAgbGFiZWw9e3QoXCIuYXBwbHlcIiwge2RlZmF1bHRWYWx1ZTogXCJBcHBseVwifSl9XG4gICAgICAgICAgICAgIHByZXNzYWJsZVByb3BzPXt0aGlzLmNhY2hlKFwiYXBwbGVCdXR0b25QcmVzc2FibGVQcm9wc1wiLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IHttYXJnaW5MZWZ0OiA1fSxcbiAgICAgICAgICAgICAgICB0ZXN0SUQ6IFwiYXBwbHktZmlsdGVyLWJ1dHRvblwiXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICBzdWJtaXRcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9WaWV3PlxuICAgICAgICA8L0Zvcm0+XG4gICAgICAgIHt0aGlzLnMubG9hZGluZyA+IDAgJiZcbiAgICAgICAgICA8Vmlld1xuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgYWxpZ25JdGVtczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIlxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8QWN0aXZpdHlJbmRpY2F0b3Igc2l6ZT1cImxhcmdlXCIgLz5cbiAgICAgICAgICA8L1ZpZXc+XG4gICAgICAgIH1cbiAgICAgIDwvQ2FyZD5cbiAgICApXG4gIH1cblxuICBjdXJyZW50TW9kZWxDbGFzc0Zyb21QYXRoKHBhdGgpIHtcbiAgICBjb25zdCB7bW9kZWxDbGFzc30gPSB0aGlzLnBcbiAgICBsZXQgY3VycmVudE1vZGVsQ2xhc3MgPSBtb2RlbENsYXNzXG5cbiAgICBmb3IgKGNvbnN0IHBhdGhQYXJ0IG9mIHBhdGgpIHtcbiAgICAgIGNvbnN0IGNhbWVsaXplZFBhdGhQYXJ0ID0gaW5mbGVjdGlvbi5jYW1lbGl6ZShwYXRoUGFydCwgdHJ1ZSlcbiAgICAgIGNvbnN0IGFzc29jaWF0aW9uID0gY3VycmVudE1vZGVsQ2xhc3MucmFuc2Fja2FibGVBc3NvY2lhdGlvbnMoKS5maW5kKChyZWZsZWN0aW9uKSA9PiByZWZsZWN0aW9uLm5hbWUoKSA9PSBjYW1lbGl6ZWRQYXRoUGFydClcblxuICAgICAgaWYgKCFhc3NvY2lhdGlvbikge1xuICAgICAgICBjb25zdCByYW5zYWNrYWJsZUFzc29jaWF0aW9uTmFtZXMgPSBjdXJyZW50TW9kZWxDbGFzcy5yYW5zYWNrYWJsZUFzc29jaWF0aW9ucygpLm1hcCgocmVmbGVjdGlvbikgPT4gcmVmbGVjdGlvbi5uYW1lKCkpLmpvaW4oXCIsIFwiKVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBSYW5zYWNrYWJsZSBhc3NvY2lhdGlvbiBieSB0aGF0IG5hbWU6ICR7Y2FtZWxpemVkUGF0aFBhcnR9IGluICR7cmFuc2Fja2FibGVBc3NvY2lhdGlvbk5hbWVzfWApXG4gICAgICB9XG5cbiAgICAgIGN1cnJlbnRNb2RlbENsYXNzID0gYXNzb2NpYXRpb24ubW9kZWxDbGFzcygpXG4gICAgfVxuXG4gICAgcmV0dXJuIGN1cnJlbnRNb2RlbENsYXNzXG4gIH1cblxuICBjdXJyZW50UGF0aFBhcnRzKCkge1xuICAgIGNvbnN0IHttb2RlbENsYXNzfSA9IHRoaXMucFxuICAgIGNvbnN0IHtwYXRofSA9IHRoaXMuc1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgbGV0IGN1cnJlbnRNb2RlbENsYXNzID0gbW9kZWxDbGFzc1xuXG4gICAgcmVzdWx0LnB1c2goe1xuICAgICAgbW9kZWxDbGFzcyxcbiAgICAgIHRyYW5zbGF0aW9uOiBtb2RlbENsYXNzLm1vZGVsTmFtZSgpLmh1bWFuKHtjb3VudDogMn0pXG4gICAgfSlcblxuICAgIGZvciAoY29uc3QgcGF0aFBhcnQgb2YgcGF0aCkge1xuICAgICAgY29uc3QgY2FtZWxpemVkUGF0aFBhcnQgPSBpbmZsZWN0aW9uLmNhbWVsaXplKHBhdGhQYXJ0LCB0cnVlKVxuICAgICAgY29uc3QgcGF0aFBhcnRUcmFuc2xhdGlvbiA9IGN1cnJlbnRNb2RlbENsYXNzLmh1bWFuQXR0cmlidXRlTmFtZShjYW1lbGl6ZWRQYXRoUGFydClcblxuICAgICAgY3VycmVudE1vZGVsQ2xhc3MgPSBjdXJyZW50TW9kZWxDbGFzcy5yYW5zYWNrYWJsZUFzc29jaWF0aW9ucygpLmZpbmQoKHJlZmxlY3Rpb24pID0+IHJlZmxlY3Rpb24ubmFtZSgpID09IGNhbWVsaXplZFBhdGhQYXJ0KS5tb2RlbENsYXNzKClcblxuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBtb2RlbENsYXNzOiBjdXJyZW50TW9kZWxDbGFzcyxcbiAgICAgICAgdHJhbnNsYXRpb246IHBhdGhQYXJ0VHJhbnNsYXRpb25cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgb25BdHRyaWJ1dGVDbGlja2VkID0gKHthdHRyaWJ1dGV9KSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRyaWJ1dGUsXG4gICAgICBzY29wZTogdW5kZWZpbmVkXG4gICAgfSlcbiAgfVxuXG4gIG9uUHJlZGljYXRlQ2hhbmdlZCA9IChlKSA9PiB7XG4gICAgY29uc3QgY2hvc2VuUHJlZGljYXRlTmFtZSA9IGRpZ2coZSwgXCJ0YXJnZXRcIiwgXCJ2YWx1ZVwiKVxuICAgIGNvbnN0IHByZWRpY2F0ZSA9IHRoaXMucy5wcmVkaWNhdGVzLmZpbmQoKHByZWRpY2F0ZSkgPT4gcHJlZGljYXRlLm5hbWUgPT0gY2hvc2VuUHJlZGljYXRlTmFtZSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe3ByZWRpY2F0ZX0pXG4gIH1cblxuICBvblJlZmxlY3Rpb25DbGlja2VkID0gKHtyZWZsZWN0aW9ufSkgPT4ge1xuICAgIGNvbnN0IG5ld1BhdGggPSB0aGlzLnMucGF0aC5jb25jYXQoW3JlZmxlY3Rpb25dKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhc3NvY2lhdGlvbnM6IG51bGwsXG4gICAgICBhdHRyaWJ1dGU6IHVuZGVmaW5lZCxcbiAgICAgIGFjdHVhbEN1cnJlbnRNb2RlbENsYXNzOiB7bW9kZWxDbGFzczogZGlnZyhyZWZsZWN0aW9uLCBcInJlc291cmNlXCIpfSxcbiAgICAgIG1vZGVsQ2xhc3NOYW1lOiBkaWdnKHJlZmxlY3Rpb24sIFwibW9kZWxDbGFzc05hbWVcIiksXG4gICAgICBwYXRoOiBuZXdQYXRoLFxuICAgICAgcHJlZGljYXRlOiB1bmRlZmluZWRcbiAgICB9KVxuICB9XG5cbiAgb25TY29wZUNsaWNrZWQgPSAoe3Njb3BlfSkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0cmlidXRlOiB1bmRlZmluZWQsXG4gICAgICBwcmVkaWNhdGU6IHVuZGVmaW5lZCxcbiAgICAgIHNjb3BlXG4gICAgfSlcbiAgfVxuXG4gIG9uU3VibWl0ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtmaWx0ZXIsIHF1ZXJ5U2VhcmNoTmFtZX0gPSB0aGlzLnBcbiAgICBjb25zdCB7YXR0cmlidXRlLCBwYXRoLCBwcmVkaWNhdGUsIHNjb3BlfSA9IHRoaXMuc1xuICAgIGNvbnN0IHtmaWx0ZXJJbmRleH0gPSBkaWdzKGZpbHRlciwgXCJmaWx0ZXJJbmRleFwiKVxuICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IFBhcmFtcy5wYXJzZSgpW3F1ZXJ5U2VhcmNoTmFtZV0gfHwge31cbiAgICBjb25zdCB2YWx1ZSA9IGRpZ2codGhpcy50dC52YWx1ZUlucHV0UmVmLCBcImN1cnJlbnRcIiwgXCJ2YWx1ZVwiKVxuICAgIGNvbnN0IHAgPSBwYXRoLm1hcCgocmVmbGVjdGlvbikgPT4gaW5mbGVjdGlvbi51bmRlcnNjb3JlKHJlZmxlY3Rpb24ucmVmbGVjdGlvbk5hbWUpKVxuICAgIGNvbnN0IG5ld1NlYXJjaFBhcmFtcyA9IHtcbiAgICAgIHAsXG4gICAgICB2OiB2YWx1ZVxuICAgIH1cblxuICAgIGlmIChhdHRyaWJ1dGUpIHtcbiAgICAgIG5ld1NlYXJjaFBhcmFtcy5hID0gZGlnZyhhdHRyaWJ1dGUsIFwiYXR0cmlidXRlTmFtZVwiKVxuICAgICAgbmV3U2VhcmNoUGFyYW1zLnByZSA9IGRpZ2cocHJlZGljYXRlLCBcIm5hbWVcIilcbiAgICB9IGVsc2UgaWYgKHNjb3BlKSB7XG4gICAgICBuZXdTZWFyY2hQYXJhbXMuc2MgPSBzY29wZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEb250IGtub3cgaWYgc2hvdWxkIHNlYXJjaCBmb3IgYXR0cmlidXRlIG9yIHNjb3BlP1wiKVxuICAgIH1cblxuICAgIHNlYXJjaFBhcmFtc1tmaWx0ZXJJbmRleF0gPSBKU09OLnN0cmluZ2lmeShuZXdTZWFyY2hQYXJhbXMpXG5cbiAgICBjb25zdCBuZXdQYXJhbXMgPSB7fVxuXG4gICAgbmV3UGFyYW1zW3F1ZXJ5U2VhcmNoTmFtZV0gPSBzZWFyY2hQYXJhbXNcblxuICAgIFBhcmFtcy5jaGFuZ2VQYXJhbXMobmV3UGFyYW1zKVxuXG4gICAgdGhpcy5wcm9wcy5vbkFwcGx5Q2xpY2tlZCgpXG4gIH1cblxuICByZWZsZWN0aW9uc1dpdGhNb2RlbENsYXNzKHJlZmxlY3Rpb25zKSB7XG4gICAgcmV0dXJuIHJlZmxlY3Rpb25zLmZpbHRlcigocmVmbGVjdGlvbikgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVmbGVjdGlvbi5tb2RlbENsYXNzKClcblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHNvcnRlZEF0dHJpYnV0ZXNCeU5hbWUoYXR0cmlidXRlcykge1xuICAgIHJldHVybiBhdHRyaWJ1dGVzLnNvcnQoKGEsIGIpID0+XG4gICAgICBkaWdnKGEsIFwiaHVtYW5OYW1lXCIpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5sb2NhbGVDb21wYXJlKFxuICAgICAgICAgIGRpZ2coYiwgXCJodW1hbk5hbWVcIikudG9Mb3dlckNhc2UoKVxuICAgICAgICApXG4gICAgKVxuICB9XG5cbiAgc29ydGVkUmVmbGVjdGlvbnNCeU5hbWUocmVmbGVjdGlvbnMpIHtcbiAgICByZXR1cm4gcmVmbGVjdGlvbnMuc29ydCgoYSwgYikgPT5cbiAgICAgIGRpZ2coYSwgXCJodW1hbk5hbWVcIilcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLmxvY2FsZUNvbXBhcmUoXG4gICAgICAgICAgZGlnZyhiLCBcImh1bWFuTmFtZVwiKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIClcbiAgICApXG4gIH1cbn0pKVxuIl19