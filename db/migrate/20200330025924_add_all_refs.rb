class AddAllRefs < ActiveRecord::Migration[6.0]
  def change
    add_foreign_key :telemetry, :flights
  end
end
