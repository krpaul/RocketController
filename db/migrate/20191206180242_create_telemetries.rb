class CreateTelemetries < ActiveRecord::Migration[6.0]
  def change
    create_table :telemetries do |t|
      t.float :lat
      t.float :lng
      t.float :alt

      t.float :temp
      t.float :humidity
      t.float :pressure
      
      t.float :accelerationX
      t.float :accelerationY
      t.float :accelerationZ
      
      t.float :gyroX
      t.float :gyroY
      t.float :gyroZ
      
      t.float :magX
      t.float :magY
      t.float :magZ
      
      t.float :angleY
      t.float :angleX
      t.float :angleZ
      
      t.integer :RSSI
      t.string  :lastNodeName
      
      t.float :receiver_lat
      t.float :receiver_lng

      t.references :flight, null: false, foreign_key: true

      t.timestamps
    end
  end
end
