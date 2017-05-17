from py2neo.ogm import GraphObject, Property, RelatedFrom, Related


class Repository(GraphObject):

    __primarykey__ = "name"

    stargazers_count = Property()
    repositoryId = Property()
    name = Property()

    stargazers = RelatedFrom("User", "Star")
    contributors = RelatedFrom("User", "Contribute")
    questioners = RelatedFrom("User", "Issue")
    forks = RelatedFrom("User", "Fork")

    topics = Related("Topic", "Have")
    languages = Related("Language", "Use")