require 'net/http'
require 'json'

class IndexController < ApplicationController
    $data = nil

    def index
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
        return render json: Telemetry.all.map {|s| reconstructJSON s }
    end

    # clears the database
    def reset
        Telemetry.delete_all
        return redirect_to '/'
    end
end
