# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_03_30_025924) do

  create_table "flights", force: :cascade do |t|
    t.string "name"
    t.text "desc"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "telemetries", force: :cascade do |t|
    t.float "lat"
    t.float "lng"
    t.float "alt"
    t.float "accelerationX"
    t.float "accelerationY"
    t.float "accelerationZ"
    t.float "gyroX"
    t.float "gyroY"
    t.float "gyroZ"
    t.float "orientationX"
    t.float "orientationY"
    t.float "orientationZ"
    t.integer "calib_SYS"
    t.integer "calib_MAG"
    t.integer "calib_GYRO"
    t.integer "calib_ACCEL"
    t.integer "RSSI"
    t.string "lastNodeName"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

end
