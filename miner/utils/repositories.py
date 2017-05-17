
def fetch_accepted_repository_list(graph):
    query = "MATCH (r:Repository) return r.repository_id as repository_id"
    repositories = graph.run(query).data()
    return [repository[u"repository_id"] for repository in repositories]