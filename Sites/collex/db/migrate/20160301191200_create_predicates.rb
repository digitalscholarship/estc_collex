class CreatePredicates < ActiveRecord::Migration
  def change
    create_table :predicates do |t|
      t.text :uri
      t.text :display_name

      t.timestamps
    end
  end
end
