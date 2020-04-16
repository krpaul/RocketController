class ApplicationController < ActionController::Base
    def reconstructJSON(db_col)
        {
            "flight_id" => db_col.id,
            "lat" => db_col.lat,
            "lng" => db_col.lng,
            "alt" => db_col.alt,
            "acceleration" => {
                "x" => db_col.accelerationX,
                "y" => db_col.accelerationY,
                "z" => db_col.accelerationZ
            },
            "orientation" => {
                "x" => db_col.orientationX,
                "y" => db_col.orientationY,
                "z" => db_col.orientationZ
            },
            "gyro" => {
                "y" => db_col.gyroY,
                "x" => db_col.gyroX,
                "z" => db_col.gyroZ
            },
            "calibration" => {
                "sys" => db_col.calib_SYS,
                "accel" => db_col.calib_ACCEL,
                "gyro" => db_col.calib_GYRO,
                "mag" => db_col.calib_MAG,
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
end
