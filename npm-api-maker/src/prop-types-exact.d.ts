declare module "prop-types-exact" {
  import type {ValidationMap} from "prop-types"

  const forbidExtraProps: <T>(_propTypes: ValidationMap<T>) => ValidationMap<T>

  export default forbidExtraProps
}
