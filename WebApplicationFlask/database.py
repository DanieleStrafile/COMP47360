import pymysql


class Db:

    def __init__(self):
        """ Connect to database """

        self.conn = pymysql.connect(host='busthesisproject.cun91scffwzf.eu-west-1.rds.amazonaws.com',
            user='bus_bus_go',
            password='summerproject9',
            db='busThesisProject',
            charset='utf8',)

    def close(self):
        """ Close connection """

        self.conn.close()

    def get_distances(self, source, destination):
        """ Retrun distances of Stop ID's """

        answer = list()

        c = self.conn.cursor()
        query = "SELECT Distance FROM JourneyPatternID_StopID WHERE Journey_Pattern_ID = '00010001' AND Stop_ID = '" + str(source) + "';"
        c.execute(query)

        for row in c:
            answer.append(row[0])

        query = "SELECT Distance FROM busThesisProject.JourneyPatternID_StopID WHERE Journey_Pattern_ID = '00010001' AND Stop_ID = '" + str(destination) + "';"
        c.execute(query)
        self.close()

        for row in c:
            answer.append(row[0])

        return answer

