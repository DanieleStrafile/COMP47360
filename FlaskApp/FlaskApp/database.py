import json
import pandas as pd

from flask import *
from sqlalchemy import *

from FlaskApp.db_info import *
import re


class Db:

    def __init__(self):
        """Connect to database"""

        self.conn = create_engine("mysql+mysqlconnector://{}:{}@{}:{}/{}".format(name, password, rds_host,
                                                                                 port, db_name), echo=True)

    def disconnect(self):
        """Close connection"""

        self.conn.close()

    def get_line_ids(self):
        """Query a list of all Line ID's"""
        
        self.sql1 = "SELECT DISTINCT Line_ID FROM JPID_LineID_Start_End;"
        self.rows = self.conn.execute(self.sql1).fetchall()

        return jsonify(lineids=[dict(row.items()) for row in self.rows])

    def get_first_and_last_address(self, line_id):
        """Return the first and last address of both directions for a Line ID

        This must be the journey pattern id's which end in '001', anything else is sub-routes. We need this so the
        user can pick a direction and allow us to display the appropriate information."""

        self.sql2 = """
        SELECT j.Source_Stop_ID, j.Destination_Stop_ID, j.Journey_Pattern_ID
        FROM JPID_LineID_Start_End AS j
        WHERE j.Journey_Pattern_ID IN (SELECT x.Main_Journey_Pattern_ID 
                                        FROM JPID_LineID_Start_End AS x
                                        WHERE x.Line_ID = %(number)s)
        """
        
        self.df = pd.read_sql_query(self.sql2, self.conn, params={"number": line_id})
        
        # Get the stop id and their short addresses
        self.sql10 = """
        SELECT s.Stop_ID, s.Short_Address FROM Stop_ID_Address as s;
        """
        self.df2 = pd.read_sql_query(self.sql10, self.conn)
        
        dictionary = dict(zip(self.df2.Stop_ID, self.df2.Short_Address))
        
        # Translate the source and stop destination ID in short addresses
        for index, row in self.df.iterrows():
            self.df.set_value(index, "Source_Stop_ID" , dictionary[row[0]])
            self.df.set_value(index, "Destination_Stop_ID" , dictionary[row[1]])
            
        return json.dumps(json.loads(self.df.to_json(orient='records')),ensure_ascii=False)

    def get_stop_id(self, jpid):
        """Get the stop ID's for a given line ID in a single direction

        When the user clicks a certain direction we must display options for source and destination
        stops. Here it is also important to distinguish between the main route and the sub routes so that
        we can inform the user if the particular bus they are taking will go to where they want (a sub route
        will not always go all the way). So return an object which allows easy access to the main and sub route
        information."""

        self.sql3 = """
        SELECT j.Stop_ID as Stop_info, j.Distance, j.Stop_ID
        FROM JourneyPatternID_StopID as j
        WHERE j.Journey_Pattern_ID = %(number)s
        ORDER BY j.Distance ASC
        """

        self.df = pd.read_sql_query(self.sql3, self.conn, params={"number": jpid})

        return json.dumps(json.loads(self.df.to_json(orient='index')),ensure_ascii=True).encode('latin-1')

    def get_addresses(self, jpid):
        """Get the addresses for a given line ID in a single direction

        When the user clicks a certain direction we must display options for source and destination
        stops. Here it is also important to distinguish between the main route and the sub routes so that
        we can inform the user if the particular bus they are taking will go to where they want (a sub route
        will not always go all the way). So return an object which allows easy access to the main and sub route
        information.

        This needs to return both Journey Pattern ID's for both directions also."""

        self.sql4 = """
        SELECT s.Stop_ID, j.Distance, s.Address as Stop_info
        FROM JourneyPatternID_StopID as j, Stop_ID_Address as s
        WHERE j.Journey_Pattern_ID = %(number)s AND j.Stop_ID = s.Stop_ID
        ORDER BY j.Distance ASC
        """

        self.df = pd.read_sql_query(self.sql4, self.conn, params={"number": jpid})

        return json.dumps(json.loads(self.df.to_json(orient='index')))

    def get_distance(self, jpid, source, destination):
        """Returns the source and destination as distances"""
        
        self.sql5 = """
        SELECT s.Stop_ID, j.Distance
        FROM JourneyPatternID_StopID AS j, Stop_ID_Address AS s
        WHERE (s.Stop_ID = %(source)s
                OR s.Stop_ID = %(destination)s) AND j.Stop_ID = s.Stop_ID AND j.Journey_Pattern_ID = %(jpid)s
        ORDER BY j.Distance ASC
        """
            
        self.df = pd.read_sql_query(self.sql5, self.conn, params={"jpid" : jpid, "source": source, "destination":destination })

        return self.df

    def get_best_route(self, source_lat, source_lon, destination_lat, destination_lon):
        """Returns the closest route to a source and destination GPS

        On Google maps we must display the best bus route for a person who queries with a source and destination
        GPS. It is possible that this query could return several options for best routes, but for now one is okay."""

        self.sql8 = """
        
        SELECT first_query.JPID_Source, first_query.STOP_ID_Source, first_query.Distance_Source,
            second_query.STOP_ID_Destination, second_query.Distance_Destination,

            MIN(ABS(first_query.Distance_Source - second_query.Distance_Destination)) as Minimum_Total_Walking

        FROM

            (SELECT j.Journey_Pattern_ID as JPID_Source, j.Stop_ID as STOP_ID_Source,
            ( 6371 * 
                ACOS( 
                    COS( RADIANS( s.Latitude ) ) * 
                    COS( RADIANS( %(source_lat)s ) ) * 
                    COS( RADIANS( %(source_lon)s ) - 
                    RADIANS( s.Longitude ) ) + 
                    SIN( RADIANS( s.Latitude  ) ) * 
                    SIN( RADIANS( %(source_lat)s) ) 
                ) 
            ) AS Distance_Source
            
            FROM JourneyPatternID_StopID as j, Stop_ID_Address as s
            WHERE j.Stop_ID = s.Stop_ID
            HAVING Distance_Source <= 1.0) as first_query

        INNER JOIN

            (SELECT j.Journey_Pattern_ID as JPID_Destination, j.Stop_ID as STOP_ID_Destination,
            ( 6371 * 
                ACOS( 
                    COS( RADIANS( s.Latitude ) ) * 
                    COS( RADIANS( %(destination_lat)s ) ) * 
                    COS( RADIANS( %(destination_lon)s ) - 
                    RADIANS( s.Longitude ) ) + 
                    SIN( RADIANS( s.Latitude  ) ) * 
                    SIN( RADIANS( %(destination_lat)s ) ) 
            ) 
            ) AS Distance_Destination
            
            FROM JourneyPatternID_StopID as j, Stop_ID_Address as s
            WHERE j.Stop_ID = s.Stop_ID
            HAVING Distance_Destination <= 1.0) as second_query

        ON first_query.JPID_Source = second_query.JPID_Destination
        GROUP BY JPID_Source
        ORDER BY Minimum_Total_Walking
        """
        
        self.df = pd.read_sql_query(self.sql8, self.conn, params={"source_lat" : source_lat, "source_lon" : source_lon, "destination_lat" : destination_lat,"destination_lon" : destination_lon })

        return json.dumps(json.loads(self.df.to_json(orient='index')))

    def get_gps(self, jpid):
        """Return the set of GPS coordinates for a given journey pattern id

        On Google maps when the user discovers the best bus route this query will return the full set of GPS
        coordinates for the route displaying it on the map alongside their source and destination icons."""
        
        sql7 = """
        SELECT s.Latitude, s.Longitude
        FROM JourneyPatternID_StopID as j, Stop_ID_Address as s
        WHERE j.Journey_Pattern_ID = %(number)s AND j.Stop_ID = s.Stop_ID
        ORDER BY CAST(j.Stop_number AS UNSIGNED) ASC
        """

        df = pd.read_sql_query(sql7, self.conn, params={"number": jpid})

        return json.dumps(json.loads(df.to_json(orient='records')))
    
    
    
    def get_bus_time(self, jpidTruncated, srcStop, destStop, hour, minute,sec, sourceTime, timeCat ):
        
        """
        Return time next bus is coming
        """
        
        #maketime takes as input (hour,min,sec) and outputs hour:min:sec
        
        self.sql9 = """
        SELECT j.Journey_Pattern_ID,
            ADDTIME(t.Time_no_date, SEC_TO_TIME(%(sourceTime)s)) AS Time_bus_arrives
        FROM Timetable as t, JourneyPatternID_StopID as j
        WHERE j.Journey_Pattern_ID LIKE %(jpidTruncated)s AND j.Journey_Pattern_ID = t.Journey_Pattern_ID 
            AND (j.Stop_ID = %(srcStop)s OR j.Stop_ID = %(destStop)s) AND t.Day_Cat = %(timeCat)s
            AND MAKETIME ( %(hour)s,%(minute)s,%(sec)s ) <= ADDTIME(t.Time_no_date, SEC_TO_TIME(%(sourceTime)s))
        ORDER BY TIMESTAMPDIFF(SECOND, ADDTIME(t.Time_no_date, SEC_TO_TIME(%(sourceTime)s)), MAKETIME ( %(hour)s,%(minute)s,%(sec)s ) ) DESC
        LIMIT 1
        """
    
        self.df = pd.read_sql_query(self.sql9, self.conn, params={"jpidTruncated" : jpidTruncated,
                                                                   "srcStop" : srcStop,
                                                                    "destStop" : destStop,
                                                                    "hour" : hour,
                                                                    "minute" : minute,
                                                                    "sec" : sec,
                                                                    "sourceTime" : sourceTime,
                                                                    "timeCat" : timeCat  })
        

        self.df.Time_bus_arrives = self.df.Time_bus_arrives.astype(str)
        # format string time_no_date
        #delete 0 days e.g. 0 days 10:40:00.000000000 will become 10:40:00.000000000
        self.df.Time_bus_arrives = self.df.Time_bus_arrives.apply(lambda x : re.sub('0 days ', '', x))
        
        #delete everything after and incuding .  e.g. 10:40:00.000000000 will become 10:40:00
        self.df.Time_bus_arrives = self.df.Time_bus_arrives.apply(lambda x : re.sub('\..*', '', x))
        print(self.df)

        return json.dumps(json.loads(self.df.to_json(orient='index')))
    
    def get_stop_numbers(self, jpid, stop1, stop2):
        
        self.sql11 = """
        
        SELECT jse.Line_ID, j.Stop_ID, j.Stop_number
        FROM JourneyPatternID_StopID as j, JPID_LineID_Start_End as jse
        WHERE (j.Stop_ID = %(stop1)s OR j.Stop_ID = %(stop2)s ) 
            AND j.Journey_Pattern_ID = %(jpid)s AND jse.Journey_Pattern_ID = j.Journey_Pattern_ID
        ORDER BY j.Stop_number ASC
        
        """
        
        self.df = pd.read_sql_query(self.sql11, self.conn, params={"jpid" : jpid,
                                                                   "stop1" : stop1,
                                                                    "stop2" : stop2
                                                                     })
        #no need to return json, we need to use the stop numbers to scrape the 
        return self.df
        
        
def myconverter(o):
    if isinstance(o, str):
        return o.__str__()      
