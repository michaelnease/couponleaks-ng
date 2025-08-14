def handler(event, context):
    """
    AppSync Lambda resolver: getProfile(username)
    Returns mock data for 'michaelnease' and 'shirleynease'.
    """
    profiles = {
        "michaelnease": {
            "username": "michaelnease",
            "displayName": "Michael Nease",
            "bio": "Founder of CouponLeaks. Loves coding and deals.",
            "website": "https://couponleaks.com",
        },
        "shirleynease": {
            "username": "shirleynease",
            "displayName": "Shirley Nease",
            "bio": "Avid shopper and coupon collector.",
            "website": "https://couponleaks.com",
        },
    }

    username = (event.get("arguments") or {}).get("username")
    return profiles.get(username)
