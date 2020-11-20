require 'mini_magick'

class PostingController < ApplicationController
    skip_before_action :check_for_lockup, raise: false
    skip_before_action :verify_authenticity_token, except: [:create, :update, :destroy]
    
    $lastRow = Telemetry.all.last

    def inData
        # if this is an SF10 (true) or SF8 (false) packet
        critical = false

        $data_ttn = params.require(:payload_fields)

        puts $data_ttn.inspect

        if ($data_ttn.has_key? :gps_0)
            critical = true
        end

        def isCritical(t)
            t.lat = $data_ttn.require(:gps_0).require(:latitude)
            t.lng = $data_ttn.require(:gps_0).require(:longitude)
            t.alt = $data_ttn.require(:gps_0).require(:altitude)

            # ensure data makes sense
            if not $data_ttn[:lat].to_f.between?(-90, 90) or not $data_ttn[:lng].to_f.between?(-180, 180)
                return render plain: "Malformed data: Lat or Lng in bad range\n"
            end
        end
        

        def isntCritical(t)
            t.pressure = $data_ttn.require(:barometric_pressure_1)
            t.temp = $data_ttn.require(:barometric_pressure_2)
            t.humidity = $data_ttn.require(:barometric_pressure_3)

            t.accelerationX = $data_ttn.require(:accelerometer_0).require(:x)
            t.accelerationY = $data_ttn.require(:accelerometer_0).require(:y)
            t.accelerationZ = $data_ttn.require(:accelerometer_0).require(:z)

            t.gyroX = $data_ttn.require(:gyrometer_0).require(:x)
            t.gyroY = $data_ttn.require(:gyrometer_0).require(:y)
            t.gyroZ = $data_ttn.require(:gyrometer_0).require(:z)

            t.magX = $data_ttn.require(:analog_in_1)
            t.magY = $data_ttn.require(:analog_in_2)
            t.magZ = $data_ttn.require(:analog_in_3)

            t.angleX = $data_ttn.require(:analog_in_4)
            t.angleY = $data_ttn.require(:analog_in_5)
            t.angleZ = $data_ttn.require(:analog_in_6)

            t.RSSI = ($data_ttn.has_key? :lastNodeName) ? $data_ttn[:lastNodeName] : 0
            t.lastNodeName = ($data_ttn.has_key? :lastNodeName) ? $data_ttn[:lastNodeName] : "Unknown"

            t.receiver_lat = ($data_ttn.has_key? :lastNodeName) ? $data_ttn[:receiver][:lat] : 51.151908 # school's lat/lng as fallback
            t.receiver_lng = ($data_ttn.has_key? :lastNodeName) ? $data_ttn[:receiver][:lng] : -114.203129
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
