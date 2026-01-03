import React from "react"
import useInput from "../use-input.js"

const inputWrapper = (WrapperComponentClass, wrapperOptions = {}) => {
  function WrappedInputWrapper(props) { // eslint-disable-line func-style
    const {inputProps, restProps, wrapperOpts} = useInput({props, wrapperOptions})

    return (
      <WrapperComponentClass
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
