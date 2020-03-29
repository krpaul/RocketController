import time
import re
import requests

file = "/mnt/c/Users/krpau/Desktop/fdata.txt"
obj = open(file, "r")
contents = obj.read()
obj.close()

NUM_LINES_PER_PACKET = 17
URL = "http://localhost:3000/in"

while True: 
    obj = open(file, "r")
    new = obj.read()

    diff = new.replace(contents, "")
    if (diff != ""):
        lines = filter(lambda line: not (
            "lora" in line.lower() 
            or "freq" in line.lower() 
            or "failed" in line.lower()),
        diff.splitlines())
        
        # traverse each packet
        for packet in zip(*(iter(lines),) * NUM_LINES_PER_PACKET):
            print("packet: ", packet, sep="")

            _json = {
                "lat": packet[0],
                "lng": packet[1],
                "alt": packet[2],
                "acceleration": {
                    "x": packet[3], 
                    "y": packet[4],
                    "z": packet[5]
                },
                "orientation": {
                    "x": packet[6],
                    "y": packet[7],
                    "z": packet[8]
                },
                "gyro": {
                    "x": packet[9],
                    "y": packet[10],
                    "z": packet[11]
                },
                "calibration": {
                    "system": packet[12],
                    "accel": packet[13],
                    "gyro": packet[14],
                    "mag": packet[15]
                },
                "RSSI": packet[16]
            }

            requests.post(URL, json=_json)

    time.sleep(3)
