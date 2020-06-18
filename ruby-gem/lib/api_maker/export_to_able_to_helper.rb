module ApiMaker::ExpectToBeAbleToHelper
  def expect_to_be_able_to(ability, model, permissions)
    require "cancan/matchers"

    permissions.each do |permission|
      # Test access through 'can?'
      expect(ability).to be_able_to permission, model

      # Test access through 'accessible_by'
      if model.is_a?(ActiveRecord::Base) && model.persisted?
        readable_models = model.class.where(id: model).accessible_by(ability, permission)
        expect(readable_models).to eq [model]
      end
    end
  end

  def expect_not_to_be_able_to(ability, model, permissions)
    require "cancan/matchers"

    permissions.each do |permission|
      # Test access through 'can?'
      expect(ability).not_to be_able_to permission, model

      # Test access through 'accessible_by'
      if model.is_a?(ActiveRecord::Base) && model.persisted?
        readable_models = model.class.where(id: model).accessible_by(ability, permission)
        expect(readable_models).to be_empty
      end
    end
  end
end
