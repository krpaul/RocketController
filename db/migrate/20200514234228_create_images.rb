class CreateImages < ActiveRecord::Migration[6.0]
  def change
    create_table :images do |t|
      t.text :base64
      
      t.timestamps
    end
  end
end
