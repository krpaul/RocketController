require 'nmea_plus'

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

        decoder = NMEAPlus::Decoder.new

        message = decoder.parse(datastream)

        decomp = 
        {
            :millis, 
            :mission_elapsed, 
            :bat_voltage, 
            :time_since_last_sat_fix, 
            :gps_satellites, 
            :latitude => message.latitude, 
            :longitude => message.longitude, 
            :altitude => message.altitude, 
            :heading, 
            :downrange_dist, 
            :downrange_bearing, 
            :avg_ascent_rate, 
            :last_rssi, 
            :last_snr
        }

        

        decomp[:db_time] = datastream.created_at.to_i

        return decomp
    end
end
