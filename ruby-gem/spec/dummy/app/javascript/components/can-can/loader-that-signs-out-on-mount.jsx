import LoaderWithState from "./loader-with-state"
import {Devise} from "@kaspernj/api-maker"

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
