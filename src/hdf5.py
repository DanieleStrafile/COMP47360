
'''
Created on 15 Jun 2017

@author: Daniele
'''

import os
import glob
import pandas as pd
import numpy as np
#changes working directory - copy paste the location of csv files (have to be in the same folder)
os.chdir("C:/Users/Daniele/Desktop/historical_data/")

#match all csv files in folder
FILES = glob.glob("*.csv")
#name of the h5 file
HDF_PATH = 'store.h5'
#creating column names
COLNAMES = ['Timestamp', 'Line ID', 'Direction', 'Journey_Pattern_ID',
            'Time_Frame', 'Vehicle_Journey_ID', 'Bus_Operator', 'Congestion',
            'Longitude', 'Latitude', 'Delay_seconds', 'Block_ID',
            'Vehicle_ID', 'Stop_ID', 'At_Stop']
#initialising the column dtypes
TYPES = {'Timestamp' : int, 'Line ID' : float, 'Direction' : int,
         'Journey_Pattern_ID' : object, 'Time_Frame' : object,
         'Vehicle_Journey_ID' : int, 'Bus_Operator' : object,
         'Congestion' : int, 'Longitude' : float, 'Latitude' : float,
         'Delay_seconds' : int, 'Block_ID' : int, 'Vehicle_ID' : int,
         'Stop_ID' : object, 'At_Stop' :int}

#writing to the h5 file, incorporating all the csv files
with pd.HDFStore(HDF_PATH, mode='w', complevel=5, complib='blosc',
                 expectedrows=44455133, format='table') as store:
    # This compresses the final file by 5 using blosc. You can avoid that or
    # change it as per your needs.
    for filename in FILES:
        df = pd.read_csv(filename, sep=',', names=COLNAMES, dtype=TYPES)
        #replace nulls with NaN
        df.replace('null', np.nan)
        store.append('table_name', df, index=False)
    # Then create the indexes, if you need it
    store.create_table_index('table_name', columns=COLNAMES, optlevel=9, kind='full')
#close the h5 file, very important against memory leak
store.close()
