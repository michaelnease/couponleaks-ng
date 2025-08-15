import json

def handler(event, context):
    field_name = event.get("info", {}).get("fieldName")
    arguments = event.get("arguments", {})

    if field_name == "getProfile":
        username = arguments.get("username")
        if not username:
            return None
        # Example: Allow both auth and unauth callers
        return {
            "username": f"FROM SERVER: {username}",
            "displayName": f"FROM SERVER: Display name for {username}",
            "bio": "FROM SERVER: This is a sample bio.",
            "website": "FROM SERVER: https://couponleaks.com"
        }

    return None
