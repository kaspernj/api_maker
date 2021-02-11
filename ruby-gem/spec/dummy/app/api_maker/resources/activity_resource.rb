require "public_activity"

class Resources::ActivityResource < Resources::ApplicationResource
  self.model_class = ::PublicActivity::Activity

  attributes :id
end
