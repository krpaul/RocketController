require 'mini_magick'

class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    $lastRow = Telemetry.all.last

    def inData
        # save data in DB
        t = Telemetry.new()

        t.lat = params.require(:lat)
        t.lng = params.require(:lng)
        t.alt = params.require(:alt)

        # ensure data makes sense
        if not params[:lat].to_f.between?(-90, 90) or not params[:lng].to_f.between?(-180, 180)
            return render plain: "Malformed data: Lat or Lng in bad range\n"
        end
        
        t.temp = params.require(:temp)
        t.humidity = params.require(:humidity)
        t.pressure = params.require(:pressure)

        t.accelerationX = params.require(:acceleration).require(:x)
        t.accelerationY = params.require(:acceleration).require(:y)
        t.accelerationZ = params.require(:acceleration).require(:z)

        t.gyroX = params.require(:gyro).require(:x)
        t.gyroY = params.require(:gyro).require(:y)
        t.gyroZ = params.require(:gyro).require(:z)

        t.magX = params.require(:orientation).require(:x)
        t.magY = params.require(:orientation).require(:y)
        t.magZ = params.require(:orientation).require(:z)

        t.calibrationSys = params.require(:calibration).require(:sys)
        t.calibrationGyro = params.require(:calibration).require(:gyro)
        t.calibrationMag = params.require(:calibration).require(:mag)
        t.calibrationAccel = params.require(:calibration).require(:accel)

        t.RSSI = (params.has_key? :RSSI) ? params[:RSSI] : 0
        t.lastNodeName = (params.has_key? :lastNodeName) ? params[:lastNodeName] : "Unknown"

        t.receiver_lat = (params.has_key? :lastNodeName) ? params[:receiver][:lat] : 51.151908 # school's lat/lng as fallback
        t.receiver_lng = (params.has_key? :lastNodeName) ? params[:receiver][:lng] : -114.203129

        t.flight = Flight.all.last
        $lastRow = t

        t.save!
        
        # set the global data var json
        $data = reconstructJSON(t)
    
        return # return no content
    end

    def image
        metadata = "data:image/jpeg;base64,"

        # Grab image
        b64 = params.require(:base64)

        # store in db
        i = Image.new

        i.base64 = b64 # set data

        # resize a thumbnail
        img_obj = MiniMagick::Image.read(Base64.decode64(b64[metadata.size..-1]))
        img_obj.resize "200x150"
        i.base64_thumbnail = metadata + Base64.encode64(img_obj.to_blob).to_s
        
        i.flight = Flight.all.last # set flight

        i.save!
    end

    def getLastImage
        return render json: {"base64": Image.where(flight_id: params[:flight_id].to_i).last.base64}
    end

    def getLastImage_time
        img = Image.where(flight_id: params[:flight_id].to_i)

        if img.length != 0 
            return render json: {"time": img.last.updated_at.to_i}
        else
            return render json: {}
        end

    end
end
