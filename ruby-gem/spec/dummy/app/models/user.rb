class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :trackable, :validatable

  has_many :comments, dependent: :restrict_with_error
  has_many :tasks, dependent: :destroy
  has_many :user_roles, dependent: :destroy

  accepts_nested_attributes_for :tasks

  has_one_attached :image

  def name
    "#{first_name} #{last_name}"
  end
end
