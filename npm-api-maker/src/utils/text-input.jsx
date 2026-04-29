// @ts-check
import React from "react"
import {TextInput as RnTextInput} from "react-native"
import withDefaultStyleSlot from "./with-default-style-slot"

/**
 * @typedef {import("react-native").TextInputProps & {
 *   style?: import("react-native").StyleProp<import("react-native").TextStyle>
 * }} TextInputProps
 */

/**
 * RN TextInput wired into the api-maker default-style context under the
 * `"TextInput"` slot. RN's `TextInput` does not subscribe to the api-maker
 * `Text` slot, so apps that want consistent text colour and font sizing for
 * inputs need this wrapper alongside `<Text>`.
 *
 * Wrap the consumer tree once and inputs pick up the defaults:
 *
 * ```jsx
 * <WithDefaultStyle style={{TextInput: {color: colors.text, fontSize: 14}}}>
 *   <TextInput value={value} onChangeText={onChange} />
 * </WithDefaultStyle>
 * ```
 */
const ApiMakerUtilsTextInput = /** @type {React.MemoExoticComponent<React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<RnTextInput>>>} */ (
  withDefaultStyleSlot(
    /** @type {React.ComponentType<TextInputProps>} */ (RnTextInput),
    "TextInput"
  )
)

export default ApiMakerUtilsTextInput
