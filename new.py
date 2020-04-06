from random import randint, uniform
from time import sleep
import requests as r
import json

def main():
    endpoint = "http://51.161.8.25/in"

    while True:
        # construct data
        data = {
            "lat": randint(44*100, 55*100) / 100,
            "lng": randint(-110*100, -70*100) / 100,
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
            "lastNodeName": "Mobile Node"
        }

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

