import pickle
import pandas as pd

from app.static.Data_Structures import timeCategoryToSpeed


def get_travel_time(journey_pattern_id, source, destination, date_time):
    """Takes in a user's query and returns the model's predictions"""

    # Get Day
    day = get_day(date_time)

    # Get Speed Category
    time_category = get_time_category(date_time)

    speed = timeCategoryToSpeed.time_cat[day][time_category]

    # Get model's predictions
    source_time = get_prediction(journey_pattern_id, source, speed, day)
    destination_time = get_prediction(journey_pattern_id, destination, speed, day)

    return [destination_time[0], source_time[0]]


def get_prediction(journey_pattern_id, distance, speed, day):
    """Return model's prediction"""

    query = {"Distance": [distance], "Fast": [0], "Medium": [0], "Slow": [0], "Sat": [0], "Sun": [0], "Mon-Fri": [0]}

    query[speed] = 1
    query[day] = 1

    df = pd.DataFrame(query)

    with open('static/Models/' + journey_pattern_id + '.sav', 'rb') as handle:
        lm = pickle.load(handle)
        prediction = lm.predict(df)

    return prediction


def get_time_category(date_time):
    """Get time category for speed value"""

    time_cat = date_time[16:21]
    mins = time_cat[3:]

    if int(mins) >= 30:
        ans = "30"
    else:
        ans = "00"

    return time_cat[:3] + ans


def get_day(date_time):
    """Return either Mon-Fri, Sat or Sun"""

    day = date_time[:3]

    if day == "Mon" or day == "Tue" or day == "Wed" or day == "Thu" or day == "Fri":
        day = "Mon-Fri"

    return day
