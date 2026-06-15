from administration.models.event import Event


class EventAdminService:
    @staticmethod
    def list_events():
        return Event.objects.all().order_by("-date")

    @staticmethod
    def create_event(data, user):
        event = Event.objects.create(**data, created_by=user)
        return event

    @staticmethod
    def update_event(event_id, data):
        event = Event.objects.get(id=event_id)
        for key, value in data.items():
            setattr(event, key, value)
        event.save()
        return event

    @staticmethod
    def update_status(event_id, status):
        event = Event.objects.get(id=event_id)
        event.status = status
        event.save()
        return event

    @staticmethod
    def delete_event(event_id):
        Event.objects.get(id=event_id).delete()
