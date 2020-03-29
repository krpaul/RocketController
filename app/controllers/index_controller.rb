require 'net/http'
require 'json'

class IndexController < ApplicationController
    skip_before_action :verify_authenticity_token
    $data = nil

    def index
    end

=begin
=end    

    def reconstructJSON(db_col)
        {
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
            "timestamp" => db_col.created_at.to_time.to_i # add timestamp
        }
    end

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
        
        t.save!
        
        # set the global data var json
        $data = reconstructJSON(t)
    
        return # return no content
    end
    
    # gives latest data; will be requested by ajax
    def outData 
        if $data
            return render json: $data
        else 
            puts "No content on request"
            return
        end
    end

    # returns the whole database
    def allData
        return render json: Telemetry.all.map {|s| reconstructJSON s }
    end

    # clears the database
    def reset
        Telemetry.delete_all
        return redirect_to '/'
    end
end
