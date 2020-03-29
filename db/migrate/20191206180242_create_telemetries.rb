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

      t.integer :calib_SYS
      t.integer :calib_MAG
      t.integer :calib_GYRO
      t.integer :calib_ACCEL

      t.text :rawJSON

      t.timestamps
    end
  end
end
