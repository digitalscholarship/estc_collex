class Attachment < ActiveRecord::Base
  attr_accessible :attachment_no, :content_type, :file_name
end
