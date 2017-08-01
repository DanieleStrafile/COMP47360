#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"~/COMP47360/FlaskApp/")

from FlaskApp import app as application
application.secret_key = 'summerproject9'