module IndexHelper
    def formatTime(plucked_data)
        plucked_data.map {|x| [x[0].strftime("%x - %X"), x[1]] }
    end
end
