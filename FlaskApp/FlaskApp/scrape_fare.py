import json

from map_search import get_prices
from database import Db


def scrape_fare(jpid, stop1, stop2, direction):
    """Scapes the current live price information from leapcard"""

    try:
        # Get lineid and stop numbers of those stops
        df = Db().get_stop_numbers(jpid, stop1, stop2)
        lineid = df.loc[0, "Line_ID"]

        # Convert upper cases to lower cases letter
        lineid = lineid.lower()

        stop_number1 = df.loc[0, "Stop_number"]
        stop_number1 = int(stop_number1) + 1
        stop_number2 = int(df.loc[1, "Stop_number"]) + 1

        try:
            # Change direction parsing for url but sometimes o and I are switched
            # Must account for this and try both ways
            if direction == '0' or direction == 0:
                direction = 'I'
            else:
                direction = 'O'

            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=" + str(
                lineid) + "&direction=" + str(direction) + "&board=" + str(stop_number1) + "&alight=" + str(
                stop_number2)
            print(article_url)

            return json.dumps(get_prices(article_url))

        except Exception as e:
            if direction == '0' or direction == 0:
                direction = 'O'
            else:
                direction = 'I'

            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=" + str(
                lineid) + "&direction=" + str(direction) + "&board=" + str(stop_number1) + "&alight=" + str(
                stop_number2)
            print(article_url)

            return json.dumps(get_prices(article_url))

    except Exception as e:
        if stop_number2 - stop_number1 <= 3:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=1&direction=I&board=1&alight=3"

        elif stop_number2 - stop_number1 <= 13:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=1&direction=I&board=1&alight=13"

        else:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=1&direction=I&board=9&alight=20"

        return json.dumps(get_prices(article_url))
        pass
