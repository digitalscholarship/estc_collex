class Annotation < ActiveRecord::Base
  belongs_to :user
  belongs_to :predicate
  attr_accessible :attachment_no, :feedback, :flag, :object_uri, :subject_uri
end
