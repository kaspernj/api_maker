// @ts-check
import React from "react"
import useInput from "../use-input.js"

const inputWrapper = (WrapperComponentClass, wrapperOptions = {}) => {
  function WrappedInputWrapper(props) { // eslint-disable-line func-style
    const {fieldRegistration, form, inputProps, restProps, wrapperOpts} = useInput({props, wrapperOptions})

    return (
      <WrapperComponentClass
        fieldRegistration={fieldRegistration}
        form={form}
        inputProps={inputProps}
        wrapperOpts={wrapperOpts}
        {...restProps}
      />
    )
  }

  WrappedInputWrapper.displayName = `InputWrapper(${WrapperComponentClass.name || "Component"})`

  return WrappedInputWrapper
}

export default inputWrapper
