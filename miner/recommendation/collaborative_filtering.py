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
        self.construct_user_list(graph = graph)
        self.construct_repo_list(graph = graph)
        self.data = lil_matrix((len(self.user_list.keys()), len(self.repository_list.keys())))
        self.score = lil_matrix((len(self.user_list.keys()), len(self.repository_list.keys())))
        self.similarity = lil_matrix((len(self.repository_list.keys()), len(self.repository_list.keys())))
        self.construct_score_matrix()
        self.calculate_similarity()
        self.calculate_rating()
        flag = self.select_db(mongo)
        self.flush_rating(mongo, flag)
        self.alter_db(mongo, flag)

    def construct_user_list(self, graph):
        query = "MATCH (u:User) RETURN u.user_id as user_id"
        user_list = graph.run(query).data()

        i = 0
        for item in user_list:
            if item["user_id"] not in self.user_list:
                self.user_list[item["user_id"]] = i
                i += 1

    def construct_repo_list(self, graph):
        query = "MATCH (r:Repository) RETURN r.repository_id as repository_id"
        repo_list = graph.run(query).data()

        i = 0
        for item in repo_list:
            if item["repository_id"] not in self.repository_list:
                self.repository_list[item["repository_id"]] = i
                i += 1

    def construct_event_log(self, graph):
        query = "MATCH (u:User)-[a:Star|Issue|Contribute|Membership|Fork]->(r:Repository) RETURN u.user_id AS user_id, {Star: 1, Issue: 2, Fork: 3, Contribute: 4, Membership: 5}[a.type] AS score,r.repository_id AS repository_id"
        self.event_logs += graph.run(query).data()

    def construct_score_matrix(self):
        for event in self.event_logs:
            self.data[self.user_list[event["user_id"]], self.repository_list[event["repository_id"]]] = max(event["score"], self.data[self.user_list[event["user_id"]], self.repository_list[event["repository_id"]]])

    def calculate_similarity(self):
        self.similarity = cosine_similarity(np.transpose(self.data), dense_output = False)

    def calculate_rating(self):
        self.score = self.data * preprocessing.normalize(self.similarity, norm = "l1", axis = 1)

    def select_db(self, mongo):

        db = mongo["githubminer"]
        collection = db["current_db"]

        mark = collection.find_one()
        print mark
        if mark:
            return 1 - mark["flag"]
        else:
            return 0

    def alter_db(self, mongo, flag):
        db = mongo["githubminer"]
        collection = db["current_db"]

        mark = collection.find_one()
        if not mark:
            collection.insert({"flag": 0})
        else:
            collection.replace_one(mark, {"flag": 1 - mark["flag"]})

    def flush_rating(self, mongo, flag):

        def compare(u1, u2):
            if u1["index"] < u2["index"]:
                return -1
            return 1

        db = mongo["githubminer"]
        collection = db["itemcf" + str(flag)]
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


g = Graph("http://localhost:7474", user = "neo4j", password = "github")
client = MongoClient("localhost", 27017)

UserRepositoryMatrixConstructor(graph = g, mongo = client)

