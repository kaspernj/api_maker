if Rails.env.test?
  Dummy::Application.config.session_store :cookie_store,
    key: "_my_session",
    expire_after: 7.seconds
else
  Dummy::Application.config.session_store :cookie_store,
    key: "_my_session",
    expire_after: 15.minutes
end