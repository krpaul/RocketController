include IndexHelper

class GraphController < ApplicationController
    def alt 
        return render json: telem(:alt, params[:flight_id]).select { |item| item[1] != 0 }
    end

    def accel
        return render json: [
            {name: "X", data: telem(:accelerationX, params[:flight_id]), color: "#f00"},
            {name: "Y", data: telem(:accelerationY, params[:flight_id]), color: "#06f"},
            {name: "Z", data: telem(:accelerationZ, params[:flight_id]), color: "#0f0"}
        ]
    end

    def gyro
        return render json: [
            {name: "X", data: telem(:gyroX, params[:flight_id]), color: "#f00"},
            {name: "Y", data: telem(:gyroY, params[:flight_id]), color: "#06f"},
            {name: "Z", data: telem(:gyroZ, params[:flight_id]), color: "#0f0"}
        ]
    end

    def orientation
        return render json: [
            {name: "X", data: telem(:angleX, params[:flight_id]), color: "#f00"},
            {name: "Y", data: telem(:angleY, params[:flight_id]), color: "#06f"},
            {name: "Z", data: telem(:angleZ, params[:flight_id]), color: "#0f0"}
        ]
    end

    def rssi
        return render json: telem(:rssi, params[:flight_id])
    end

    private
    def telem(sym, f_id)
        formatTime(Flight.find(f_id.to_i).telemetries.group_by_minute(:created_at).pluck(:created_at, sym))
    end
end
