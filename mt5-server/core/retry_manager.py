import time
import random
from typing import Callable, Any, Optional
from loguru import logger

class RetryManager:
    """Gerencia retries com Exponential Backoff e Jitter"""

    @staticmethod
    def execute_with_retry(
        func: Callable[[], Any],
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 30.0,
        description: str = "Operação"
    ) -> Optional[Any]:
        attempt = 0
        while attempt < max_retries:
            try:
                return func()
            except Exception as e:
                attempt += 1
                if attempt >= max_retries:
                    logger.error(f"[{description}] Falhou definitivamente após {max_retries} tentativas: {e}")
                    raise e
                
                # Exponential backoff: base_delay * (2 ^ (attempt - 1)) + jitter
                delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
                jitter = random.uniform(0, 0.5 * delay)
                total_wait = delay + jitter
                logger.warning(f"[{description}] Falha na tentativa {attempt}/{max_retries}: {e}. Retentando em {total_wait:.2f}s...")
                time.sleep(total_wait)
        return None
