from random import randint, uniform
from time import sleep
import requests as r

def main():
    endpoint = "http://localhost:5000/in"

    lat = randint(4400, 5500) / 100
    lng = randint(-11500, -9000) / 100
    alt = randint(1000, 2000)
    gps_quality = 1
    horizontal_dil = 1.2 # horizontal dilution of precision

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
        lng += randint(0, 100) / 100
        alt += randint(0, 15) / 100
        gps_quality += randint(1, 4)
        horizontal_dil += randint(-10, 10) / 10

        sleep(5)


if __name__ == "__main__":
    main()
