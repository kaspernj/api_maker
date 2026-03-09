require "rails_helper"
require "tmpdir"

describe ApiMaker::GenerateFrontendModels do
  describe "#perform" do
    it "generates one model file per resource with typed methods" do
      Dir.mktmpdir do |tmp_dir|
        ApiMaker::GenerateFrontendModels.execute!(path: tmp_dir)

        task_model_path = File.join(tmp_dir, "task.js")
        task_content = File.read(task_model_path)
        models_index_path = File.join(tmp_dir, "../models.js")
        models_index_content = File.read(models_index_path)

        expect(File).to exist(task_model_path)
        expect(File).not_to exist(File.join(tmp_dir, "api-maker-base-model-types.d.ts"))
        expect(File).to exist(models_index_path)
        expect(task_content).to start_with("// @ts-check\n")
        expect(task_content).to include("import BaseModel from \"@kaspernj/api-maker/build/base-model.js\"")
        expect(task_content).to include("import Account from \"./account.js\"")
        expect(task_content).to include("import Project from \"./project.js\"")
        expect(task_content).to include("class Task extends BaseModel")
        expect(task_content).to include("static modelClassData()")
        expect(task_content).to include("@returns {import(\"@kaspernj/api-maker/build/base-model.js\").ModelClassDataType}")
        expect(task_content).to include("return modelClassData")
        expect(task_content).not_to include("@type {unknown} */ (modelClassData)")
        expect(task_content).not_to include("static ransack(query = {})")
        expect(task_content).not_to include("static select(select)")
        expect(task_content).not_to include("static find(id)")
        expect(task_content).not_to include("static all()")
        expect(task_content).to include("export default Task")
        expect(task_content).not_to include("static modelName()")
        expect(task_content).not_to include("static humanAttributeName(attributeName)")
        expect(task_content).to include("/** @returns {number} */\n  id()")
        expect(task_content).to include("/** @returns {number | null} */\n  priority()")
        expect(task_content).to include("/** @returns {string} */\n  name()")
        expect(task_content).to include("/** @returns {any} */\n  translatedState()")
        expect(task_content).to include("/** @returns {any} */\n  customId()")
        expect(task_content).to include("@template TCommandResponse")
        expect(task_content).to include("@returns {Promise<TCommandResponse>}")
        expect(task_content).not_to include("@returns {Promise<any>}")
        expect(task_content).to include("BaseModel._callCollectionCommand(")
        expect(task_content).to include("static testCollection(args, commandArgs = {})")
        expect(task_content).to include("testMember(args, commandArgs = {})")
        expect(task_content).to include("project()")
        expect(task_content).to include("_readBelongsToReflection({modelClass: Project, reflectionName: \"project\"})")
        expect(task_content).to include("loadProject()")
        expect(task_content).to include("modelClass: Project")
        expect(task_content).to include("comments()")
        expect(task_content).to include("loadComments()")
        expect(task_content).to include("/** @returns {Promise<import(\"./user.js\").default | null>} */")
        expect(task_content).to include("ransack[\"resource_type_eq\"] = \"Task\"")
        expect(models_index_content).to include("import Task from \"models/task.js\"")
        expect(models_index_content).to include("export {")
      end
    end

    it "uses dasherized model file names" do
      Dir.mktmpdir do |tmp_dir|
        ApiMaker::GenerateFrontendModels.execute!(path: tmp_dir)

        expect(File).to exist(File.join(tmp_dir, "account-marked-task.js"))
      end
    end

    it "writes model files to all configured env paths" do
      Dir.mktmpdir do |tmp_dir_one|
        Dir.mktmpdir do |tmp_dir_two|
          with_env(
            ApiMaker::GenerateFrontendModels::FRONTEND_MODELS_PATHS_ENV_KEY,
            [tmp_dir_one, tmp_dir_two].join(File::PATH_SEPARATOR)
          ) do
            ApiMaker::GenerateFrontendModels.execute!
          end

          [tmp_dir_one, tmp_dir_two].each do |tmp_dir|
            expect(File).to exist(File.join(tmp_dir, "task.js"))
            expect(File).not_to exist(File.join(tmp_dir, "api-maker-base-model-types.d.ts"))
            expect(File).to exist(File.join(tmp_dir, "../models.js"))
          end
        end
      end
    end
  end

private

  def with_env(key, value)
    old_value = ENV.fetch(key, nil)

    if value.nil?
      ENV.delete(key)
    else
      ENV[key] = value
    end

    yield
  ensure
    if old_value.nil?
      ENV.delete(key)
    else
      ENV[key] = old_value
    end
  end
end
