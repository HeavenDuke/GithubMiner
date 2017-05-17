import wget
import gzip
import time as t
import json
import fileinput
import os


class Meta(object):
    base_url = "http://data.githubarchive.org/{year}-{month}-{day}-{hour}.json.gz"
    base_output = "./tmp/{year}-{month}-{day}-{hour}.json"

    @classmethod
    def construct(cls, year, month, day, hour):
        url = cls.base_url
        out = cls.base_output
        url = url.replace("{year}", str(year))
        url = url.replace("{month}", str(month))
        url = url.replace("{day}", str(day))
        url = url.replace("{hour}", str(hour))
        out = out.replace("{year}", str(year))
        out = out.replace("{month}", str(month))
        out = out.replace("{day}", str(day))
        out = out.replace("{hour}", str(hour))
        return {"url": url, "out": out, "compressed": out + ".gz"}


class PackageRequester(object):
    @classmethod
    def fetch_package(cls, url, output = None):
        wget.download(url = url, out = output)


class Unzip(object):
    @classmethod
    def unzip(cls, path, output):
        g = gzip.GzipFile(filename = path, mode = "rb")
        f = open(output, "wb")
        f.write(g.read())
        g.close()
        f.close()


class Transformer(object):
    def __init__(self):
        pass

    @classmethod
    def transform(cls, graph, data, ar = ()):
        for item in data.data:
            if item["type"] == "MemberEvent":
                if cls.is_legal_event(item, ar):
                    cls.parse_membership(data, item)
                else:
                    pass
            elif item["type"] == "WatchEvent":
                if cls.is_legal_event(item, ar):
                    cls.parse_star(data, item)
                else:
                    pass
            elif item["type"] == "ForkEvent":
                if cls.is_legal_event(item, ar):
                    cls.parse_fork(data, item)
                else:
                    pass
            elif item["type"] in ["PullRequestEvent", "PushEvent"]:
                if cls.is_legal_event(item, ar):
                    cls.parse_contribute(data, item)
                else:
                    pass
            elif item["type"] in ["IssuesEvent", "IssueCommentEvent"]:
                if cls.is_legal_event(item, ar):
                    cls.parse_issue(data, item)
                else:
                    pass
        cls.flush(graph, data)

    @classmethod
    def is_legal_event(cls, event, ar = ()):
        return event["repo"]["id"] in ar

    @classmethod
    def parse_membership(cls, data, item):
        cls.upsert_user(data, item["actor"])
        cls.upsert_relationship(data, item["actor"], item["repo"], "Membership", item["created_at"])
        return item["repo"], item["actor"]

    @classmethod
    def parse_fork(cls, data, item):
        cls.upsert_user(data, item["actor"])
        cls.upsert_relationship(data, item["actor"], item["repo"], "Fork", item["created_at"])
        return item["repo"], item["actor"]

    @classmethod
    def parse_star(cls, data, item):
        cls.upsert_user(data, item["actor"])
        cls.upsert_relationship(data, item["actor"], item["repo"], "Star", item["created_at"])
        return item["repo"], item["actor"]

    @classmethod
    def parse_issue(cls, data, item):
        cls.upsert_user(data, item["actor"])
        cls.upsert_relationship(data, item["actor"], item["repo"], "Issue", item["created_at"])
        return item["repo"], item["actor"]

    @classmethod
    def parse_contribute(cls, data, item):
        cls.upsert_user(data, item["actor"])
        cls.upsert_relationship(data, item["actor"], item["repo"], "Contribute", item["created_at"])
        return item["repo"], item["actor"]

    @classmethod
    def upsert_user(cls, data, user):
        if user["id"] not in data.related_data:
            data.related_data[user["id"]] = {
                "value": {
                    "login": user["login"],
                    "user_id": user["id"],
                    "avatar_url": user["avatar_url"]
                },
                "repositories": {}
            }

    @classmethod
    def upsert_relationship(cls, data, user, repository, label, time):
        _time = t.mktime(t.strptime(time, "%Y-%m-%dT%H:%M:%SZ"))
        _repo = data.related_data[user["id"]]["repositories"]
        if repository["id"] not in _repo:
            _repo[repository["id"]] = {}
        if label not in _repo[repository["id"]]:
            _repo[repository["id"]][label] = {}
        if _time not in _repo[repository["id"]][label]:
            _repo[repository["id"]][label][_time] = True

    @classmethod
    def flush(cls, graph, data):

        def flush_events(graph, user, repository, events):
            if len(events) == 0:
                return
            query = "MATCH (r:Repository {repository_id: %d})" % repository
            query += " MERGE (u:User {user_id: %d})" % user["user_id"]
            query += " SET u.login='%s', u.avatar_url='%s'" % (user["login"], user["avatar_url"])
            query += " CREATE UNIQUE "
            first = True
            for label in events:
                times = events[label]
                for time in times:
                    if not first:
                        query += ","
                    query += "(u)-[:%s {created_at: %d, type: '%s'}]->(r)" % (label, time, label)
                    first = False
            graph.run(query)

        for uid in data.related_data:
            repositories = data.related_data[uid]["repositories"]
            uvalue = data.related_data[uid]["value"]
            for rid in repositories:
                flush_events(graph = graph, user = uvalue, repository = rid, events = repositories[rid])


class EventData(object):
    def __init__(self, path):
        self.data = []
        self.related_data = {}

        if path is not None:
            for line in fileinput.input(path):
                if line != "":
                    d = json.loads(line)
                    self.data.append(d)
        else:
            raise IOError("file not exist!")


class EventCrawler(object):
    @classmethod
    def crawl(cls, time, graph, ar = ()):
        meta = Meta.construct(year = time.year, month = time.month, day = time.day, hour = time.hour)

        try:
            if not os.path.exists(meta["compressed"]):
                PackageRequester.fetch_package(url = meta["url"], output = meta["compressed"])

            if not os.path.exists(meta["out"]):
                Unzip.unzip(path = meta["compressed"], output = meta["out"])

            data = EventData(path = meta["out"])

            Transformer.transform(graph = graph, data = data, ar = ar)
        except:
            print "Unable to crawl event data at %s-%s-%s %s" % (time.year, time.month, time.day, time.hour)

        if os.path.exists(meta["compressed"]):
            os.remove(meta["compressed"])

        if os.path.exists(meta["out"]):
            os.remove(meta["out"])