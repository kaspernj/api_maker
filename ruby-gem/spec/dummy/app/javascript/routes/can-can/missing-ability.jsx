import React, {memo, useEffect, useState} from "react"
import {Account} from "models.js"
import Layout from "components/layout"
import useCanCan from "@kaspernj/api-maker/build/use-can-can.js"

export default memo(() => {
  const canCan = useCanCan(() => [])
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!canCan) return

    let isActive = true
    const checkAbility = () => {
      if (!isActive) return
      canCan.can("index", Account)

      if (canCan.isAbilityLoaded?.("index", Account)) setStatus("loaded")
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
