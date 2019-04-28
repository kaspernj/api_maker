require "public_activity"

class Resources::ActivityResource < Resources::ApplicationResource
  attributes :id
  self.model_class = ::PublicActivity::Activity
end
