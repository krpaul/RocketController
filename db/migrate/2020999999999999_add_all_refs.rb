class AddAllRefs < ActiveRecord::Migration[6.0]
  def change
    add_foreign_key :telemetries, :flights
  end
end
