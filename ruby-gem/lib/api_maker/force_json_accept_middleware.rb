# Middleware that pins requests to the API Maker engine to the JSON format.
#
# The engine only ever answers JSON, but a request reaching it with an HTML
# Accept is negotiated as HTML, and the auth stack then behaves like a browser
# request: Devise::FailureApp takes its navigational-format branch and answers a
# 302 to the sign-in page instead of 401, and host-app handlers that split on
# format (an UnauthorizedError handler with a format.html branch) redirect too.
# The client cannot parse that page, so one unauthorised command poisons the
# whole command batch with "Expected JSON response from /api_maker/commands but
# received string".
#
# Forcing Accept: application/json makes the request format :json, which is not
# a Devise navigational format, so auth failures can only surface as JSON
# errors. The client can handle a JSON error, it cannot handle an HTML page.
class ApiMaker::ForceJsonAcceptMiddleware
  ENGINE_PATH_PREFIX = "/api_maker".freeze
  JSON_ACCEPT = "application/json".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    env["HTTP_ACCEPT"] = JSON_ACCEPT if env["PATH_INFO"].to_s.start_with?(ENGINE_PATH_PREFIX)

    @app.call(env)
  end
end
