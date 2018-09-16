class ApiMaker::BaseResource
  def self.register_resource
    puts "Extended: #{self.name}"
    ApiMaker::MemoryStorage.current.add_resource(klass: self) unless ApiMaker::MemoryStorage.current.resources.include?(self)
  end

  def self.member_commands(list)
    register_resource

    puts "List: #{list}"

    list.each do |member_method|
      ApiMaker::MemoryStorage.current.add_member_method(
        klass: self,
        member_method: member_method
      )
    end
  end

  def self.model_class
    model_class_name = self.name.gsub(/Resource$/, "")
    model_class_name.constantize
  end
end
