class ApplicationRecord < ActiveRecord::Base
  include ApiMaker::ModelExtensions

  self.abstract_class = true
end
