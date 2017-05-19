from py2neo import Graph
from pymongo import MongoClient
from recommendation.collaborative_filtering import UserRepositoryMatrixConstructor
import sys

connection = sys.argv[1]
username = sys.argv[2]
password = sys.argv[3]

g = Graph(connection, user = username, password = password)

client = MongoClient("localhost", 27017)

UserRepositoryMatrixConstructor(graph = g, mongo = client)
