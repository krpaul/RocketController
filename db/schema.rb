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

ActiveRecord::Schema.define(version: 2020999999999999) do

  create_table "flights", force: :cascade do |t|
    t.string "name"
    t.text "desc"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "images", force: :cascade do |t|
    t.text "base64"
    t.text "base64_thumbnail"
    t.integer "flight_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flight_id"], name: "index_images_on_flight_id"
  end

  create_table "telemetries", force: :cascade do |t|
    t.float "lat"
    t.float "lng"
    t.float "alt"
    t.float "temp"
    t.float "humidity"
    t.float "pressure"
    t.float "accelerationX"
    t.float "accelerationY"
    t.float "accelerationZ"
    t.float "gyroX"
    t.float "gyroY"
    t.float "gyroZ"
    t.float "magX"
    t.float "magY"
    t.float "magZ"
    t.float "angleY"
    t.float "angleX"
    t.float "angleZ"
    t.integer "RSSI"
    t.string "lastNodeName"
    t.float "receiver_lat"
    t.float "receiver_lng"
    t.integer "flight_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flight_id"], name: "index_telemetries_on_flight_id"
  end

  add_foreign_key "images", "flights"
  add_foreign_key "telemetries", "flights"
  add_foreign_key "telemetries", "flights"
end
