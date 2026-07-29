from administration.models.leadership import Leadership


class LeadershipService:
    @staticmethod
    def list_all():
        return Leadership.objects.all().order_by("order", "created_at")

    @staticmethod
    def list_active():
        return Leadership.objects.filter(is_active=True).order_by("order", "created_at")

    @staticmethod
    def get(leader_id):
        return Leadership.objects.get(id=leader_id)

    @staticmethod
    def create(data):
        return Leadership.objects.create(**data)

    @staticmethod
    def update(leader_id, data):
        obj = Leadership.objects.get(id=leader_id)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.save()
        return obj

    @staticmethod
    def delete(leader_id):
        obj = Leadership.objects.get(id=leader_id)
        obj.delete()
