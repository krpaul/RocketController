class ApplicationController < ActionController::Base
    def reconstructJSON(db_col)
        prev_col = db_col.id > 1 ? Telemetry.find(db_col.id - 1) : db_col

        {
            "flight_id" => db_col.flight.id,
            "lat" => db_col.lat || prev_col.lat,
            "lng" => db_col.lng || prev_col.lng,
            "alt" => db_col.alt || prev_col.alt,
            "temp" => db_col.temp || prev_col.temp,
            "humidity" => db_col.humidity || prev_col.humidity,
            "pressure" => db_col.pressure || prev_col.pressure,
            "acceleration" => {
                "x" => db_col.accelerationX || prev_col.accelerationX,
                "y" => db_col.accelerationY || prev_col.accelerationY,
                "z" => db_col.accelerationZ || prev_col.accelerationZ
            },
            "mag" => {
                "x" => db_col.magX || prev_col.magX,
                "y" => db_col.magY || prev_col.magY,
                "z" => db_col.magZ || prev_col.magZ
            },
            "gyro" => {
                "y" => db_col.gyroY || prev_col.gyroY,
                "x" => db_col.gyroX || prev_col.gyroX,
                "z" => db_col.gyroZ || prev_col.gyroZ
            },
            "angle" => {
                "y" => db_col.angleY || prev_col.angleY,
                "x" => db_col.angleX || prev_col.angleX,
                "z" => db_col.angleZ || prev_col.angleZ
            },
            "RSSI": db_col.RSSI || prev_col.RSSI,
            "lastNodeName": db_col.lastNodeName || prev_col.lastNodeName,
            "receiver" => {
                "lat" => db_col.receiver_lat || prev_col.receiver_lat,
                "lng" => db_col.receiver_lng || prev_col.receiver_lng
            },
            "flight": db_col.flight.name || prev_col.flight.name,
            # add timestamps
            "timestamp" => db_col.created_at.to_time.to_i || prev_col.created_at.to_time.to_i,
            "tstamp-formatted" => db_col.created_at.to_s || prev_col.created_at.to_s 
        }
    end

    def is_complete?(model)
        whitelist = %w[ id created_at updated_at ]
      
        not model.attributes.any? do |attr, val|
            whitelist.exclude?(attr) && (val.nil? || val == [] || val == [""])
        end
    end
      
end
