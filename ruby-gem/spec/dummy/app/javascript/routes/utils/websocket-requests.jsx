import ApiMakerConfig from "@kaspernj/api-maker/build/config.js"
import Devise from "@kaspernj/api-maker/build/devise.js"
import React, {useEffect, useState} from "react"
import Services from "@kaspernj/api-maker/build/services.js"
import SessionStatusUpdater from "@kaspernj/api-maker/build/session-status-updater.js"
import {Pressable, Text, View} from "react-native"
import {User} from "models.js"

ApiMakerConfig.setWebsocketRequests(true)

if (typeof window != "undefined" && !ApiMakerConfig.getCableUrl()) {
  const protocol = window.location.protocol == "https:" ? "wss" : "ws"

  ApiMakerConfig.setCableUrl(`${protocol}://${window.location.host}/cable`)
}

/** Websocket request test route. */
export default function RoutesUtilsWebsocketRequests() {
  const [configReady, setConfigReady] = useState("false")
  const [commandCount, setCommandCount] = useState("")
  const [commandLog, setCommandLog] = useState("")
  const [commandProgress, setCommandProgress] = useState("")
  const [commandReceived, setCommandReceived] = useState("false")
  const [commandResult, setCommandResult] = useState("")
  const [commandTotal, setCommandTotal] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [sessionStatusCalls, setSessionStatusCalls] = useState("0")
  const [signInPreloadCount, setSignInPreloadCount] = useState("")
  const [signedInState, setSignedInState] = useState("false")

  useEffect(() => {
    const sessionStatusUpdater = SessionStatusUpdater.current()
    const originalSessionStatus = sessionStatusUpdater.sessionStatus.bind(sessionStatusUpdater)

    sessionStatusUpdater.sessionStatus = async() => {
      setSessionStatusCalls((currentSessionStatusCalls) => `${parseInt(currentSessionStatusCalls, 10) + 1}`)

      return await originalSessionStatus()
    }

    setConfigReady("true")

    return () => {
      sessionStatusUpdater.sessionStatus = originalSessionStatus
    }
  }, [])

  /** @returns {Promise<void>} */
  async function onRunCommand() {
    const command = Services.current().sendRequest("CommandProgressTest", {}, {instant: true})

    command.onReceived(() => setCommandReceived("true"))
    command.onProgress(({count, progress, total}) => {
      setCommandCount(String(count || ""))
      setCommandProgress(String(progress || ""))
      setCommandTotal(String(total || ""))
    })
    command.onLog((message) => setCommandLog(message))

    const response = await command
    const progressData = await command.progress()
    const logsData = command.logs()

    setCommandCount(String(progressData?.count || ""))
    setCommandProgress(String(progressData?.progress || ""))
    setCommandTotal(String(progressData?.total || ""))
    setCommandLog(logsData.join("\n"))
    setCommandResult(String(response.current_command_present))
  }

  /** @returns {Promise<void>} */
  async function onSignIn() {
    const response = await Devise.signIn("admin@example.com", "password", {loadQuery: User.ransack().preload("user_roles")})
    const currentUser = Devise.currentUser()
    const preloadedUserRoles = response.response.model[0].preloadedRelationships.user_roles

    setCurrentUserId(currentUser ? currentUser.id() : "")
    setSignedInState(String(Devise.isUserSignedIn()))
    setSignInPreloadCount(String(preloadedUserRoles.length))
  }

  /** @returns {Promise<void>} */
  async function onSignOut() {
    await Devise.signOut()

    setCurrentUserId("")
    setSignedInState(String(Devise.isUserSignedIn()))
  }

  return (
    <View testID="websocket-requests-root">
      <Pressable testID="websocket-run-command-button" onPress={onRunCommand}>
        <Text>Run websocket command</Text>
      </Pressable>
      <View testID="websocket-config-ready">
        <Text>{configReady}</Text>
      </View>
      <View testID="websocket-command-received">
        <Text>{commandReceived}</Text>
      </View>
      <View testID="websocket-command-progress">
        <Text>{commandProgress}</Text>
      </View>
      <View testID="websocket-command-count">
        <Text>{commandCount}</Text>
      </View>
      <View testID="websocket-command-total">
        <Text>{commandTotal}</Text>
      </View>
      <View testID="websocket-command-log">
        <Text>{commandLog}</Text>
      </View>
      <View testID="websocket-command-result">
        <Text>{commandResult}</Text>
      </View>

      <Pressable testID="websocket-sign-in-button" onPress={onSignIn}>
        <Text>Sign in over websocket</Text>
      </Pressable>
      <Pressable testID="websocket-sign-out-button" onPress={onSignOut}>
        <Text>Sign out over websocket</Text>
      </Pressable>
      <View testID="websocket-current-user-id">
        <Text>{currentUserId}</Text>
      </View>
      <View testID="websocket-sign-in-preload-count">
        <Text>{signInPreloadCount}</Text>
      </View>
      <View testID="websocket-signed-in-state">
        <Text>{signedInState}</Text>
      </View>
      <View testID="websocket-session-status-calls">
        <Text>{sessionStatusCalls}</Text>
      </View>
    </View>
  )
}
