Fixed current-workplace websocket commands so guest or userless request contexts no longer crash when `current_user` is absent.

Added focused spec coverage for both the helper and the `Workplaces::Current` command so nil-user contexts return empty results and `links_count: 0` instead of raising `NoMethodError`.
