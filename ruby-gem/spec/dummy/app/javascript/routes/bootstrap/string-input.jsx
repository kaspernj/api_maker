export default class BootstrapStringInputDateObject extends React.Component {
  render() {
    return (
      <Layout>
        <div className="routes-bootstrap-string-input">
          <Input
            append={<button className="append-button" />}
            appendText="Goodbye world"
            className="input-with-both"
            prepend={<button className="prepend-button" />}
            prependText="Hello world"
          />
          <Input appendText="Goodbye world" className="input-with-text" prependText="Hello world" />
          <Input append={<button className="append-button" />} className="input-without-text" prepend={<button className="prepend-button" />} />
        </div>
      </Layout>
    )
  }
}
