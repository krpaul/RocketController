require 'net/http'
require 'json'

class IndexController < ApplicationController
    $data = nil

    def index
    end

    def otherTelem
    end

    def configuration
    end

    # gives latest data; will be requested by ajax
    def outData 
        Rails.logger.silence do
            # doesn't get logged because this request comes in multiple times per second
            if $data
                return render json: $data
            else 
                puts "No content on request"
                return
            end
        end
    end

    # returns the whole database
    def allData
        return render json: Flight.all.last.telemetries.map {|s| reconstructJSON s }
    end

    # creates a new flight
    def newFlight
        f = Flight.new
        f.name = params[:name]
        f.desc = params[:desc]
        f.save
        return redirect_to '/'
    end

    # clears the database
    def reset
        Telemetry.delete_all
        return redirect_to '/'
    end
end
