class CreateDataStreams < ActiveRecord::Migration[6.0]
  def change
    create_table :data_streams do |t|
      t.text :stream

      t.timestamps
    end
  end
end
