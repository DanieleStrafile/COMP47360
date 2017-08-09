import json

from flask import Flask, render_template
from flask_cors import CORS

from FlaskApp.database import Db
from FlaskApp.model import get_travel_time
from FlaskApp.map_search import get_three_best_routes, get_prices


app = Flask(__name__)
# Enable Cross Origin Resource Sharing
CORS(app)


@app.route('/')
def main():
    """Displays the index page accessible at '/'"""

    return render_template("index.html", title="Home", heading="Dublin Bus")


@app.route('/_getRoutes', methods=['GET'])
def get_routes():
    """ For getting list of Journey Pattern ID's at startup """

    return Db().get_line_ids()


@app.route('/_getRoutesTimetable', methods=['GET'])
def get_routesTimetable():
    """For getting list of journey id's for the timetable"""
    return Db().get_line_ids()


@app.route('/_getSelectedTimetable/<lineId>', methods=['GET'])
def get_selected_timetable(lineId):
    """for getting the timetable for the selected route"""
    
    return Db().get_selected_route_timetable(lineId)


@app.route('/_getStartEndAddresses/<lineId>', methods=['GET'])
def get_start_end_addresses(lineId):
    """For getting list of Journey Pattern ID's at startup"""

    return Db().get_first_and_last_address(lineId)


@app.route('/_preference/<pref>/<jpid>', methods=['GET'])
def get_preference(pref, jpid):
    """For getting list of stops/addresses for a route"""

    if pref == "address":
        return Db().get_addresses(jpid)
    else:
        return Db().get_stop_id(jpid)
    

@app.route('/best_route/<srcLat>/<srcLon>/<destLat>/<destLon>/<searchPreference>/<dateTime>', methods=['GET'])
def possible_routes(srcLat, srcLon, destLat, destLon, searchPreference, dateTime):
    """getting all possible routes, from best to worst from point A to point B"""

    dateTime = dateTime.split(",")

    routes = Db().get_best_route(srcLat, srcLon, destLat, destLon)
    try:
        best_routes = get_three_best_routes(routes, searchPreference, dateTime)
    except IndexError:
        best_routes = "No Journey Found"

    return json.dumps(best_routes)


@app.route('/gps_coords/<jpid>/<srcStop>/<destStop>', methods=['GET'])
def retrieve_gps(jpid, srcStop, destStop):
    """Retrieves gps coordinates of a given journey pattern id"""

    return Db().get_gps(jpid, srcStop, destStop)


@app.route('/_getTravelTime/<jpid>/<source>/<destination>/<dateTime>', methods=['GET'])
def get_model_answer(jpid, source, destination, dateTime):
    """Get estimated travel time"""

    distances = Db().get_distance(jpid, source, destination)
    travel_time = get_travel_time(jpid, distances.loc[0,"Distance"], distances.loc[1,"Distance"], dateTime)

    return json.dumps(travel_time)


@app.route('/get_bus_time/<jpidTruncated>/<srcStop>/<destStop>/<hour>/<minute>/<sec>/<sourceTime>/<timeCat>')
def get_bus_timetable(jpidTruncated, srcStop, destStop, hour, minute,sec, sourceTime, timeCat ):
    """Returns selected timetable Mon-Fri, Sat & Sun for selected route"""
    
    return Db().get_bus_time(jpidTruncated, srcStop, destStop, hour, minute,sec, sourceTime, timeCat)


@app.route('/getPricing/<jpid>/<stop1>/<stop2>/<direction>')
def display_prices(jpid, stop1, stop2, direction):
    """Scrapes Leap Card Travel Info Live From The Website for the app's final form"""
    
    try:
        # Get lineid and stop numbers of those stops
        df = Db().get_stop_numbers(jpid, stop1, stop2)
        lineid = df.loc[0, "Line_ID"]
        
        # Convert upper cases to lower cases letter
        lineid = lineid.lower()
        
        stop_number1 = df.loc[0,"Stop_number"]
        stop_number1 = int(stop_number1) + 1
        stop_number2 = int(df.loc[1,"Stop_number"]) + 1
        
        try:
            # Change direction parsing for url but sometimes o and I are switched
            # Must account for this and try both ways
            if direction == '0' or direction == 0:
                direction = 'I'
            else:
                direction = 'O'
        
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber="+str(lineid)+"&direction="+str(direction)+"&board="+str(stop_number1)+"&alight="+str(stop_number2)

            return json.dumps(get_prices(article_url))
        
        except Exception as e: 
            if direction == '0' or direction == 0:
                direction = 'O'
            else:
                direction = 'I'
        
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber="+str(lineid)+"&direction="+str(direction)+"&board="+str(stop_number1)+"&alight="+str(stop_number2)

            return json.dumps(get_prices(article_url))
        
    except Exception as e:
        if stop_number2 - stop_number1 <= 10:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=140&direction=I&board=0&alight=10"
        
        elif stop_number2 - stop_number1 <= 30:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=140&direction=I&board=0&alight=31"
        
        else:
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber=140&direction=I&board=9&alight=46"
        
        return json.dumps(get_prices(article_url))
        pass


if __name__ == "__main__":
    app.run(debug=True)
