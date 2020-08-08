require 'net/http'
require 'json'

include IndexHelper

class IndexController < ApplicationController
    $data = nil

    $graphSettingsGlobal = {
        :xAxis => {:visible => false},
        :chart => {:animation => false},
        :plotOptions => {
            :series => {
                :animation => {
                    :duration => 0
                }
            }
        },
        :drilldown => {
            :animation => {
                :duration => 0
            }
        },
        :defer => true
    }

    def index 
        @graphSettings = $graphSettingsGlobal
        @f = params[:flight_id]

        @imgs = Image.where(flight_id: params[:flight_id].to_i)
    end

    def otherTelem
        @f = params[:flight_id]
        @graphSettings = $graphSettingsGlobal
    end

    def configuration
        @f = params[:flight_id]
    end

    def map
        @f = params[:flight_id]
    end

    def images
        @f = params[:flight_id]
        @images = Image.where(flight_id: @f)
    end

    def route_me
        return redirect_to "/" + Flight.all.last.id.to_s + "/telemetry"
    end

    # gives latest data; will be requested by ajax
    def outData 
        # doesn't get logged because this request comes in multiple times per second
        if $data
            return render json: $data
        else 
            puts "No content on request"
            return render json: {}
        end
    end

    # returns the whole database
    def allData
        return render json: Flight.find(params[:flight]).telemetries.map {|s| reconstructJSON s }
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

    def lastUpdate
        return render json: (Time.now - Flight.find(params[:flight_id].to_i).telemetries.last.created_at).to_i
    end

    private 
    def getTelem
        Flight.all.last.telemetries
    end
end
