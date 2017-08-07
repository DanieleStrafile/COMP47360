import json
from flask import Flask, render_template
from flask_cors import CORS
from FlaskApp.database import Db
from FlaskApp.model import get_travel_time
import requests
from bs4 import BeautifulSoup
import re


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
    
    print('XXXXXXXXXXXXXXX')
    print(Db().get_selected_route_timetable(lineId))

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
    

@app.route('/best_route/<srcLat>/<srcLon>/<destLat>/<destLon>', methods=['GET'])
def possible_routes(srcLat, srcLon, destLat, destLon):
    """getting all possible routes, from best to worst from point A to point B"""

    return Db().get_best_route(srcLat, srcLon, destLat, destLon)


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
    
    return Db().get_bus_time(jpidTruncated, srcStop, destStop, hour, minute,sec, sourceTime, timeCat )


@app.route('/getPricing/<jpid>/<stop1>/<stop2>/<direction>')
def display_prices(jpid, stop1, stop2, direction):
    
    try:
        #get lineid and stop numbers of those stops
        df = Db().get_stop_numbers(jpid, stop1, stop2)
        lineid = df.loc[0,"Line_ID"]
        
        #convert upper cases to lower cases letter
        lineid = lineid.lower()
        
        stop_number1 = df.loc[0,"Stop_number"]
        stop_number1 = int(stop_number1) + 1
        stop_number2 = int(df.loc[1,"Stop_number"]) + 1
        
        try:
            #change direction parsing for url but sometimes o and I are switched
            #must account for this and try both ways
            if direction == '0' or direction == 0:
                direction = 'I'
            else:
                direction = 'O'
        
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber="+str(lineid)+"&direction="+str(direction)+"&board="+str(stop_number1)+"&alight="+str(stop_number2)

            return get_prices(article_url)
        
        except Exception as e: 
            if direction == '0' or direction == 0:
                direction = 'O'
            else:
                direction = 'I'
        
            article_url = "https://www.dublinbus.ie/Fare-Calculator/Fare-Calculator-Results/?routeNumber="+str(lineid)+"&direction="+str(direction)+"&board="+str(stop_number1)+"&alight="+str(stop_number2)

            return get_prices(article_url)
        
    except Exception as e:
        
        pass

#this is a helper method for function display_prices
def get_prices(article_url):
    
    #get table with prices from url
    page = requests.get(article_url)
    soup = BeautifulSoup(page.text,"html.parser")
    table = soup.find("div", class_="other-fares-display")
    rows = table.findChildren(['th', 'tr'])
    
    
    # we got the table with prices from url, now we need to organise it in a dictionary e.g. Adult prices : 2.4 Euros etc...
    count = 0
    dictionary = dict()

    for row in rows:
        cells = row.findChildren('td')
        for cell in cells:
            
            # we want to stop here, the next cell is None
            if count > 11:
                break
                
            value = cell.string.strip()
            
            
            #even rows, these are our key pairs in dictionary, ie labels
            if count % 2 == 0:
                
                key = value
                
            #uneven rows, these are our value pairs in dictionary, ie prices  
            else:
                
                value = re.findall(r'\d+', value)
                dictionary[key] = str(value[0]) + "."  + str(value[1]) + " Euros"
                
            count += 1
    
    #return the dictionary as a json object
    return json.dumps(dictionary)


if __name__ == "__main__":
    app.run(debug=True)
