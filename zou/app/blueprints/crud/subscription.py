from zou.app.models.subscription import Subscription

from .base import BaseModelResource, BaseModelsResource


class SubscriptionsResource(BaseModelsResource):
    def __init__(self):
        BaseModelsResource.__init__(self, Subscription)


class SubscriptionResource(BaseModelResource):
    def __init__(self):
        BaseModelResource.__init__(self, Subscription)
