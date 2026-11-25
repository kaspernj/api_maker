require "rails_helper"

describe ApiMaker::ModelContentGeneratorService do
  let(:content_project) { service_project.execute! }
  let(:content_task) { service_task.execute! }
  let(:service_project) { ApiMaker::ModelContentGeneratorService.new(resource: Resources::ProjectResource) }
  let(:service_task) { ApiMaker::ModelContentGeneratorService.new(resource: Resources::TaskResource) }

  describe "#model_content" do
    it "includes attributes defined in the serializer" do
      expect(content_task.fetch(:attributes).keys).to include :created_at
    end

    it "doesnt include attributes not defined in the serializer" do
      expect(content_task.fetch(:attributes).keys).not_to include :updated_at
    end

    it "includes relationships defined in the serializer" do
      expect(content_project.fetch(:relationships).keys).to include :tasks
    end

    it "doesnt include relationships not defined in the serializer" do
      expect(content_project.fetch(:relationships).keys).not_to include :project_secrets
    end

    it "includes frontend command args for commands" do
      expect(content_task.fetch(:collection_commands).fetch(:test_collection)).to eq(
        {
          args: {
            "cacheResponse" => true
          },
          name: :test_collection
        }
      )
      expect(content_task.fetch(:member_commands).fetch(:test_member)).to eq(
        {
          args: {
            "cacheResponse" => true
          },
          name: :test_member
        }
      )
    end
  end

  describe "column defaults" do
    it "casts a boolean default to a boolean instead of the database literal" do
      column = content_task.fetch(:attributes).fetch(:finished).fetch(:column)

      expect(column.fetch(:default)).to be(false)
      expect(column.fetch(:type)).to eq(:boolean)
    end

    it "keeps a string default as a string" do
      column = content_task.fetch(:attributes).fetch(:state).fetch(:column)

      expect(column.fetch(:default)).to eq("open")
    end

    it "leaves a column without a default as nil" do
      column = content_task.fetch(:attributes).fetch(:priority).fetch(:column)

      expect(column.fetch(:default)).to be_nil
    end

    it "casts defaults for ransackable attributes as well" do
      content_user = ApiMaker::ModelContentGeneratorService.new(resource: Resources::UserResource).execute!

      expect(ransackable_column_for(content_user, "sign_in_count").fetch(:default)).to eq(0)
    end

    it "casts a float default to a float instead of the database literal" do
      column = ransackable_column_for(content_task, "weight")

      expect(column.fetch(:type)).to eq(:float)
      expect(column.fetch(:default)).to eq(0.0)
    end

    it "leaves a datetime default as the database literal instead of adding a timezone it does not have" do
      column = ransackable_column_for(content_task, "scheduled_at")

      expect(column.fetch(:type)).to eq(:datetime)
      expect(column.fetch(:default)).to be_a(String)
      expect(column.fetch(:default)).to eq("2000-01-01 12:34:56")
    end
  end

  def ransackable_column_for(content, attribute_name)
    ransackable_attributes = content.fetch(:model_class_data).fetch(:ransackable_attributes)
    attribute = ransackable_attributes.find { |item| item.fetch(:name).to_s == attribute_name }

    raise "Couldnt find ransackable attribute: #{attribute_name}" unless attribute

    attribute.fetch(:column)
  end
end
