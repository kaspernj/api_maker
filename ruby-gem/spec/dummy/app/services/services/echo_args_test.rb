class Services::EchoArgsTest < ApiMaker::BaseService
  def perform
    succeed!(args:)
  end
end
