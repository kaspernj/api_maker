// @ts-check
import {Platform} from "react-native"
import apiMakerConfig from "../../config.js"
import openWebFileSink from "./file-sinks/web-file-sink.js"

/** @typedef {import("./file-sinks/web-file-sink.js").ExportFileSink} ExportFileSink */

/**
 * Opens a file sink for an export, abstracting over platforms. A host-configured opener (e.g. an
 * expo-file-system/expo-sharing implementation on React Native) takes precedence; otherwise the built-in web
 * sink is used. On native without a configured opener this throws with guidance.
 *
 * @param {object} args
 * @param {string} args.fileName
 * @param {string} args.mimeType
 * @param {string} args.format
 * @returns {Promise<ExportFileSink>}
 */
export default async function openExportFileSink(args) {
  const configuredOpener = apiMakerConfig.getExportFileSinkOpener()

  if (configuredOpener) return await configuredOpener(args)
  if (Platform.OS === "web") return await openWebFileSink(args)

  throw new Error(
    "No export file sink configured for this platform. On React Native/Expo, call " +
    "apiMakerConfig.setExportFileSinkOpener(...) (e.g. using expo-file-system + expo-sharing)."
  )
}
