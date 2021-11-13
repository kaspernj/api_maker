require "awesome_translations"

class ApplicationRecord < ActiveRecord::Base
  include ApiMaker::ModelExtensions
  include AwesomeTranslations::TranslateFunctionality

  self.abstract_class = true
end
