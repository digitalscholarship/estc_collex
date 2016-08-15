class CreateNamespaces < ActiveRecord::Migration
  def change
    create_table :namespaces do |t|
      t.text :path
      t.text :tablename

      t.timestamps
    end
  end
end
