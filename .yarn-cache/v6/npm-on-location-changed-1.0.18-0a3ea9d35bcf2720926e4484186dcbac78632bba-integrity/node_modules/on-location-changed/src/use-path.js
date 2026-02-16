import {useContext} from "react"
import {LocationContext} from "./location-context"

const usePath = () => useContext(LocationContext)

export default usePath
