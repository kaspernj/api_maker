import {Form, FormInputs} from "@kaspernj/api-maker/src/form.jsx"
import Layout from "components/layout"
import React, {useCallback, useRef, useState} from "react"
import Text from "@kaspernj/api-maker/build/utils/text"
import {TextInput, View} from "react-native"
import memo from "set-state-compare/build/memo.js"

const htmlFormProps = {
  className: "utils-form-html-class",
  "data-html-prop": "true",
  "data-testid": "utils-form-web-form",
  id: "utils-form-html-props"
}

/** Utils form route. */
function RoutesUtilsForm() {
  const formRef = useRef()

  if (!formRef.current) {
    formRef.current = new FormInputs()
  }

  const form = formRef.current
  const [submittedValue, setSubmittedValue] = useState("")

  /** @param {string} value */
  const onChangeText = useCallback((value) => {
    form.setValue("name", value)
  }, [form])

  /** @returns {void} */
  const onSubmit = useCallback(() => {
    const value = form.getValue("name")
    setSubmittedValue(value || "")
  }, [form])

  return (
    <Layout>
      <View testID="utils-form-route">
        <Form
          className="utils-form-should-not-forward"
          form={form}
          htmlFormProps={htmlFormProps}
          onSubmit={onSubmit}
        >
          <TextInput testID="utils-form-input" onChangeText={onChangeText} />
          <input data-testid="utils-form-submit" type="submit" value="Submit" />
        </Form>
        <Text testID="utils-form-submitted-value">
          {submittedValue}
        </Text>
      </View>
    </Layout>
  )
}

export default memo(RoutesUtilsForm)
