class CreateProducts < ActiveRecord::Migration[7.2]
  def change
    create_table :products, id: :uuid do |t|
      t.string :name
      t.string :sku
      t.decimal :price
      t.integer :stock
      t.text :description

      t.timestamps
    end
    
    add_index :products, :sku, unique: true
    add_index :products, :name
  end
end
