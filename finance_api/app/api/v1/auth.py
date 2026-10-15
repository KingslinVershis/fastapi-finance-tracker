from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.rate_limiter import enforce_login_rate_limit
from app.models.user import User
from app.schemas.auth import LoginRequest, MessageResponse, RefreshTokenRequest, Token
from app.schemas.user import UserCreate
from app.services.auth import authenticate_user, create_user_tokens, refresh_tokens
from app.services.category import seed_default_categories
from app.services.user import create_user, get_user_by_email

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )
    seed_default_categories(db)
    user = create_user(db, user_in=user_in)
    return create_user_tokens(user.id)


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user_key = login_data.email.strip().lower()
    remaining, limit = enforce_login_rate_limit(user_key)
    rate_headers = {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
    }
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    user = authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer", **rate_headers},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is currently inactive.",
            headers=rate_headers,
        )
    return create_user_tokens(user.id)


@router.post("/login/form", response_model=Token, include_in_schema=True)
def login_form(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user_key = form_data.username.strip().lower()
    remaining, limit = enforce_login_rate_limit(user_key)
    rate_headers = {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
    }
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer", **rate_headers},
        )
    return create_user_tokens(user.id)


@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    tokens = refresh_tokens(db, request.refresh_token)
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return tokens


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    return MessageResponse(message="Successfully logged out.")