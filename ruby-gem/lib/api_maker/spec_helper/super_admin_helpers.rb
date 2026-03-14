module ApiMaker::SpecHelper::SuperAdminHelpers # rubocop:disable Metrics/ModuleLength
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
        wait_for_and_find(model_row_destroy_button_selector(model)).click
      end

      wait_for_no_selector model_row_selector(model) # If the row disappears it got deleted
    end

    expect { destroy_action.call }
      .to change(model.class, :count).by(-1)

    expect { model.reload }.to raise_error(ActiveRecord::RecordNotFound)
  end

  def super_admin_test_new(model_class, inputs:, expect: nil)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model_class)

    submit_super_admin_new_form(
      model_class:,
      resource:,
      inputs:
    )
    created_model = resolve_created_super_admin_model(
      model_class:
    )

    expect_attributes = expect || inputs

    expect(created_model).to have_attributes(expect_attributes)
  end

private

  def submit_super_admin_new_form(model_class:, resource:, inputs:)
    visit super_admin_path(model: resource.short_name)
    wait_for_and_find("[data-class='create-new-model-link']").click
    wait_for_selector "[data-testid='super-admin--edit-page']"
    super_admin_test_fill_inputs(resource, inputs)
    expected_count = model_class.count + 1
    wait_for_and_find("[data-testid='submit-button']").click
    wait_for_expect { expect(model_class.count).to eq expected_count }
  end

  def resolve_created_super_admin_model(model_class:)
    url_with_model_id = nil

    wait_for_expect do
      maybe_url = current_url
      maybe_query = URI.parse(maybe_url).query.to_s
      maybe_model_id = CGI.parse(maybe_query)["model_id"]&.first

      expect(maybe_model_id).to be_present
      url_with_model_id = maybe_url
    end

    uri = URI.parse(url_with_model_id)
    params = CGI.parse(uri.query.to_s)
    model_id = params["model_id"]&.first

    if model_id.blank?
      message = [
        "Expected redirect URL to include query param model_id after creating #{model_class.name},",
        "but got params=#{params.inspect}. current_url=#{current_url}"
      ].join(" ")
      raise KeyError, message
    end

    model_class.find(model_id)
  end

  def super_admin_test_fill_inputs(resource, inputs)
    base_input_name = resource.underscore_name.singularize

    inputs.each do |input_name, value|
      if value.is_a?(Hash) && value[:haya_select]
        select_haya_select_option(
          select_id: "#{base_input_name}_#{input_name}",
          label: value.fetch(:haya_select)
        )
      else
        id = "#{resource.underscore_name.singularize}_#{input_name}"
        input_test_id = "api-maker/super-admin/edit-page/input-#{id}"
        checkbox_selector = "[data-component='api-maker/utils/checkbox'] [data-id='#{id}'] input[type='checkbox']"
        component = find_super_admin_input(id:, input_test_id:, checkbox_selector:)

        if component.tag_name == "input" && component[:type] == "checkbox"
          component.set(value)
        else
          set_text_input(component, value)
        end
      end
    end
  end

  def super_admin_test_edit(model, inputs:, expect: nil)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name)
    wait_for_and_find(model_row_edit_button_selector(model)).click
    wait_for_selector "[data-testid='super-admin--edit-page']"
    super_admin_test_fill_inputs(resource, inputs)
    wait_for_and_find("[data-testid='submit-button']").click

    expect_attributes = expect || inputs

    wait_for_expect do
      expect(model.reload).to have_attributes(expect_attributes)
    end
  end

  def super_admin_test_show_render(model, attributes:)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name, model_id: model.id)
    wait_for_selector "[data-testid='super-admin/show-page']"

    attributes.each do |attribute_name, value|
      wait_for_attribute_row attribute: attribute_name.to_s, value:
    end
  end

  def super_admin_test_show_destroy(model)
    resource = ApiMaker::MemoryStorage.current.resource_for_model(model.class)

    visit super_admin_path(model: resource.short_name, model_id: model.id)
    wait_for_selector "[data-testid='super-admin/show-page']"
    wait_for_selector "[data-class='destroy-model-link']"
    wait_for_action_cable_to_connect

    destroy_action = proc do
      accept_confirm do
        wait_for_and_find("[data-class='destroy-model-link']").click
      end

      wait_for_expect { expect { model.reload }.to raise_error(ActiveRecord::RecordNotFound) }
    end

    expect { destroy_action.call }.to change(model.class, :count).by(-1)

    # It redirects to the index page
    wait_for_selector "[data-testid='super-admin/index-page']"
  end

  def select_haya_select_option(select_id:, label:)
    attempts = 0

    begin
      haya_select(select_id).select(
        label,
        allow_if_selected: true
      )
    rescue ::ApiMaker::SpecHelper::SelectorNotFoundError, WaitUtil::TimeoutError
      attempts += 1
      raise if attempts > 1

      retry
    end
  end

  def find_super_admin_input(id:, input_test_id:, checkbox_selector:)
    test_id_selector = "[data-testid='#{input_test_id}']"
    test_id_component = all(test_id_selector, visible: true, wait: 0).first

    return test_id_component if test_id_component
    checkbox_component = all(checkbox_selector, visible: true, wait: 0).first

    return checkbox_component if checkbox_component

    text_input_selector = "input[data-id='#{id}'], textarea[data-id='#{id}']"
    wait_for_and_find(text_input_selector)
  end
end
