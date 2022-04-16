module AttributeRowHelpers
  def attribute_row_selector(attribute: nil, identifier: nil)
    raise "No attribute or identifier given" if !attribute && !identifier

    row_selector = ".component-api-maker-attribute-row"
    row_selector << "[data-attribute='#{attribute.camelize(:lower)}']" if attribute
    row_selector << "[data-identifier='#{identifier}']" if identifier
    row_selector
  end

  def wait_for_attribute_row(attribute: nil, identifier: nil, label: nil, value: nil, **opts)
    row_selector = attribute_row_selector(attribute: attribute, identifier: identifier)

    wait_for_selector "#{row_selector} > .attribute-row-label", exact_text: label, **opts if label
    wait_for_selector "#{row_selector} > .attribute-row-value", exact_text: value, **opts if value
  end
end
