# lambdas/profiles/handler.py
import os
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('PROFILES_TABLE', 'Profiles-dev')
table = dynamodb.Table(TABLE_NAME)

STATIC_SECRET = 'shh-this-is-a-static-secret'

def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def get_profile(username: str):
    resp = table.get_item(Key={'username': username})
    item = resp.get('Item')
    if not item:
        return None
    item.setdefault('username', username)
    item['secret'] = STATIC_SECRET
    return item

def ensure_profile(username: str, caller_sub: str):
    """Create a minimal profile if it doesn't exist yet for this username."""
    try:
        table.put_item(
            Item={
                'username': username,
                'sub': caller_sub,
                'displayName': username,
                'displayNameLower': username.strip().lower(),
                'nameKey': (username[:1] or '#').lower(),
                'isFeaturedKey': '0',
                'createdAt': now_iso(),
                'updatedAt': now_iso(),
            },
            ConditionExpression='attribute_not_exists(username)'
        )
        return True
    except ClientError as e:
        # If it already exists, swallow only the conditional failure
        if e.response.get('Error', {}).get('Code') == 'ConditionalCheckFailedException':
            return False
        raise

def update_profile(username: str, caller_sub: str, patch: dict):
    allowed = ['displayName','website','bio','avatarUrl','isFeaturedKey']
    updates = {k: v for k, v in patch.items() if k in allowed and v is not None}

    if 'displayName' in updates:
        dl = updates['displayName'].strip().lower()
        updates['displayNameLower'] = dl
        updates['nameKey'] = dl[:1] or '#'

    updates['updatedAt'] = now_iso()

    expr_names, expr_values, sets = {}, {}, []
    for i, (k, v) in enumerate(updates.items(), start=1):
        expr_names[f"#k{i}"] = k
        expr_values[f":v{i}"] = v
        sets.append(f"#k{i} = :v{i}")
    update_expr = "SET " + ", ".join(sets)

    # First try: update only if the item exists AND belongs to caller
    try:
        res = table.update_item(
            Key={'username': username},
            UpdateExpression=update_expr,
            ConditionExpression=Attr('sub').eq(caller_sub),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
    except ClientError as e:
        code = e.response.get('Error', {}).get('Code')
        if code != 'ConditionalCheckFailedException':
            raise
        # Either item doesn't exist or sub mismatched. Try to create the minimal profile for this caller.
        created = ensure_profile(username, caller_sub)
        if not created:
            # Item exists but owned by someone else
            raise Exception('Forbidden: profile is owned by a different user')
        # Retry the update now that the item exists for this caller
        res = table.update_item(
            Key={'username': username},
            UpdateExpression=update_expr,
            ConditionExpression=Attr('sub').eq(caller_sub),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )

    item = res.get('Attributes') or {}
    item.setdefault('username', username)
    item['secret'] = STATIC_SECRET
    return item

def handler(event, context):
    field = event.get('info', {}).get('fieldName')
    args = event.get('arguments', {})
    identity = event.get('identity') or {}
    caller_sub = identity.get('sub') or (identity.get('claims') or {}).get('sub')
    caller_username = identity.get('username') or (identity.get('claims') or {}).get('username')

    if field == 'getProfile':
        username = args.get('username')
        if not username:
            raise Exception("username is required")
        return get_profile(username)

    if field == 'updateProfile':
        username = args.get('username')
        patch = args.get('input') or {}
        if not caller_sub:
            raise Exception("Unauthorized")
        # Optional extra safety: only allow updating the record that matches the caller's Cognito username
        if caller_username and caller_username != username:
            raise Exception("Forbidden: cannot update another user's profile")
        return update_profile(username, caller_sub, patch)

    return {'message': 'ok'}
