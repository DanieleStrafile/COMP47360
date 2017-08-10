'''
Created on 17 Jul 2017

@author: Daniele
'''

#query to select every unique line id
"""
sql1 = SELECT DISTINCT Line_ID FROM JPID_LineID_Start_End;
"""

#query to select start and end address of main JPID when given a more general JPID
#substitute "XXXXXXXXX" with your journey pattern id
"""
sql2 = SELECT j.Source_Stop_ID, j.Destination_Stop_ID
        FROM JPID_LineID_Start_End AS j
        WHERE j.Journey_Pattern_ID IN (SELECT x.Main_Journey_Pattern_ID 
                                            FROM JPID_LineID_Start_End AS x
                                            WHERE x.Journey_Pattern_ID = "XXXXXXXXX")
"""

#query to find end of journey in general (no matter whether it is a variation or not, if it is it is every easy to spot using python and tell
# the user)
#nb this is finding the short_address, if you want to find the long address just replace Short_Address with Address
#nb2, again, substitute "XXXXXXXXX" with your journey pattern id
"""
sql4 = SELECT s.Short_Address
        FROM Stop_ID_Address as s
        WHERE Stop_ID IN (SELECT j.Destination_Stop_ID
                            FROM JPID_LineID_Start_End as j
                            WHERE j.Journey_Pattern_ID = "XXXXXXXXX")

"""