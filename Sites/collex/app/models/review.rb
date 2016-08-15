class Review < ActiveRecord::Base
  belongs_to :user
  attr_accessible :annotation_id, :attachment_no, :feedback, :status, :user_id
end
