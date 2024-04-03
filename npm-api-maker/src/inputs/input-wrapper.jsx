import useInput from "../use-input.mjs"

const inputWrapper = (WrapperComponentClass, wrapperOptions = {}) => (props) => {
  const {inputProps, restProps, wrapperOpts} = useInput({props, wrapperOptions})

  return (
    <WrapperComponentClass
      inputProps={inputProps}
      wrapperOpts={wrapperOpts}
      {...restProps}
    />
  )
}

export default inputWrapper
