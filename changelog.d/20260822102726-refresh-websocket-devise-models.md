Fixed ActionCable requests using stale Devise model state after permissions changed during an existing websocket connection.
Devise models are refreshed inside configured request contexts, and missing authenticated records now clear their websocket scopes.
