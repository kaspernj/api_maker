module ApiMaker::SpecHelper::SuperAdminHelpers
  def super_admin_test_index_render(model)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name)
    wait_for_selector model_row_selector(model)
  end

  def super_admin_test_index_destroy(model)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name)
    wait_for_selector model_row_selector(model)
    wait_for_action_cable_to_connect

    destroy_action = proc do
      accept_confirm do
        wait_for_and_find("#{model_row_selector(model)} .destroy-button").click
      end

      wait_for_no_selector model_row_selector(model) # If the row disappears it got deleted
    end

    expect { destroy_action.call }
      .to change(model.class, :count).by(-1)

    expect { model.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  def super_admin_test_new(model_class, inputs:, expect: nil)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model_class)

    visit super_admin_path(model: resource.short_name)
    wait_for_and_find(".create-new-model-link").click
    wait_for_selector "[data-class='super-admin--edit-page']"
    super_admin_test_fill_inputs(resource, inputs)
    wait_for_and_find("[data-class='submit-button']").click
    wait_for_expect { expect(model_class.count).to eq 1 }

    created_model = model_class.last!

    expect_attributes = expect || inputs

    expect(created_model).to have_attributes(expect_attributes)
  end

  def super_admin_test_fill_inputs(resource, inputs)
    base_input_name = resource.underscore_name.singularize

    inputs.each do |input_name, value|
      if value.is_a?(Hash) && value[:haya_select]
        haya_select("#{base_input_name}_#{input_name}").select(value.fetch(:haya_select))
      else
        wait_for_and_find("input[data-id='#{resource.underscore_name.singularize}_#{input_name}']").set(value)
      end
    end
  end

  def super_admin_test_edit(model, inputs:, expect: nil)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name)
    wait_for_and_find(".edit-button").click
    wait_for_selector "[data-class='super-admin--edit-page']"
    super_admin_test_fill_inputs(resource, inputs)
    wait_for_and_find("[data-class='submit-button']").click

    expect_attributes = expect || inputs

    wait_for_expect do
      expect(model.reload).to have_attributes(expect_attributes)
    end
  end

  def super_admin_test_show_render(model, attributes:)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name, model_id: model.id)
    wait_for_selector "[data-component='super-admin--show-page']"

    attributes.each do |attribute_name, value|
      wait_for_attribute_row attribute: attribute_name.to_s, value:
    end
  end

  def super_admin_test_show_destroy(model)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name, model_id: model.id)
    wait_for_selector "[data-component='super-admin--show-page']"
    wait_for_selector ".destroy-model-link"
    wait_for_action_cable_to_connect

    destroy_action = proc do
      accept_confirm do
        wait_for_and_find(".destroy-model-link").click
      end

      wait_for_expect { expect { model.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    expect { destroy_action.call }.to change(model.class, :count).by(-1)

    # It redirects to the index page
    wait_for_selector "[data-component='super-admin--index-page']"
  end
end
