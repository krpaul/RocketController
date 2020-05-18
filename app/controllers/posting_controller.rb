class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    def inData
        # ensure data makes sense
        if not params[:lat].between?(-90, 90) or not params[:lng].between?(-180, 180)
            return render plain: "Malformed data: Lat or Lng in bad range\n"
        end

        # save data in DB
        t = Telemetry.new()

        t.lat = params.require(:lat)
        t.lng = params.require(:lng)
        t.alt = params.require(:alt)

        t.accelerationX = params.require(:acceleration).require(:x)
        t.accelerationY = params.require(:acceleration).require(:y)
        t.accelerationZ = params.require(:acceleration).require(:z)

        t.gyroX = params.require(:gyro).require(:x)
        t.gyroY = params.require(:gyro).require(:y)
        t.gyroZ = params.require(:gyro).require(:z)

        t.orientationX = params.require(:orientation).require(:x)
        t.orientationY = params.require(:orientation).require(:y)
        t.orientationZ = params.require(:orientation).require(:z)

        t.calib_SYS = params.require(:calibration).require(:sys)
        t.calib_MAG = params.require(:calibration).require(:mag)
        t.calib_GYRO = params.require(:calibration).require(:gyro)
        t.calib_ACCEL = params.require(:calibration).require(:accel)

        t.RSSI = params.require(:RSSI)
        t.lastNodeName = (params.has_key? :lastNodeName) ? params[:lastNodeName] : "Unknown"

        t.receiver_lat = params.require(:receiver).require(:lat)
        t.receiver_lng = params.require(:receiver).require(:lng)
        
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

    def image
        # Grab image
        b64 = params.require(:base64)

        # store in db
        i = Image.new

        i.base64 = b64 # set data
        i.flight = Flight.all.last # set flight

        i.save!
    end

    def getLastImage
        return render json: {"base64": Image.where(flight_id: params[:flight_id].to_i).last.base64}
    end

    def getLastImage_time
        img = Image.where(flight_id: params[:flight_id].to_i)

        if img.length != 0 
            return render json: {"time": img.last.created_at.to_i}
        else
            return render json: {}
        end

    end
end
