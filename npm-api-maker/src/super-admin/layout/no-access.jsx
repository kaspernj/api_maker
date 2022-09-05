class ComponentsAdminLayoutNoAccess extends React.PureComponent {
  render() {
    const {currentUser} = digs(this.props, "currentUser")

    return (
      <div
        className="components--admin--layout-no-access"
        data-user-roles={currentUser?.userRoles()?.loaded()?.map((userRole) => userRole.role()?.identifier()).join(", ")}
      >
        {I18n.t("js.api_maker.super_admin.layout.no_access.you_dont_have_no_access_to_this_page")}
      </div>
    )
  }
}

export default withCurrentUser(ComponentsAdminLayoutNoAccess)
