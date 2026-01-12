"""
Database connections for SQL Server and MongoDB
"""
import pymssql
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
import logging

from config import settings, get_pymssql_config

logger = logging.getLogger(__name__)

# MongoDB client
mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db = None

# SQL Server connection status
sql_connected = False


async def connect_mongodb():
    """Connect to MongoDB"""
    global mongo_client, mongo_db
    try:
        mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
        mongo_db = mongo_client[settings.MONGODB_DATABASE]
        # Test connection
        await mongo_client.admin.command('ping')
        logger.info("MongoDB connected successfully")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False


async def close_mongodb():
    """Close MongoDB connection"""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")


def get_mongodb():
    """Get MongoDB database instance"""
    return mongo_db


@contextmanager
def get_sql_connection():
    """Get SQL Server connection using context manager"""
    global sql_connected
    conn = None
    try:
        config = get_pymssql_config()
        conn = pymssql.connect(**config)
        sql_connected = True
        yield conn
    except Exception as e:
        sql_connected = False
        logger.error(f"SQL Server connection failed: {e}")
        raise
    finally:
        if conn:
            conn.close()


def test_sql_connection() -> bool:
    """Test SQL Server connection"""
    global sql_connected
    try:
        with get_sql_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            sql_connected = True
            logger.info("SQL Server connected successfully")
            return True
    except Exception as e:
        sql_connected = False
        logger.error(f"SQL Server connection test failed: {e}")
        return False


def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute SQL query and return results as list of dicts"""
    try:
        with get_sql_connection() as conn:
            cursor = conn.cursor(as_dict=True)
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            results = cursor.fetchall()
            return results
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        raise


def execute_non_query(query: str, params: tuple = None) -> int:
    """Execute SQL query without returning results (INSERT, UPDATE, DELETE)"""
    try:
        with get_sql_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
            return cursor.rowcount
    except Exception as e:
        logger.error(f"Non-query execution failed: {e}")
        raise


def is_sql_connected() -> bool:
    """Check if SQL Server is connected"""
    return sql_connected


def is_mongo_connected() -> bool:
    """Check if MongoDB is connected"""
    return mongo_client is not None and mongo_db is not None
