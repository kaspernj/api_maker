import React, {memo, useEffect} from "react"
import {shapeComponent, ShapeComponent} from "set-state-compare/build/shape-component.js"
import {Account} from "models.js"
import CanCan from "@kaspernj/api-maker/build/can-can.js"
import classNames from "classnames"
import Devise from "@kaspernj/api-maker/build/devise.js"
import {FlashNotifications} from "flash-notifications"
import {Pressable} from "react-native"
import PropTypes from "prop-types"
import Text from "@kaspernj/api-maker/build/utils/text"
import useCanCan from "@kaspernj/api-maker/build/use-can-can.js"
import useCurrentUser from "@kaspernj/api-maker/build/use-current-user.js"

export default memo(shapeComponent(class CanCanWithState extends ShapeComponent {
  static propTypes = {
    className: PropTypes.string
  }

  render() {
    const {className, ...restProps} = this.props
    const canCan = useCanCan(() => [[Account, ["sum"]]])
    const currentUser = useCurrentUser()
    const cacheKey = canCan.getCacheKey()
    const canAccessAdmin = canCan.can("sum", Account)
    const currentUserIdentifier = currentUser?.email() || "none"
    const debugSummary = [
      `canCan=${String(Boolean(canCan))}`,
      `cacheKey=${cacheKey}`,
      `currentUser=${currentUserIdentifier}`,
      `canAccessAdmin=${String(canAccessAdmin)}`
    ].join("; ")

    useEffect(() => {
      console.log(`[can-can-loader-debug] ${debugSummary}`)
    }, [debugSummary])

    return (
      <div className={classNames("components-can-can-loader-with-state", className)} {...restProps}>
        {!currentUser &&
          <Pressable testID="sign-in-as-admin" data-testid="sign-in-as-admin" onPress={this.tt.onSignInAsAdminPress}>
            <Text>Sign in as admin</Text>
          </Pressable>
        }
        <Text dataSet={{class: "can-can-cache-key"}}>
          {cacheKey}
        </Text>
        <Text dataSet={{class: "can-can-debug-summary"}}>
          {debugSummary}
        </Text>
        {canAccessAdmin &&
          <div className="can-access-admin">
            can access admin
          </div>
        }
        {!canAccessAdmin &&
          <div className="cannot-access-admin">
            can not access admin
          </div>
        }
      </div>
    )
  }

  onSignInAsAdminPress = async () => {
    try {
      await Devise.signIn("admin@example.com", "password", {rememberMe: true})
      await CanCan.current().resetAbilities()
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
