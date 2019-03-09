class AccountMarkedTask < ApplicationRecord
  belongs_to :account
  belongs_to :task
end
