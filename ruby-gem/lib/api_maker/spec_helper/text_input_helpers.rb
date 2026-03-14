module ApiMaker::SpecHelper::TextInputHelpers
  def set_text_input(component, value)
    if browser_firefox?
      component.click
      component.native.clear
      component.send_keys(value.to_s)
    else
      component.set(value)
    end
  end
end
