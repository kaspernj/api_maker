import {Devise} from "@kaspernj/api-maker"
import LoaderWithState from "./loader-with-state"

export default class LoaderThatSignsOutOnMount extends React.Component {
  componentDidMount() {
    Devise.signOut()
  }

  render() {
    return (
      <LoaderWithState className="components-can-can-loader-that-signs-out-on-mount"  />
    )
  }
}
