class ApiMaker::BaseResource
  def self.inherited(base)
    ApiMaker::MemoryStorage.current.add_resource(klass: base) unless ApiMaker::MemoryStorage.current.resources.include?(base)
  end

  def self.member_commands(list)
    list.each do |member_method|
      ApiMaker::MemoryStorage.current.add_member_method(
        klass: self,
        member_method: member_method
      )
    end
  end

  def self.model_class
    model_class_name = name.gsub(/Resource$/, "")
    model_class_name = model_class_name.gsub(/^Resources::/, "")
    model_class_name.constantize
  end
end
