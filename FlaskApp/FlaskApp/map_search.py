from FlaskApp.database import Db
from FlaskApp.model import get_travel_time


# --------------------------------------------------------------------------------------------------------------- #
def get_three_best_routes(data, search_pref, date_time):
    """Returns three JPID's based on search preference"""

    if search_pref == "searchByWalkingDistance":
        return get_three_routes_based_on_walking_distance(data)
    elif search_pref == "searchByFare":
        return get_three_routes_based_on_fare(data, date_time)
    else:
        return get_three_routes_based_on_arrival_time(data, date_time)


def sort_function(data):
    """Returns a 2d array sorted by the first column

    Needed to sort the list of journeys by price and arrival time later"""

    return sorted(data, key=lambda x: x[0])


# --------------------------------------------------------------------------------------------------------------- #
def get_three_routes_based_on_arrival_time(data, date_time):
    """Return three routes which arrive the soonest"""

    routes = list()

    for journey in data:

        jpid = journey.JPID_Source
        source = journey.STOP_ID_Source
        destination = journey.Stop_ID_Destination
        # Get the model's travel time predictions
        travel_times = get_distance_and_predict_with_model(jpid, source, destination, date_time)
        # The time the bus arrives HH:MM:SS
        time_bus_arrives = find_time_bus_arrives(travel_times, date_time, jpid, source, destination)

        routes.append([time_bus_arrives, jpid, source, destination])

    sort_function(routes)  # Sort it by the next to arrive

    return [routes[0], routes[1], routes[2]]


def find_time_bus_arrives(travel_times, date_time, jpid, source, destination):
    """Find the actual time the bus arrives"""

    time_to_source = travel_times[0]

    # For Apache???
    jpid_truncated = jpid[:-1] + "%25"
    time_cat = get_time_cat(date_time[1])

    data = Db().get_bus_time(jpid_truncated, source, destination, date_time[2], date_time[3],
                                                        date_time[4], time_to_source, time_cat)

    return data[0].Time_bus_arrives


def get_time_cat(day):
    """Returns the correct day (format-wise) for the model's features"""

    if day == 0:
        ans = "Sun"
    elif day == 6:
        ans = "Sat"
    else:
        ans = "Mon-Fri"

    return ans


def get_distance_and_predict_with_model(jpid, source, destination, date_time):
    """Get travel time of route"""

    distances = Db().get_distance(jpid, source, destination)

    travel_times = get_travel_time(jpid, distances.loc[0, "Distance"], distances.loc[1, "Distance"], date_time[0])

    return travel_times


# -------------------------------------------------------------------------------------------------------------- #
def get_three_routes_based_on_fare(mapData, dateTime):
    """Return the three most inexpensive routes"""
    pass
#
#     routes = [];
#
#     _.forEach(mapData, function(journey):
#
#         # Reference Global 'jpid' from script.js
#         jpid = journey.JPID_Source;
#         source = journey.STOP_ID_Source;
#         destination = journey.Stop_ID_Destination;
#
#         # Function from script.js
#         getPricing(jpid, source, destination, jpid.charAt(4))
#
#         routes.push([adultFare, jpid, source, destination])
#
#
#     routes.sort(sortFunction);
#
#     return [routes[0], routes[1], routes[2]];


# -------------------------------------------------------------------------------------------------------------- #
def get_three_routes_based_on_walking_distance(data):
    """Return the three closest routes"""

    # It's already ordered by total walking so just take first three routes
    routes = [[data[0].Minimum_Total_Walking, data[0].JPID_Source, data[0].STOP_ID_Source, data[0].STOP_ID_Destination ],
    [data[1].Minimum_Total_Walking, data[1].JPID_Source, data[1].STOP_ID_Source, data[1].STOP_ID_Destination],
    [data[2].Minimum_Total_Walking, data[2].JPID_Source, data[2].STOP_ID_Source, data[2].STOP_ID_Destination]]

    return routes
