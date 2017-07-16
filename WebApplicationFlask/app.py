import json

from flask import Flask, render_template
from flask_cors import CORS

from model import get_model_prediction
from database import Db


app = Flask(__name__)
# Enable Cross Origin Resource Sharing
CORS(app)


@app.route('/')
def main():
    """ displays the index page accessible at '/' """

    return render_template("index.html", title="Home", heading="Dublin Bus")


@app.route('/_sign_up/<routeId>/<source>/<destination>/<now>/<date>/<time>', methods=['GET'])
def get_travel_time(routeId, source, destination, now, date, time):
    """ For getting response from model after user query """

    # Convert Stops to Distances
    distances = Db().get_distances(source, destination)
    query = [routeId, distances[0], distances[1], now, date, time]

    # Use model to predict travel time of query
    travel_time = get_model_prediction(query)

    return json.dumps(travel_time)


if __name__ == "__main__":
    app.run(debug=True)
