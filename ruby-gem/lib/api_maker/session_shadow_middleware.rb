class ApiMaker::SessionShadowMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new(env)

    ApiMaker::SessionShadowStore.load!(request:)

    status, headers, response = @app.call(env)

    ApiMaker::SessionShadowStore.persist!(request:)

    [status, headers, response]
  end
end
