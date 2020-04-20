from random import randint, uniform
from time import sleep
import requests as r
import json

def rn():
    return randint(0, 10000) / 10000

def main():
#    endpoint = "http://208.118.126.178:8792/in" 
    endpoint = "http://localhost:3000/in"
    
    Lat = Lat1 = 51.13234
    Lng = Lng1 = -114.4243

    while True:
        # construct data
        data = {
            "lat": Lat,
            "lng": Lng,
            "alt": randint(1000, 2000),
            "acceleration": {
                "x": randint(0, 10),
                "y": randint(0, 10),
                "z": randint(0, 10)
            },
            "orientation": {
                "x": randint(0, 10),
                "y": randint(0, 10),
                "z": randint(0, 10)
            },
            "gyro": {
                "x": randint(0, 10),
                "y": randint(0, 10),
                "z": randint(0, 10)
            },
            "calibration": {
                "sys": randint(0, 3),
                "gyro": randint(0, 3), 
                "mag": randint(0, 3),
                "accel": randint(0, 3)
            },
            "RSSI": randint(40, 130) * -1,
            "lastNodeName": "Mobile Node",
            "receiver": {
                "lat": Lat1,
                "lng": Lng1 
            }
        }

        Lat += rn()
        Lng += rn()
        Lat1 += rn()
        Lng1 += rn()

        # post data
        response = r.post(
            url = endpoint,
            json = data
        )
        
        print("sent data")
        print(response.text)

        sleep(5)

if __name__ == "__main__":
    main()

