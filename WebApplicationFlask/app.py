from flask import Flask, render_template
from flask_cors import CORS
import json

from model import place_holder_func


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

    query = [routeId, source, destination, now, date, time]
    # Use model to predict travel time of query
    travel_time = place_holder_func(query)

    return json.dumps(travel_time)


if __name__ == "__main__":
    app.run(debug=True)
