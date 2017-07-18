import pymysql
import json
import datetime


class Db:

    def __init__(self):
        """Connect to database"""

        self.conn = pymysql.connect(host='busthesisproject.cun91scffwzf.eu-west-1.rds.amazonaws.com',
            user='bus_bus_go',
            password='summerproject9',
            db='busthesisproject',
            charset='utf8')

    def close(self):
        """Close connection"""

        self.conn.close()

    def get_line_ids(self):
        """Query a list of all Line ID's"""

        pass

    def get_first_and_last_address(self, line_id):
        """Return the first and last address of both directions for a Line ID

        This must be the journey pattern id's which end in '001', anything else is sub-routes. We need this so the
        user can pick a direction and allow us to display the appropriate information."""

        pass

    def get_stop_id(self, line_id):
        """Get the stop ID's for a given line ID in a single direction

        When the user clicks a certain direction we must display options for source and destination
        stops. Here it is also important to distinguish between the main route and the sub routes so that
        we can inform the user if the particular bus they are taking will go to where they want (a sub route
        will not always go all the way). So return an object which allows easy access to the main and sub route
        information."""

        pass

    def get_addresses(self, line_id):
        """Get the addresses for a given line ID in a single direction

        When the user clicks a certain direction we must display options for source and destination
        stops. Here it is also important to distinguish between the main route and the sub routes so that
        we can inform the user if the particular bus they are taking will go to where they want (a sub route
        will not always go all the way). So return an object which allows easy access to the main and sub route
        information.

        This needs to return both Journey Pattern ID's for both directions also."""

        pass

    def get_distance(self, source, destination):
        """Returns the source and destination as distances"""

        pass

    def get_best_route(self, source, destination):
        """Returns the closest route to a source and destination GPS

        On Google maps we must display the best bus route for a person who queries with a source and destination
        GPS. It is possible that this query could return several options for best routes, but for now one is okay."""

        pass

    def get_gps(self, line_id):
        """Return the set of GPS coordinates for a given journey pattern id

        On Google maps when the user discovers the best bus route this query will return the full set of GPS
        coordinates for the route displaying it on the map alongside their source and destination icons."""