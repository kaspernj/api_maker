import {Platform, useWindowDimensions} from "react-native"
import {useCallback, useMemo, useState} from "react"
import useEventListener from "./use-event-listener"

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

const useScreenLayout = () => {
  if (Platform.OS == "web") { // eslint-disable-line eqeqeq
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const shared = useMemo(() => ({}))

    shared.width = window.innerWidth

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [screenLayout, setScreenLayout] = useState(() => getWindowLayout(shared.width))

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onResize = useCallback(() => {
      const newWindowLayout = getWindowLayout(window.innerWidth)

      if (shared.screenlayout != newWindowLayout) {
        setScreenLayout(newWindowLayout)
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEventListener(window, "resize", onResize)

    shared.screenLayout = screenLayout

    return shared.screenLayout
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const windowDimensions = useWindowDimensions()

    return getWindowLayout(windowDimensions.width)
  }
}

export default useScreenLayout
