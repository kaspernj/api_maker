import ConfigReader from "./config-reader.jsx"

const hasEditConfig = (modelClass) => {
  const configReader = ConfigReader.forModel(modelClass)
  const extraContent = configReader.modelConfig?.edit?.extraContentconst
  const attributes = configReader.modelConfig?.edit?.attributes

  if (attributes || extraContent) {
    return true
  }

  return false
}

export default hasEditConfig
