from py2neo import Graph


graph = Graph("http://localhost:7474", user = "github", password = "github")

repository_data = []

with open("./tmp/repositories.txt", 'r') as data_input:
    lines = data_input.readlines()
    inputs = [line.split("-=-=-=") for line in lines]
    for item in inputs:
        repository_data.append({
            "repository_id": item[0],
            "name": item[1],
            "description": item[2],
            "stargazers_count": int(item[3]),
            "watchers_count": int(item[4]),
            "forks_count": int(item[5]),
            "open_issues_count": int(item[6])
        })

def construct_query(batch):
    cnt = 0
    query = "MATCH "
    first = True
    for item in batch:
        if not first:
            query += ","
        query += "(r%d:Repository {repository_id: '%s'})" % (cnt, item["repository_id"])
        cnt += 1
        first = False
    cnt = 0
    first = True
    query += " SET "
    for item in batch:
        if not first:
            query += ","
        query += "r%d.description='%s',r%d.watchers_count=%d,r%d.forks_count=%d,r%d.open_issues_count=%d" \
                 % (cnt, item["description"].replace("'", "\\'"), cnt, item["watchers_count"], cnt, item["forks_count"], cnt, item["open_issues_count"])
        first = False
        cnt += 1
    return query

batch = []
batch_size = 100
for i in range(len(repository_data)):
    batch.append(repository_data[i])
    if i % batch_size == 0 or i == len(repository_data) - 1:
        print construct_query(batch)
        graph.run(construct_query(batch))
        batch = []
        print i
