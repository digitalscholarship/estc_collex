class CreateAnnotations < ActiveRecord::Migration
  def change
    create_table :annotations do |t|
      t.text :subject_uri
      t.text :object_uri
      t.text :feedback
      t.integer :flag
      t.integer :attachment_no
      t.references :user
      t.references :predicate

      t.timestamps
    end
    add_index :annotations, :user_id
    add_index :annotations, :predicate_id
  end
end
