from random import randint, uniform
from time import sleep
import requests as r

def main():
    endpoint = "http://localhost:3000/in"

    lat = randint(44*100, 55*100) / 100
    lng = randint(-110*100, -70*100) / 100
    alt = randint(1000, 2000)
    gps_quality = 1
    horizontal_dil = 1.2 # horizontal dilution of precision

    print(lat, lng)

    while True:
        # construct data
        data = {
            "latitude": lat,
            "longitude": lng,
            "altitude": alt,
            "gps_quality": gps_quality,
            "hdop": horizontal_dil
        }

        # post data
        response = r.post(
            url = endpoint,
            data = data
        )

        # randomize data
        lat += randint(0, 100) / 100
        lat %= 90

        lng += randint(0, 100) / 100
        lng %= 90

        alt += randint(0, 15) 
        gps_quality += randint(1, 4)
        horizontal_dil += randint(-10, 10) / 10

        sleep(5)

if __name__ == "__main__":
    main()
