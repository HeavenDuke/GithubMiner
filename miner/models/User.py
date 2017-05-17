from py2neo.ogm import GraphObject, Property, RelatedFrom, RelatedTo


class User(GraphObject):

    __primarykey__ = "login"

    login = Property()
    avatar_url = Property()
    user_id = Property()

    followers = RelatedFrom("User", "Follow")
    followings = RelatedTo("User", "Follow")

    star = RelatedTo("Repository", "Star")
    member = RelatedTo("Repository", "Member")
    contribute = RelatedTo("Repository", "Contribute")
    issue = RelatedTo("Repository", "Issue")
    fork = RelatedTo("Repository", "Fork")
    own = RelatedTo("Repository", "Own")
