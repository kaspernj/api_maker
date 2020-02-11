export default class BootstrapStringInputDateObject extends React.Component {
  render() {
    return (
      <Layout>
        <div className="content-container">
          <form onSubmit={(e) => this.onSubmit(e)}>
            <StringInput defaultValue={new Date(2020, 1, )} id="date_object" label="Birthday" type="date" />
          </form>
        </div>
      </Layout>
    )
  }
}
