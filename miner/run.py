from crawlers.event_crawler import EventCrawler
from utils.repositories import fetch_accepted_repository_list
from utils.Time import Time
from py2neo import Graph
import sys

connection = sys.argv[1]
username = sys.argv[2]
password = sys.argv[3]
year = int(sys.argv[4])
month = int(sys.argv[5])
day = int(sys.argv[6])
hour = int(sys.argv[7])

g = Graph(connection, user = username, password = password)

ar = fetch_accepted_repository_list(graph = g)

current = Time(year = year, month = month, day = day, hour = hour)
EventCrawler.crawl(time = current, graph = g, ar = ar)
