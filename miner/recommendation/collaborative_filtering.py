from py2neo import Graph
from pymongo import MongoClient
from scipy.sparse import lil_matrix
from sklearn.metrics.pairwise import cosine_similarity
from sklearn import preprocessing
import numpy as np


class UserRepositoryMatrixConstructor(object):

    def __init__(self, graph, mongo):
        self.event_logs = []
        self.user_list = {}
        self.repository_list = {}
        self.construct_event_log(graph = graph)
        self.data = lil_matrix((len(self.user_list.keys()), len(self.repository_list.keys())))
        self.score = lil_matrix((len(self.user_list.keys()), len(self.repository_list.keys())))
        self.similarity = lil_matrix((len(self.repository_list.keys()), len(self.repository_list.keys())))
        self.construct_score_matrix()
        self.calculate_similarity()
        self.calculate_rating()
        self.flush_rating(mongo)

    def construct_event_log(self, graph):
        score = {
            "star": 1,
            "contribute": 1,
            "issue": 2,
            "membership": 1,
            "fork": 3,
        }
        query = "MATCH (u:User)-[a:Star]-(r:Repository) RETURN u.user_id AS user_id, %d AS score,r.repository_id AS repository_id" % (score["star"])
        self.event_logs += graph.run(query).data()
        query = "MATCH (u:User)-[a:Issue]-(r:Repository) RETURN u.user_id AS user_id, %d AS score,r.repository_id AS repository_id" % (score["issue"])
        self.event_logs += graph.run(query).data()
        query = "MATCH (u:User)-[a:Contribute]-(r:Repository) RETURN u.user_id AS user_id, %d AS score,r.repository_id AS repository_id" % (score["contribute"])
        self.event_logs += graph.run(query).data()
        query = "MATCH (u:User)-[a:Membership]-(r:Repository) RETURN u.user_id AS user_id, %d AS score,r.repository_id AS repository_id" % (score["membership"])
        self.event_logs += graph.run(query).data()
        query = "MATCH (u:User)-[a:Fork]-(r:Repository) RETURN u.user_id AS user_id, %d AS score,r.repository_id AS repository_id" % (score["fork"])
        self.event_logs += graph.run(query).data()

        i = 0
        for item in self.event_logs:
            if item["user_id"] not in self.user_list:
                self.user_list[item["user_id"]] = i
                i += 1
        i = 0
        for item in self.event_logs:
            if item["repository_id"] not in self.repository_list:
                self.repository_list[item["repository_id"]] = i
                i += 1

    def construct_score_matrix(self):
        for event in self.event_logs:
            self.data[self.user_list[event["user_id"]], self.repository_list[event["repository_id"]]] += event["score"]

    def calculate_similarity(self):
        self.similarity = cosine_similarity(np.transpose(self.data), dense_output = False)

    def calculate_rating(self):
        self.score = self.data * preprocessing.normalize(self.similarity, norm = "l1", axis = 1)

    def flush_rating(self, mongo):

        def compare(u1, u2):
            if u1["index"] < u2["index"]:
                return -1
            return 1

        db = mongo["githubminer"]
        collection = db["itemcf"]
        user_id_list = [{"user_id": key, "index": self.user_list[key]} for key in self.user_list]
        repository_id_list = [{"repository_id": key, "index": self.repository_list[key]} for key in self.repository_list]
        user_id_list.sort(compare)
        user_id_list = [item["user_id"] for item in user_id_list]
        repository_id_list.sort(compare)
        repository_id_list = [item["repository_id"] for item in repository_id_list]
        collection.remove()
        row, col = self.score.nonzero()
        size = len(row)
        docs = [{"user_id": user_id_list[row[i]], "repository_id": repository_id_list[col[i]], "score": self.score[row[i], col[i]]} for i in range(size)]
        collection.insert(docs)


g = Graph("http://localhost:7474", user = "github", password = "github")
client = MongoClient("localhost", 27017)

UserRepositoryMatrixConstructor(graph = g, mongo = client)

