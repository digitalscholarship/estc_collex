class CreateReviews < ActiveRecord::Migration
  def change
    create_table :reviews do |t|
      t.integer :annotation_id
      t.integer :user_id
      t.text :feedback
      t.integer :attachment_no
      t.integer :status

      t.timestamps
    end
  end
end
