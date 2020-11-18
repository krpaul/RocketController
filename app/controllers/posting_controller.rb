require 'mini_magick'

class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    def inData
        # if this is an SF10 (true) or SF8 (false) packet
        critical = false

        data_ttn = params.require(:payload_fields)

        if (data_ttn[:gps_0][:latitude].present? && 
            data_ttn[:gps_0][:longitude].present? && 
            data_ttn[:gps_0][:altitude].present?)
            critical = true
        end

        def isCritical(t)
            t.lat = data_ttn[:lat]
            t.lng = data_ttn[:lng]
            t.alt = data_ttn[:alt]

            # ensure data makes sense
            if not data_ttn[:lat].to_f.between?(-90, 90) or not data_ttn[:lng].to_f.between?(-180, 180)
                return render plain: "Malformed data: Lat or Lng in bad range\n"
            end
        end
        

        def isntCritical(t)
            t.temp = params.require(:temp)
            t.humidity = params.require(:humidity)
            t.pressure = params.require(:pressure)

            t.accelerationX = params.require(:acceleration).require(:x)
            t.accelerationY = params.require(:acceleration).require(:y)
            t.accelerationZ = params.require(:acceleration).require(:z)

            t.gyroX = params.require(:gyro).require(:x)
            t.gyroY = params.require(:gyro).require(:y)
            t.gyroZ = params.require(:gyro).require(:z)

            t.magX = params.require(:mag).require(:x)
            t.magY = params.require(:mag).require(:y)
            t.magZ = params.require(:mag).require(:z)

            t.angleX = params.require(:angle).require(:x)
            t.angleY = params.require(:angle).require(:y)
            t.angleZ = params.require(:angle).require(:z)

            t.RSSI = (params.has_key? :lastNodeName) ? data_ttn[:lastNodeName] : 0
            t.lastNodeName = (params.has_key? :lastNodeName) ? data_ttn[:lastNodeName] : "Unknown"

            t.receiver_lat = (params.has_key? :lastNodeName) ? data_ttn[:receiver][:lat] : 51.151908 # school's lat/lng as fallback
            t.receiver_lng = (params.has_key? :lastNodeName) ? data_ttn[:receiver][:lng] : -114.203129
        end

        t = nil
        if is_complete? $lastRow 
            t = Telemetry.new
            # set the flight to the last flight
            t.flight = Flight.all.last
            $lastRow = t
        else
            t = $lastRow
        end

        if critical
            isCritical(t)
        else
            isntCritical(t)
        end

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
            return render json: {"time": img.last.created_at.to_i}
        else
            return render json: {}
        end

    end
end
