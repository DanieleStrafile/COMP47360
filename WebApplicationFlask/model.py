import datetime
import pickle


def get_model_prediction(query):
    """ Takes in a user's query and returns the model's predictions """

    # If the user selected 'now' for the date/time
    if query[3] == "on":
        query[5], query[4] = get_time()

    journey_pattern_id = query[0]
    source = query[1]
    destination = query[2]
    weekday = query[4]
    time_category = query[5]

    query_1 = [journey_pattern_id, source, weekday, time_category]
    query_2 = [journey_pattern_id, destination, weekday, time_category]

    answer = predict(query_2) - predict(query_1)

    return answer


def predict(query):
    """ Get model prediction for travel time """

    # Pickle model here and predict

    return 50


def get_time():
    """ To bin current time into category for model """

    now = datetime.datetime.today()
    # Int representing weekday
    day = now.weekday()
    # Return current time of day in list format [hour, minutes]
    time = (str(now.time())[:5]).split(":")

    if int(time[1]) >= 30:
        minutes = "30"
    else:
        minutes = "00"

    time_category = str(time[0] + ":" + minutes)

    return time_category, day


