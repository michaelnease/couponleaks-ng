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
            "username": username,
            "displayName": f"Display name for {username}",
            "bio": "This is a sample bio.",
            "website": "https://couponleaks.com"
        }

    return None
