from utils.repositories import fetch_accepted_repository_list
from utils.Time import Time
from py2neo import Graph
from recommendation.ranking import RankingCalculator

g = Graph("http://localhost:7474", user = "neo4j", password = "github")

ar = fetch_accepted_repository_list(g)

RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = 2017, month = 5, day = 1, hour = 0), dtype = "Daily")
RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = 2017, month = 5, day = 1, hour = 0), dtype = "Weekly")
RankingCalculator.calculate_ranking(g, repository_list = ar, time = Time(year = 2017, month = 5, day = 1, hour = 0), dtype = "Monthly")
