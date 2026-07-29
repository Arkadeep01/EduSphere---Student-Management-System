from administration.models.faq import FAQ


class FAQService:
    @staticmethod
    def list_all():
        return FAQ.objects.all().order_by("order", "created_at")

    @staticmethod
    def list_active():
        return FAQ.objects.filter(is_active=True).order_by("order", "created_at")

    @staticmethod
    def get(faq_id):
        return FAQ.objects.get(id=faq_id)

    @staticmethod
    def create(data):
        return FAQ.objects.create(**data)

    @staticmethod
    def update(faq_id, data):
        obj = FAQ.objects.get(id=faq_id)
        for key, value in data.items():
            setattr(obj, key, value)
        obj.save()
        return obj

    @staticmethod
    def delete(faq_id):
        obj = FAQ.objects.get(id=faq_id)
        obj.delete()
