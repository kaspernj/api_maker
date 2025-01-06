import Devise from "@kaspernj/api-maker/build/devise"
import LoaderWithState from "./loader-with-state"

export default class LoaderThatSignsOutOnMount extends React.PureComponent {
  componentDidMount() {
    Devise.signOut()
  }

  render() {
    return (
      <LoaderWithState className="components-can-can-loader-that-signs-out-on-mount"  />
    )
  }
}
