import psutil
from datetime import datetime
from typing import List
from loguru import logger
from config.settings import settings
from models.schemas import WorkerHeartbeat
from .process_manager import MT5ProcessManager

class HealthMonitor:
    """Monitor de saúde do sistema, telemetria e integridade dos processos."""

    def __init__(self, process_manager: MT5ProcessManager):
        self.process_manager = process_manager

    def collect_telemetry(self, monitored_accounts: List[int]) -> WorkerHeartbeat:
        """Coleta uso de recursos da máquina Windows e status dos processos"""
        cpu_usage = psutil.cpu_percent(interval=None)
        mem_info = psutil.virtual_memory()

        active_terminals_count = sum(
            1 for acc_id in monitored_accounts if self.process_manager.is_running(acc_id)
        )

        return WorkerHeartbeat(
            workerId=settings.worker_id,
            cpuPercent=cpu_usage,
            memoryPercent=mem_info.percent,
            activeTerminals=active_terminals_count,
            monitoredAccounts=monitored_accounts,
            timestamp=datetime.utcnow(),
        )

    def check_and_recover_dead_terminals(self, monitored_accounts: List[int]) -> List[int]:
        """Identifica instâncias que caíram e precisam de reinicialização"""
        dead_accounts = []
        for acc_id in monitored_accounts:
            if not self.process_manager.is_running(acc_id):
                logger.warning(f"Watchdog detectou terminal inativo para conta {acc_id}!")
                dead_accounts.append(acc_id)
        return dead_accounts
