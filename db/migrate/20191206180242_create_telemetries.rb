class CreateTelemetries < ActiveRecord::Migration[6.0]
  def change
    create_table :telemetries do |t|
      t.float :lat
      t.float :lng
      t.float :alt
      
      t.float :accelerationX
      t.float :accelerationY
      t.float :accelerationZ
      
      t.float :gyroX
      t.float :gyroY
      t.float :gyroZ
      
      t.float :orientationX
      t.float :orientationY
      t.float :orientationZ
      
      t.integer :RSSI
      t.string  :lastNodeName
      
      t.float :receiver_lat
      t.float :receiver_lng

      t.references :flight, null: false, foreign_key: true

      t.timestamps
    end
  end
end
