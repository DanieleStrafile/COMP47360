'''
Created on Jul 5, 2017

@author: Katherine
'''
import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.mssql.base import TINYINT
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.mysql.types import FLOAT, VARCHAR

def connect_db(URI, PORT, DB, USER, password_file):
    #rename this function to get_engine or something
    """Connects to the database"""
    try:
        fh = open(password_file)
        PASSWORD = fh.readline().strip()
        engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
        return engine
    except Exception as e:
        print("Error Type: ", type(e))
        print("Error Details: ", e)   

def write_to_address_table(data, filename):
    #filename not used here but want to use a callback in 
    #write to file... 
    engine = connect_db("busthesisproject.cun91scffwzf.eu-west-1.rds.amazonaws.com", "3306", "busThesisProject", "bus_bus_go", "password.txt")
    Session = sessionmaker(bind=engine)
    session = Session()
#below is whatever table and information we're trying to create
    for i in data:
#         try:
#             
#             #table items here
#             
#             session.add(#name of table)
#             session.commit()
# 
#         except Exception as e:
#             print("Error Type: ", type(e))
#             print("Error Details: ", e)
#             session.rollback()
#             continue
#     
#     session.close()
    engine.dispose()



def file_to_db(file, write_function):
    """ Helper function to write data from file to database"""
    try:
        with open(file, 'r') as obj:
            dataStr = json.load(obj)
            dataJson = json.loads(dataStr)
        write_function(dataJson, file)
    except Exception as e:
        print("Error Type: ", type(e))
        print("Error Details: ", e)