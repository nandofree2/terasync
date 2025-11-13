class User < ApplicationRecord
  belongs_to :role, optional: true
  
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  def admin?
    role&.name == 'admin'
  end
end
