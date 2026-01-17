from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import bcrypt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    truncated_password_bytes = password_bytes[:72]
    return bcrypt.checkpw(truncated_password_bytes, hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    truncated_password_bytes = password_bytes[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(truncated_password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

def generate_verification_token(email: str) -> str:
    return _serializer.dumps(email, salt='email-verification')

def verify_token(token: str, max_age: int = 3600 * 24) -> Optional[str]:
    try:
        email = _serializer.loads(token, salt='email-verification', max_age=max_age)
        return email
    except (BadSignature, SignatureExpired):
        return None
