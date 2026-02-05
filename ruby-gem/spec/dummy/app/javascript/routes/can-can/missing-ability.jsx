import React, {memo, useEffect, useState} from "react"
import {Account} from "models.js"
import CanCan from "@kaspernj/api-maker/build/can-can.js"
import Layout from "components/layout"

export default memo(() => {
  const canCan = CanCan.current()
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!canCan) return

    let isActive = true
    const checkAbility = () => {
      if (!isActive) return

      const canAccess = canCan.can("index", Account)

      if (canAccess) setStatus("loaded")
    }

    checkAbility()
    const interval = setInterval(checkAbility, 10)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [canCan])

  return (
    <Layout>
      <div className="can-can-missing-ability" data-status={status}>
        {status}
      </div>
    </Layout>
  )
})
