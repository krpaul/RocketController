class CreateFlights < ActiveRecord::Migration[6.0]
  def change
    create_table :flights do |t|
      t.string :name
      t.text :desc
      
      t.timestamps
    end
  end
end
