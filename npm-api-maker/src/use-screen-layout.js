// @ts-check
import {Platform, useWindowDimensions} from "react-native"
import {useCallback, useMemo, useState} from "react"
import useEventListener from "ya-use-event-listener"

/** @typedef {"xs" | "sm" | "md" | "lg" | "xl" | "xxl"} ScreenLayout */
/** @typedef {{screenLayout?: ScreenLayout, width?: number}} SharedScreenLayout */

/**
 * @param {number} width
 * @returns {ScreenLayout | undefined}
 */
const getWindowLayout = (width) => {
  if (width <= 575) {
    return "xs"
  } else if (width <= 767) {
    return "sm"
  } else if (width <= 991) {
    return "md"
  } else if (width <= 1199) {
    return "lg"
  } else if (width <= 1399) {
    return "xl"
  } else if (width >= 1400) {
    return "xxl"
  } else {
    console.error(`Couldn't determine window layout from width: ${width}`)
  }
}

/** @returns {ScreenLayout | undefined} */
const useScreenLayout = () => {
  if (Platform.OS == "web") {
    const shared = useMemo(() => /** @type {SharedScreenLayout} */ ({}), [])

    shared.width = window.innerWidth

    const [screenLayout, setScreenLayout] = useState(() => getWindowLayout(shared.width))

    const onResize = useCallback(() => {
      const newWindowLayout = getWindowLayout(window.innerWidth)

      if (shared.screenLayout != newWindowLayout) {
        setScreenLayout(newWindowLayout)
      }
    }, [])

    useEventListener(window, "resize", onResize)

    shared.screenLayout = screenLayout

    return shared.screenLayout
  } else {
    const windowDimensions = useWindowDimensions()

    return getWindowLayout(windowDimensions.width)
  }
}

export default useScreenLayout
