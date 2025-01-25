import {Account} from "models"
import {digg} from "diggerize"
import Hash from "shared/hash"
import Layout from "components/layout"
import React from "react"
import setStateAsync from "shared/set-state-async"

export default class ModelsUpdateWithSelect extends React.PureComponent {
  state = {
    accountId: digg(this, "props", "match", "params", "id"),
    loaded: false,
    updated: false
  }

  componentDidMount() {
    this.loadAccount().then(() => this.updateAccount())
  }

  async loadAccount() {
    const accountId = Hash.fetch("accountId", this.state)
    const account = await Account
      .ransack({id_eq: accountId})
      .select({Account: ["id", "name", "usersCount"]})
      .first()

    await setStateAsync(this, {account, loaded: true})
  }

  async updateAccount() {
    await this.state.account.update({name: "New name"})
    await setStateAsync(this, {updated: true})
  }

  render() {
    const {account} = this.state

    return (
      <Layout>
        {account && this.content()}
      </Layout>
    )
  }

  content() {
    const {account} = this.state

    return (
      <div className="content-container" data-name={account.name()} data-users-count={account.usersCount()}>
        Users count: {account.usersCount()}
      </div>
    )
  }
}
