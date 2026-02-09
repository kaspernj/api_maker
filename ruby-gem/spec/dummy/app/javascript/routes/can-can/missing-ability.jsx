import React, {memo, useEffect, useState} from "react"
import {Account} from "models.js"
import CanCan from "@kaspernj/api-maker/build/can-can.js"
import Layout from "components/layout"

function CanCanMissingAbility() {
  const canCan = CanCan.current()
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let isActive = true

    const checkAbility = () => {
      if (!isActive) return

      const canAccess = canCan.can("index", Account)

      if (canAccess === null || canAccess === undefined) {
        setStatus("loading")
      } else if (canAccess) {
        setStatus("loaded")
      } else {
        setStatus("missing ability")
      }
    }

    checkAbility()
    canCan.events.on("onAbilitiesLoaded", checkAbility)

    return () => {
      isActive = false
      canCan.events.off("onAbilitiesLoaded", checkAbility)
    }
  }, [canCan])

  return (
    <Layout>
      <div className="can-can-missing-ability" data-status={status}>
        {status}
      </div>
    </Layout>
  )
}

export default memo(CanCanMissingAbility)
