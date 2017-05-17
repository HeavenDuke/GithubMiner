
from crawlers.event_crawler import EventCrawler
from utils.repositories import fetch_accepted_repository_list
from utils.Time import Time
from py2neo import Graph

graph = Graph("http://localhost:7474", user = "neo4j", password = "github")

ar = fetch_accepted_repository_list(graph)

current = Time(year = 2017, month = 4, day = 30, hour = 8)
while current != Time(year = 2017, month = 4, day = 28, hour = 23):
    print current.__dict__
    current = current.an_hour_before()
    EventCrawler.crawl(time = current, graph = graph, ar = ar)
