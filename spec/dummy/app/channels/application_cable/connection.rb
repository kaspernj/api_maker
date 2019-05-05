class ApplicationCable::Connection < ActionCable::Connection::Base
  identified_by :current_user

  def connect
    self.current_user = find_verified_user
  end

private

  def find_verified_user
    verified_user = User.find_by(id: cookies.signed["user.id"])
    verified_user if verified_user && cookies.signed["user.expires_at"] > Time.zone.now
  end
end
