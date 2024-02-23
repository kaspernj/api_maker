import {memo} from "react"
import useCanCan from "@kaspernj/api-maker/src/use-can-can"

const CanCanWithShape = () => {
  const canCan = useCanCan(() => [[Account, ["sum"]]])

  return (
    <div className="components-can-can-loader-with-shape">
      {canCan?.can("sum", Account) &&
        <div className="can-access-admin">
          can access admin
        </div>
      }
      {canCan && !canCan.can("sum", Account) &&
        <div className="cannot-access-admin">
          can not access admin
        </div>
      }
    </div>
  )
}

export default memo(CanCanWithShape)
