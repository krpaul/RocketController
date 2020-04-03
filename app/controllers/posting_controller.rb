class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    def inData
        # save data in DB
        t = Telemetry.new

        t.lat = params[:lat]
        t.lng = params[:lng]
        t.alt = params[:alt]

        t.accelerationX = params[:acceleration][:x]
        t.accelerationY = params[:acceleration][:y]
        t.accelerationZ = params[:acceleration][:z]

        t.gyroX = params[:gyro][:x]
        t.gyroY = params[:gyro][:y]
        t.gyroZ = params[:gyro][:z]

        t.orientationX = params[:orientation][:x]
        t.orientationY = params[:orientation][:y]
        t.orientationZ = params[:orientation][:z]

        t.calib_SYS = params[:calibration][:sys]
        t.calib_MAG = params[:calibration][:mag]
        t.calib_GYRO = params[:calibration][:gyro]
        t.calib_ACCEL = params[:calibration][:accel]

        t.RSSI = params[:RSSI]
        t.lastNodeName = (params.has_key? :lastNodeName) ? params[:lastNodeName] : "Unknown"
        
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
