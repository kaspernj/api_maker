class ApiMaker::TranslatedAttributeNames < ApiMaker::ApplicationService
  arguments :attribute_names

  def perform
    list = []
    attribute_names.each do |attribute_name|
      list << attribute_name

      I18n.available_locales.each do |locale|
        list << :"#{attribute_name}_#{locale}"
      end
    end

    succeed!(list)
  end
end
