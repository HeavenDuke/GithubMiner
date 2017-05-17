from py2neo.ogm import GraphObject, Property, Related


class Language(GraphObject):

    name = Property()

    repositories = Related("Repository", "Use")
