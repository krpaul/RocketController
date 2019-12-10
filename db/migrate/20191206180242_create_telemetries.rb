class CreateTelemetries < ActiveRecord::Migration[6.0]
  def change
    create_table :telemetries do |t|
      t.float :latitude
      t.float :longitude
      t.float :altitude
      t.integer :gps_quality
      t.float :hdop

      t.timestamps
    end
  end
end
