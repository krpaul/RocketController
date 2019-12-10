class ApplicationController < ActionController::Base
    def hashTelemData(t_obj) # converts a DB row into a ruby hash for json-ing
        # return {
        #     :latitude => t_obj.latitude,
        #     :longitude => t_obj.longitude,
        #     :altitude => t_obj.altitude,
        #     :gps_quality => t_obj.gps_quality,
        #     :hdop => t_obj.hdop,
        # }
        return Hash.new()
    end
end
