def handler(event, context):
    field = event.get("info", {}).get("fieldName")
    args = event.get("arguments") or {}

    if field == "getProfile":
        username = args.get("username")
        if not username:
            return None

        return {
            "username": f"{username}",
            "displayName": f"Display name for {username}",
            "bio": "This is a sample bio.",
            "website": "https://couponleaks.com",
            "secret": "Top secret for signed-in users only",
        }

    return None
