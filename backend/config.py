"""
Configuration for Stock Verify Backend
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    DEBUG: bool = True

    # SQL Server Configuration
    SQL_SERVER_HOST: str = "localhost"
    SQL_SERVER_PORT: int = 1433
    SQL_SERVER_DATABASE: str = "ERP_Database"
    SQL_SERVER_USER: str = "sa"
    SQL_SERVER_PASSWORD: str = "YourPassword123"
    SQL_SERVER_DRIVER: str = "ODBC Driver 17 for SQL Server"

    # MongoDB Configuration (for sessions/counts)
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "stock_verify"

    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Table names in SQL Server (customize based on your ERP)
    ITEMS_TABLE: str = "Items"
    STOCK_TABLE: str = "Stock"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_sql_connection_string() -> str:
    """Generate SQL Server connection string"""
    return (
        f"DRIVER={{{settings.SQL_SERVER_DRIVER}}};"
        f"SERVER={settings.SQL_SERVER_HOST},{settings.SQL_SERVER_PORT};"
        f"DATABASE={settings.SQL_SERVER_DATABASE};"
        f"UID={settings.SQL_SERVER_USER};"
        f"PWD={settings.SQL_SERVER_PASSWORD};"
        f"TrustServerCertificate=yes;"
    )


def get_pymssql_config() -> dict:
    """Get pymssql connection config (alternative to pyodbc)"""
    return {
        "server": settings.SQL_SERVER_HOST,
        "port": settings.SQL_SERVER_PORT,
        "database": settings.SQL_SERVER_DATABASE,
        "user": settings.SQL_SERVER_USER,
        "password": settings.SQL_SERVER_PASSWORD,
    }
