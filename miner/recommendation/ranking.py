

class RankingCalculator(object):

    @classmethod
    def calculate_ranking(cls, graph, repository_list, time, dtype):
        start_time = ""
        if dtype == "Daily":
            start_time = time.a_day_before().totime()
        elif dtype == "Weekly":
            start_time = time.a_week_before().totime()
        elif dtype == "Monthly":
            start_time = time.a_month_before().totime()
        end_time = time.totime()
        event_list = cls.fetch_event_list(graph, start_time, end_time)
        ranking = cls.calculate_ranking_with_event(event_list, repository_list)
        cls.flush_ranking(graph, ranking, end_time, dtype)

    @classmethod
    def calculate_ranking_with_event(cls, event_list, repository_list):
        def compare(repo1, repo2):
            if repo1["score"] < repo2["score"]:
                return -1
            else:
                return 1
        _ranking = {}
        for repo in repository_list:
            _ranking[repo] = 0
        for event in event_list:
            _ranking[event["rid"]] += event["score"]
        ranking = [{"id": rid, "score": _ranking[rid]} for rid in _ranking]
        ranking.sort(cmp = compare)
        for i in range(len(ranking)):
            ranking[i]["ranking"] = i + 1
        return ranking

    @classmethod
    def flush_ranking(cls, graph, ranking, time, dtype):

        def flush_ranking_batch(g, rk, t, dt):
            insert_ranking_command = "MATCH "
            cnt = 0
            first = True
            for item in rk:
                if not first:
                    insert_ranking_command += ","
                insert_ranking_command += "(r%d {repository_id: %d})" % (cnt, item["id"])
                cnt += 1
                first = False
            insert_ranking_command += " MERGE (rk:Ranking {created_at: %d}) CREATE UNIQUE " % t
            first = True
            cnt = 0
            for item in rk:
                if not first:
                    insert_ranking_command += ","
                insert_ranking_command += "(rk)-[:%s {ranking: %d}]->(r%d)" % (dt, item["ranking"], cnt)
                cnt += 1
                first = False
            print insert_ranking_command
            g.run(insert_ranking_command)

        batch_size = 100
        index = 0
        while index < 1 and index * batch_size < len(ranking):
            if index + 1 * batch_size > len(ranking):
                batch = ranking[index * batch_size:]
            else:
                batch = ranking[index * batch_size: (index + 1) * batch_size]
            flush_ranking_batch(g = graph, rk = batch, t = time, dt = dtype)
            index += 1

    @classmethod
    def fetch_event_list(cls, graph, start_time, end_time):
        event_logs = []
        query = "MATCH (u:User)-[a]-(r:Repository) WHERE a.created_at >= %d AND a.created_at <= %d RETURN u.user_id AS uid, {Contribute: 5, Membership: 1, Star: 2, Issue: 3, Fork: 4}[a.type] AS score,r.repository_id AS rid" % (start_time, end_time)
        event_logs += graph.run(query).data()
        return event_logs


