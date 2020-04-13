class GraphController < ApplicationController
    def alt 
        return render json: formatTime(Flight.all.last.telemetries.group_by_minute(:created_at).pluck(:created_at, :alt))
    end

    def accel
        return render json: [
            {name: "X", data: telem(:accelerationX), color: "#f00"},
            {name: "Y", data: telem(:accelerationY), color: "#06f"},
            {name: "Z", data: telem(:accelerationZ), color: "#0f0"}
        ]
    end

    def gyro
        return render json: [
            {name: "X", data: telem(:gyroX), color: "#f00"},
            {name: "Y", data: telem(:gyroY), color: "#06f"},
            {name: "Z", data: telem(:gyroZ), color: "#0f0"}
        ]
    end

    def orientation
        return render json: [
            {name: "X", data: telem(:orientationX), color: "#f00"},
            {name: "Y", data: telem(:orientationY), color: "#06f"},
            {name: "Z", data: telem(:orientationZ), color: "#0f0"}
        ]
    end

    def rssi
        return render json: telem(:rssi)
    end

    private
    def telem(sym)
        formatTime(Flight.all.last.telemetries.group_by_minute(:created_at).pluck(:created_at, sym))
    end
end
