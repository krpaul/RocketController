import time
import re

file = "/mnt/c/Users/krpau/Desktop/fdata.txt"
obj = open(file, "r")
contents = obj.read()
obj.close()
while True: 
    obj = open(file, "r")
    new = obj.read()

    diff = new.replace(contents, "")
    if (diff != ""):
        lat = re.search("LAT \d+", diff)
        lng = re.search("LNG \d+", diff)
        alt = re.search("ALT \d+", diff)
        if (all((lat, lng, alt))):
            print("Lat: ", lat.group(0).replace("LAT ", ""))
            print("Lng: ", lng.group(0).replace("LNG ", ""))
            print("Alt: ", alt.group(0).replace("ALT ", ""))
        contents = new

    time.sleep(5)
