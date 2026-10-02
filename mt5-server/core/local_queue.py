import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
from loguru import logger
from config.settings import settings

class LocalQueue:
    """Buffer local persistente em SQLite para absorver instabilidades de rede com o backend."""
    
    def __init__(self):
        db_path = Path(settings.data_dir) / "offline_buffer.db"
        self.db_path = str(db_path)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS offline_buffer (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    endpoint TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    attempts INTEGER DEFAULT 0
                )
            """)
            conn.commit()

    def enqueue(self, endpoint: str, payload: Dict[str, Any]):
        """Adiciona um payload não entregue à fila de buffer offline"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO offline_buffer (endpoint, payload) VALUES (?, ?)",
                    (endpoint, json.dumps(payload))
                )
                conn.commit()
            logger.info(f"Payload enfileirado no buffer offline: {endpoint}")
        except Exception as e:
            logger.error(f"Erro ao salvar no buffer offline: {e}")

    def peek_batch(self, limit: int = 50) -> List[Tuple[int, str, Dict[str, Any]]]:
        """Obtém um lote de mensagens pendentes para reenvio"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, endpoint, payload FROM offline_buffer ORDER BY id ASC LIMIT ?",
                    (limit,)
                )
                rows = cursor.fetchall()
                result = []
                for row_id, endpoint, payload_str in rows:
                    result.append((row_id, endpoint, json.loads(payload_str)))
                return result
        except Exception as e:
            logger.error(f"Erro ao ler buffer offline: {e}")
            return []

    def remove(self, item_id: int):
        """Remove item processado com sucesso do buffer"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM offline_buffer WHERE id = ?", (item_id,))
                conn.commit()
        except Exception as e:
            logger.error(f"Erro ao remover item {item_id} do buffer: {e}")
