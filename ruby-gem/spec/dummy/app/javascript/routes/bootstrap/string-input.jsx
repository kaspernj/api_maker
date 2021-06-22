export default class BootstrapStringInput extends React.Component {
  render() {
    return (
      <Layout>
        <div className="routes-bootstrap-string-input">
          <Input
            append={<button className="append-button" />}
            appendText="Goodbye world"
            prepend={<button className="prepend-button" />}
            prependText="Hello world"
            wrapperClassName="input-with-both"
          />
          <Input appendText="Goodbye world" prependText="Hello world" wrapperClassName="input-with-text"  />
          <Input append={<button className="append-button" />} prepend={<button className="prepend-button" />} wrapperClassName="input-without-text"  />
        </div>
      </Layout>
    )
  }
}
