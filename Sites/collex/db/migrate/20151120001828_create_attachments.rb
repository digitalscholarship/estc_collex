class CreateAttachments < ActiveRecord::Migration
  def change
    create_table :attachments do |t|
      t.integer :attachment_no
      t.text :file_name
      t.text :content_type

      t.timestamps
    end
  end
end
