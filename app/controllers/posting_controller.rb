class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    def inData
        # save data in DB
        t = Telemetry.new

        t.lat = params[:lat]
        t.lng = params[:lng]
        t.alt = params[:alt]

        t.accelerationX = params[:acceleration][:x].to_f
        t.accelerationY = params[:acceleration][:y].to_f
        t.accelerationZ = params[:acceleration][:z].to_f

        t.gyroX = params[:gyro][:x].to_f
        t.gyroY = params[:gyro][:y].to_f
        t.gyroZ = params[:gyro][:z].to_f

        t.orientationX = params[:orientation][:x].to_f
        t.orientationY = params[:orientation][:y].to_f
        t.orientationZ = params[:orientation][:z].to_f

        t.calib_SYS = params[:calibration][:sys].to_i
        t.calib_MAG = params[:calibration][:mag].to_i
        t.calib_GYRO = params[:calibration][:gyro].to_i
        t.calib_ACCEL = params[:calibration][:accel].to_i

        t.RSSI = params[:RSSI].to_i
        t.lastNodeName = (params.has_key? :lastNodeName) ? params[:lastNodeName] : "Unknown"

        t.receiver_lat = params[:receiver][:lat]
        t.receiver_lng = params[:receiver][:lng]
        
        # set the flight to the last flight
        # if there isn't a last flight, create a default
        if Flight.all.length == 0
            f = Flight.new
            f.name = "Default Flight"
            f.desc = ""
            f.save!
        end
        t.flight = Flight.all.last
        
        t.save!
        
        # set the global data var json
        $data = reconstructJSON(t)
    
        return # return no content
    end
end
