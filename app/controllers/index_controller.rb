require 'net/http'
require 'json'

class IndexController < ApplicationController
    skip_before_action :verify_authenticity_token
    $data = nil

    def hashTelemData(t_obj) # converts a DB row into a ruby hash for json-ing
        return {
            :latitude => t_obj.latitude,
            :longitude => t_obj.longitude,
            :altitude => t_obj.altitude,
            :gps_quality => t_obj.gps_quality,
            :hdop => t_obj.hdop,
            :timestamp => t_obj.created_at,
        }
    end

    def index
    end

=begin
    Availible Data Should Be:
    :latitude
    :longitude
    :altitude
    :gps_quality
        GPS Quality indicator reference: 
            0 -> Fix not valid
            1 -> GPS fix
            2 -> Differential GPS fix, OmniSTAR VBS
            4 -> Real-Time Kinematic, fixed integers
            5 -> Real-Time Kinematic, float integers, OmniSTAR XP/HP or Location RTK
    :hdop
        Horizontal Dilution of Precision
=end    

    def inData
        # save data in DB
        t = Telemetry.new
        t.latitude = params[:latitude]
        t.longitude = params[:longitude]
        t.altitude = params[:altitude]
        t.gps_quality = params[:gps_quality]
        t.hdop = params[:hdop]
        t.save
        
        # set the global data var
        $data = hashTelemData(t)
    
        return # return no content
    end
    
    # gives latest data; will be requested by ajax
    def outData 
        if $data
            return render json: $data
        else 
            puts "No content on request"
            return
        end
    end

    # returns the whole database
    def all
        return render json: Telemetry.all.map {|s| hashTelemData(s) }
    end

    # clears the database
    def reset
        Telemetry.delete_all
        return redirect_to '/'
    end

end
