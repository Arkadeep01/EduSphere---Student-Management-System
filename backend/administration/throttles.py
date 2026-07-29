from rest_framework.throttling import SimpleRateThrottle


class LoginRateThrottle(SimpleRateThrottle):
    scope = "login"

    def get_cache_key(self, request, view):
        email = ""
        if request.method == "POST":
            if request.content_type == "application/json":
                try:
                    import json
                    data = json.loads(request.body)
                    email = data.get("email", "")
                except (json.JSONDecodeError, AttributeError):
                    pass
            else:
                email = request.POST.get("email", "")
        ident = email or self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class UploadRateThrottle(SimpleRateThrottle):
    scope = "upload"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {"scope": self.scope, "ident": request.user.pk}
        return None
