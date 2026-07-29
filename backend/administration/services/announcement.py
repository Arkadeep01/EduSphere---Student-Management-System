from administration.models.announcement import PublicAnnouncement


class PublicAnnouncementService:
    @staticmethod
    def list_all():
        return PublicAnnouncement.objects.all().order_by("-published_at", "-created_at")

    @staticmethod
    def list_active():
        return PublicAnnouncement.objects.filter(is_active=True).order_by("-published_at", "-created_at")

    @staticmethod
    def get(announcement_id):
        return PublicAnnouncement.objects.get(id=announcement_id)

    @staticmethod
    def create(data):
        return PublicAnnouncement.objects.create(**data)

    @staticmethod
    def update(announcement_id, data):
        obj = PublicAnnouncement.objects.get(id=announcement_id)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.save()
        return obj

    @staticmethod
    def delete(announcement_id):
        obj = PublicAnnouncement.objects.get(id=announcement_id)
        obj.delete()
