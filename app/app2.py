import json
from flask import Flask, render_template
from flask_cors import CORS
from app.model import get_travel_time
from app.database import Db


app = Flask(__name__)
# Enable Cross Origin Resource Sharing
CORS(app)


@app.route('/')
def main():
    """ displays the index page accessible at '/' """

    return render_template("index.html", title="Home", heading="Dublin Bus")


@app.route('/_getRoutes', methods=['GET'])
def get_routes():
    """ For getting list of Journey Pattern ID's at startup """

    return Db().get_line_ids()


@app.route('/_getStartEndAddresses/<lineid>', methods=['GET'])
def get_start_end_addresses(lineid):
    """ For getting list of Journey Pattern ID's at startup """

    return Db().get_first_and_last_address(lineid)


@app.route('/_preference/<pref>/<jpid>', methods=['GET'])
def get_preference(pref, jpid):
    """ For getting list of stops/addresses for a route """

    if pref == "address":
        return Db().get_addresses(jpid)
    else:
        return Db().get_stop_id(jpid)
    

@app.route('/best_route/<srcLat>/<srcLon>/<destLat>/<destLon>', methods=['GET'])
def possible_routes(srcLat, srcLon, destLat, destLon):
    
    """
    getting all possible routes, from best to worst from point A to point B
    """
    return Db().get_best_route(srcLat, srcLon, destLat, destLon)


@app.route('/gps_coords/<jpid>', methods=['GET'])
def retrieve_gps(jpid):
    """
    Retrieves gps coordinates of a given journey pattern id
    """
    return Db().get_gps(jpid)


@app.route('/_getTravelTime/<lineId>/<source>/<destination>/<time>/<rain>', methods=['GET'])
def get_travel_time(lineId, source, destination, time, rain):
    """ Get estimated travel time """

    distances = Db().get_distance(source, destination)
    model_query = [lineId, distances[0], distances[1], time, rain]
    travel_time = get_travel_time(model_query)

    return json.dumps(travel_time)

if __name__ == "__main__":
    app.run(debug=True)
