class User < ApplicationRecord
  ADDITIONAL_ATTRIBUTES_FOR_VALIDATION_ERRORS = [:password].freeze

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :trackable, :validatable

  belongs_to :current_workplace, class_name: "WorkerPlugins::Workplace", optional: true

  has_many :comments, dependent: :restrict_with_error, foreign_key: :author_id
  has_many :tasks, dependent: :destroy
  has_many :supported_tasks, class_name: "Task", foreign_key: :support_email, primary_key: :email
  has_many :user_roles, dependent: :destroy

  accepts_nested_attributes_for :tasks

  has_one_attached :image

  def name
    "#{first_name} #{last_name}"
  end
end
