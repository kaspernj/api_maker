require "rails_helper"
require "tmpdir"

describe ApiMaker::GenerateFrontendModels do
  describe "#perform" do
    it "generates one model file per resource with typed methods" do
      Dir.mktmpdir do |tmp_dir|
        ApiMaker::GenerateFrontendModels.execute!(path: tmp_dir)

        task_model_path = File.join(tmp_dir, "task.js")
        task_content = File.read(task_model_path)

        expect(File).to exist(task_model_path)
        expect(task_content).to include("import BaseModel from \"../base-model.js\"")
        expect(task_content).to include("class Task extends BaseModel")
        expect(task_content).to include("static modelClassData()")
        expect(task_content).to include("/** @returns {number} */\n  id()")
        expect(task_content).to include("/** @returns {number | null} */\n  priority()")
        expect(task_content).to include("/** @returns {string} */\n  name()")
        expect(task_content).to include("/** @returns {any} */\n  translatedState()")
        expect(task_content).to include("/** @returns {any} */\n  customId()")
        expect(task_content).to include("@template TCommandResponse")
        expect(task_content).to include("@returns {Promise<TCommandResponse>}")
        expect(task_content).not_to include("@returns {Promise<any>}")
        expect(task_content).to include("static testCollection(args, commandArgs = {})")
        expect(task_content).to include("testMember(args, commandArgs = {})")
        expect(task_content).to include("project()")
        expect(task_content).to include("loadProject()")
        expect(task_content).to include("comments()")
        expect(task_content).to include("loadComments()")
      end
    end

    it "uses dasherized model file names" do
      Dir.mktmpdir do |tmp_dir|
        ApiMaker::GenerateFrontendModels.execute!(path: tmp_dir)

        expect(File).to exist(File.join(tmp_dir, "account-marked-task.js"))
      end
    end
  end
end
