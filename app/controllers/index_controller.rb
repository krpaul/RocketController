require 'net/http'
require 'json'

include ApplicationHelper

class IndexController < ApplicationController
    def index
    end

    def checkForTelemetryUpdate
        aiokey = "d8e82ee635f343aa9a6790ecb1049899"; feedkey = "raw-telemetry-string"; limit = 1

        url = URI.parse("http://io.adafruit.com/api/feeds/" + feedkey + "/data.json?X-AIO-Key=" + aiokey + "&limit=" + limit.to_s)
        req = Net::HTTP::Get.new(url.to_s)
        
        res = Net::HTTP.start(url.host, url.port) { |http|
            http.request(req)
        }

        json = JSON.parse(res.body)

        if DataStream.last != nil and DataStream.last.stream == json[0]["value"]
            return 
        else
            # Save to db
            d = DataStream.new
            d.stream = json[0]["value"]
            d.save

            # Decompress string
            decomp = decompressTelemetryString(d)

            return render json: decomp
        end
    end

    def resetDB
        DataStream.delete_all
        return redirect_to '/'
    end

    def allTelemetry
        checkForTelemetryUpdate
        return render json: DataStream.all.map {|s| decompressTelemetryString(s) }
    end
end
