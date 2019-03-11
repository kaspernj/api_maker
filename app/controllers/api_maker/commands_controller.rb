class ApiMaker::CommandsController < ApiMaker::BaseController
  def create
    responses = {}
    threads = []
    lock = Mutex.new
    controller = self
    ability = current_ability
    args = api_maker_args

    params[:pool].each do |command_type, command_type_data|
      command_type_data.each do |model_plural_name, command_model_data|
        command_model_data.each do |command_name, command_data|
          puts "New command service"
          command = ApiMaker.const_get("#{command_type.camelize}CommandService").new(
            ability: ability,
            args: args,
            commands: command_data,
            command_name: command_name,
            model_name: model_plural_name,
            controller: controller
          )

          puts "Adding new thread"

          threads << Thread.new do
            puts "Thread started"

            begin
              puts "Rails wrap"
              Rails.application.executor.wrap do
                puts "Inside thread"
                result = command.execute!.result

                puts "Lock lock"
                puts "Merge result"
                responses.merge!(result)
                puts "Done with merge"
              end
            rescue => e
              puts "ERROR!"

              logger.error e.message
              logger.error e.backtrace.join("\n")

              ApiMaker::Configuration.current.report_error(e)
            end
          end
        end
      end
    end

    puts "Joining threads"
    threads.each_with_index do |thread, index|
      puts "Join thread #{index}"
      thread.join
      puts "Thread done #{index}"
    end
    threads.map(&:join)

    render json: {responses: responses}
  end
end
