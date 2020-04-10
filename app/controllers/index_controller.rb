require 'net/http'
require 'json'

class IndexController < ApplicationController
    $data = nil

    def index
        @altTelem = getTelem().group_by_minute(:created_at).pluck(:created_at, :alt)
    end

    def otherTelem
        @relevantTelem = getTelem
    end

    def configuration
    end

    def map
    end

    # gives latest data; will be requested by ajax
    def outData 
        # doesn't get logged because this request comes in multiple times per second
        if $data
            return render json: $data
        else 
            puts "No content on request"
            return
        end
    end

    # returns the whole database
    def allData
        f = nil
        if params[:flight] && params[:flight] != ""
            f = Flight.where(:name == params[:flight])[0]
        else
            f = Flight.all.last
        end
        return render json: f.telemetries.map {|s| reconstructJSON s }
    end

    # creates a new flight
    def newFlight
        f = Flight.new
        f.name = params[:name]
        f.desc = params[:desc]
        f.save
        return redirect_to '/'
    end

    def isFlight
        return render json: {"exists": Flight.where(name: params[:name]).length != 0}
    end

    
    def getAllFlightData
        data = Flight.where(name: params[:flight])[0].telemetries
        p "DATA:", data
        aData = [data.pluck(:created_at, :accelerationX),
                data.pluck(:created_at, :accelerationY),
                data.pluck(:created_at, :accelerationZ)]

        gData = [data.pluck(:created_at, :gyroX),
                data.pluck(:created_at, :gyroY),
                data.pluck(:created_at, :gyroZ)]

        oData = [data.pluck(:created_at, :orientationX),
                data.pluck(:created_at, :orientationY),
                data.pluck(:created_at, :orientationZ)]

        rData = data.pluck(:created_at, :rssi)

        return render json: {
            "acceleration": aData,
            "gyro": gData,
            "orientation": oData,
            "rssi": rData
        }
    end

    private 
    def getTelem
        Flight.all.last.telemetries
    end
end
