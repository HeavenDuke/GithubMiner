from py2neo.ogm import GraphObject, Property, Related


class Topic(GraphObject):

    name = Property()

    repositories = Related("Repository", "Have")
