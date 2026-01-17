from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER=None,
)

async def send_verification_email(email: str, token: str, full_name: str):
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    message = MessageSchema(
        subject="Verify your Jonas account",
        recipients=[email],
        body=f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #E87A2E; font-size: 32px; margin: 0;">Jonas</h1>
                </div>
                <div style="background-color: #FDF6E9; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #1a1a1a; margin-top: 0;">Hi {full_name}!</h2>
                    <p style="color: #666;">Welcome to Jonas! Please verify your email address to complete your registration.</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" 
                           style="background-color: #E87A2E; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 25px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="{verification_url}" style="color: #E87A2E; word-break: break-all;">
                            {verification_url}
                        </a>
                    </p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        This link will expire in 24 hours.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """,
        subtype="html",
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)
