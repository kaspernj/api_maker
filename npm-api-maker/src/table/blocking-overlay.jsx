// @ts-check
/* eslint-disable sort-imports */
import React, {useRef} from "react"
import memo from "set-state-compare/build/memo.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {ActivityIndicator, Animated} from "react-native"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import useEventEmitter from "ya-use-event-emitter"

const FADE_DURATION = 150

/**
 * @typedef {object} Props
 * @property {import("events").EventEmitter} events
 */
/**
 * @typedef {object} State
 * @property {boolean} blocking
 */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerTableBlockingOverlay extends ShapeComponent {
  static propTypes = propTypesExact({
    events: PropTypes.object.isRequired
  })

  state = {blocking: false}

  setup() {
    this.opacity = useRef(new Animated.Value(0)).current

    useEventEmitter(this.p.events, "blocking", this.tt.onBlocking)
  }

  render() {
    // Always mounted — pointerEvents toggles click-capture, opacity drives
    // the fade. Kept out of conditional render so the Animated.Value and
    // emitter subscription don't churn on every block/unblock.
    const dataSet = {
      class: "api-maker--table--blocking-overlay",
      overlayState: this.s.blocking ? "blocking" : "idle"
    }

    return (
      <Animated.View
        dataSet={dataSet}
        pointerEvents={this.s.blocking ? "auto" : "none"}
        style={this.cache("overlayStyle", {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(64, 64, 64, 0.5)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          opacity: this.opacity
        })}
        testID="api-maker/table/blocking-overlay"
      >
        <ActivityIndicator color="#fff" size="large" />
      </Animated.View>
    )
  }

  onBlocking = (blocking) => {
    this.s.blocking = blocking
    Animated.timing(this.opacity, {
      duration: FADE_DURATION,
      toValue: blocking ? 1 : 0,
      useNativeDriver: false
    }).start()
  }
}))
