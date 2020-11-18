class ApplicationController < ActionController::Base
    def reconstructJSON(db_col)
        {
            "flight_id" => db_col.flight.id,
            "lat" => db_col.lat,
            "lng" => db_col.lng,
            "alt" => db_col.alt,
            "temp" => db_col.temp,
            "humidity" => db_col.humidity,
            "pressure" => db_col.pressure,
            "acceleration" => {
                "x" => db_col.accelerationX,
                "y" => db_col.accelerationY,
                "z" => db_col.accelerationZ
            },
            "mag" => {
                "x" => db_col.magX,
                "y" => db_col.magY,
                "z" => db_col.magZ
            },
            "gyro" => {
                "y" => db_col.gyroY,
                "x" => db_col.gyroX,
                "z" => db_col.gyroZ
            },
            "angle" => {
                "y" => db_col.angleY,
                "x" => db_col.angleX,
                "z" => db_col.angleZ
            },
            "RSSI": db_col.RSSI,
            "lastNodeName": db_col.lastNodeName,
            "receiver" => {
                "lat" => db_col.receiver_lat,
                "lng" => db_col.receiver_lng
            },
            "flight": db_col.flight.name,
            # add timestamps
            "timestamp" => db_col.created_at.to_time.to_i,
            "tstamp-formatted" => db_col.created_at.to_s
        }
    end

    def is_complete?(model)
        whitelist = %w[ id created_at updated_at ]
      
        not model.attributes.any? do |attr, val|
            whitelist.exclude?(attr) && (val.nil? || val == [] || val == [""])
        end
    end
      
end
