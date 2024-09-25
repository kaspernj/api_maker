export default function modelCallbackArgs(table, model) {
  const modelArgName = inflection.camelize(table.props.modelClass.modelClassData().name, true)
  const modelCallbackArgs = {model}

  modelCallbackArgs[modelArgName] = model

  return modelCallbackArgs
}
