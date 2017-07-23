import pickle
import pandas as pd

from FlaskApp.static.Data_Structures import timeCategoryToSpeed


def get_travel_time(query):
    """Takes in a user's query and returns the model's predictions"""

    journey_pattern_id = query[0]
    source_distance = query[1]
    destination_distance = query[2]
    date_time = query[3]

    # Get Day
    day = get_day(date_time)

    # Get Speed Category
    speed = timeCategoryToSpeed[date_time]

    # Get model's predictions
    source_time = get_prediction(journey_pattern_id, source_distance, speed, day)
    destination_time = get_prediction(journey_pattern_id, destination_distance, speed, day)

    return destination_time - source_time


def get_prediction(journey_pattern_id, distance, speed, day):
    """Return model's prediction"""

    query = pd.DataFrame({"Distance": [distance], "Speed": [speed], "Day": [day]})

    with open('FlaskApp/static/Models/' + journey_pattern_id + '.pickle', 'rb') as handle:
        lm = pickle.load(handle)

        prediction = lm.predict(query)

    return prediction


def get_day(day):
    """Return either Mon-Fri, Sat or Sun"""

    return 0
