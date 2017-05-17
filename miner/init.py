from py2neo import Graph
import csv

graph = Graph("http://localhost:7474", user = "github", password = "github")

repository_data = []

with open("./tmp/repositories.csv", 'r') as csv_input:
    reader = csv.reader(csv_input, delimiter = ",")
    header = None
    for row in reader:
        if header is None:
            header = row
        else:
            repository_data.append({
                "repository_id": row[0],
                "name": row[1],
                "stargazers_count": int(row[2])
            })


def construct_query(batch):
    query = "CREATE "
    first = True
    for item in batch:
        if not first:
            query += ","
        query += "(:Repository {repository_id: '%s', name: '%s', stargazers_count: %d})" \
                 % (item["repository_id"], item["name"], item["stargazers_count"])
        first = False
    return query

batch = []
batch_size = 100
for i in range(len(repository_data)):
    batch.append(repository_data[i])
    if i % batch_size == 0 or i == len(repository_data) - 1:
        graph.run(construct_query(batch))
        batch = []
        print i
