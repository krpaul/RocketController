module ApplicationHelper
    def decompressTelemetryString(datastream)
        dataHeaders = [
            :millis, 
            :mission_elapsed, 
            :bat_voltage, 
            :time_since_last_sat_fix, 
            :gps_satellites, 
            :latitude, 
            :longitude, 
            :altitude, 
            :heading, 
            :downrange_dist, 
            :downrange_bearing, 
            :avg_ascent_rate, 
            :last_rssi, 
            :last_snr
        ]

        values = datastream.stream.remove("$").split(",")

        decomp = Hash.new(values.length)
        
        for i in 0...dataHeaders.length
            decomp[dataHeaders[i]] = values[i]
        end

        decomp[:db_time] = datastream.created_at.to_i

        return decomp
    end
end
