module AttributeRowHelpers
  def attribute_row_selector(attribute: nil, identifier: nil)
    raise "No attribute or identifier given" if !attribute && !identifier

    row_selector = "[data-component='api-maker/attribute-row']"
    row_selector << "[data-attribute='#{attribute.camelize(:lower)}']" if attribute
    row_selector << "[data-identifier='#{identifier}']" if identifier
    row_selector
  end

  def wait_for_attribute_row(attribute: nil, identifier: nil, label: nil, value: nil, **)
    row_selector = attribute_row_selector(attribute:, identifier:)

    wait_for_selector("#{row_selector} > [data-class='attribute-row-label']", exact_text: label, **) if label
    wait_for_selector("#{row_selector} > [data-class='attribute-row-value']", exact_text: value, **) if value
  end
end
