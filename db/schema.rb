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

ActiveRecord::Schema.define(version: 2021000000000000) do

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

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
    t.float "calibrationSys"
    t.float "calibrationGyro"
    t.float "calibrationMag"
    t.float "calibrationAccel"
    t.integer "RSSI"
    t.string "lastNodeName"
    t.float "receiver_lat"
    t.float "receiver_lng"
    t.integer "flight_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flight_id"], name: "index_telemetries_on_flight_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "images", "flights"
  add_foreign_key "telemetries", "flights"
  add_foreign_key "telemetries", "flights"
end
