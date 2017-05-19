from utils.repositories import fetch_accepted_repository_list
from utils.Time import Time
from py2neo import Graph
from recommendation.ranking import RankingCalculator
import sys

connection = sys.argv[1]
username = sys.argv[2]
password = sys.argv[3]
year = int(sys.argv[4])
month = int(sys.argv[5])
day = int(sys.argv[6])
hour = 0

g = Graph(connection, user = username, password = password)

ar = fetch_accepted_repository_list(g)

RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = year, month = month, day = day, hour = hour), dtype = "Daily")
RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = year, month = month, day = day, hour = hour), dtype = "Weekly")
RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = year, month = month, day = day, hour = hour), dtype = "Monthly")
