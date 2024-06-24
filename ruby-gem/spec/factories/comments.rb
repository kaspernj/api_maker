FactoryBot.define do
  factory :comment do
    author factory: %i[user]
    resource factory: %i[task]
    comment { "Comment" }
  end
end
