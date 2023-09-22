module AllRansackable
  def self.included(base)
    base.extend ClassMethods
  end

  module ClassMethods
    # Old version of method from Ransack 3
    def ransackable_attributes(_auth_object = nil)
      @ransackable_attributes ||= if Ransack::SUPPORTS_ATTRIBUTE_ALIAS
        column_names + _ransackers.keys + _ransack_aliases.keys +
          attribute_aliases.keys
      else
        column_names + _ransackers.keys + _ransack_aliases.keys
      end
    end

    # Old version of method from Ransack 3
    def ransackable_associations(_auth_object = nil)
      @ransackable_associations ||= reflect_on_all_associations.map { |a| a.name.to_s }
    end
  end
end
