import os
import glob
import pandas as pd
import gc

#change folder to where the csv files are
os.chdir("C:\\Users\\Daniele\\Desktop\\historical_data")


#match all csv files in the folder
files = glob.glob("*.csv")

#name of my hdf5
hdf_path = 'cleaning_store.h5'

COLNAMES = ['Timestamp', 'Line_ID', 'Direction', 'Journey_Pattern_ID',
            'Time_Frame', 'Vehicle_Journey_ID', 'Bus_Operator', 'Congestion',
            'Longitude', 'Latitude', 'Delay_seconds', 'Block_ID',
            'Vehicle_ID', 'Stop_ID', 'At_Stop']

COLTYPES = {
    
    'Timestamp' : 'int64',
    'Line_ID' : 'object',
    'Direction' : 'int32',
    'Journey_Pattern_ID' : 'object',
    'Time_Frame' : 'object',
    'Vehicle_Journey_ID' : 'object',
    'Bus_Operator' : 'object',
    'Congestion' : 'int32',
    'Longitude' : 'float64',
    'Latitude' : 'float64',
    'Delay_seconds' : 'int32',
    'Block_ID' : 'object',
    'Vehicle_ID' : 'object',
    'Stop_ID' : 'object',
    'At_Stop' : 'int32'
    }



with pd.HDFStore(hdf_path, mode='w', complevel=5, complib='blosc') as store:
    # This compresses the final file by 5 using blosc. You can avoid that or
    # change it as per your needs.
    for filename in files:
        #cleaning part
        df = pd.read_csv(filename, names=COLNAMES, usecols=[0,3,4,5,6,8,9,10,11,12,13,14], dtype=COLTYPES)
        
        df = df[df.At_Stop == 1]
        df.drop("At_Stop", inplace=True, axis=1)
        
        df.Timestamp = df.Timestamp//1000000
        df.Timestamp = pd.to_datetime(df['Timestamp'], unit='s')
        
        df.Time_Frame = pd.to_datetime(df['Time_Frame'])
        
        df.dropna(inplace=True)
        df.drop_duplicates(inplace=True)
        
        df = df[df.Time_Frame != '2012-11-05']
        df = df[df.Time_Frame != '2013-02-01']
        
        df = df[df.Stop_ID != 'null']
        df = df[df.Journey_Pattern_ID != 'null']
        
        #0 is monday, 6 is sunday
        df['Week_Day'] = df['Time_Frame'].dt.dayofweek

        #appending cleaned file to hdf5
        store.append('table_name', df, index=False, data_columns = True)
        #deleting df reference and ask garbage collector to collect
        del df
        gc.collect()
    # Then create the indexes, if you need it
    #store.create_table_index('table_name', columns=["Week_Day"], optlevel=9, kind='full')