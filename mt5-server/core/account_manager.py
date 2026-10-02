from typing import Dict, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from loguru import logger
from config.settings import settings

class AccountSession(BaseModel):
    account_id: int
    login: str
    server: str
    password: Optional[str] = None  # Mantido apenas em memória
    status: str = "INITIALIZING"     # INITIALIZING, ONLINE, SYNCING, FAILED, OFFLINE
    last_deal_ticket: int = 0
    last_sync_time: Optional[datetime] = None
    error_count: int = 0
    last_error: Optional[str] = None

class AccountManager:
    """Gerencia o ciclo de vida e estado das contas sob controle do worker (capacidade máxima de 10)."""

    def __init__(self):
        self.max_capacity = settings.max_accounts
        self.accounts: Dict[int, AccountSession] = {}

    def can_accept_account(self) -> bool:
        """Verifica se o worker ainda tem capacidade para gerenciar novas contas"""
        return len(self.accounts) < self.max_capacity

    def add_or_update_account(
        self,
        account_id: int,
        login: str,
        server: str,
        password: Optional[str] = None,
        last_deal_ticket: int = 0
    ) -> AccountSession:
        if account_id in self.accounts:
            acc = self.accounts[account_id]
            acc.login = login
            acc.server = server
            if password:
                acc.password = password
            if last_deal_ticket > acc.last_deal_ticket:
                acc.last_deal_ticket = last_deal_ticket
            return acc

        if not self.can_accept_account():
            raise RuntimeError(f"Capacidade máxima do worker atingida ({self.max_capacity} contas).")

        session = AccountSession(
            account_id=account_id,
            login=login,
            server=server,
            password=password,
            last_deal_ticket=last_deal_ticket
        )
        self.accounts[account_id] = session
        logger.info(f"Conta {account_id} ({login}@{server}) adicionada ao pool. Total: {len(self.accounts)}/{self.max_capacity}")
        return session

    def get_account(self, account_id: int) -> Optional[AccountSession]:
        return self.accounts.get(account_id)

    def remove_account(self, account_id: int):
        if account_id in self.accounts:
            self.accounts.pop(account_id)
            logger.info(f"Conta {account_id} removida do pool do worker. Total restante: {len(self.accounts)}")

    def get_active_account_ids(self) -> List[int]:
        return list(self.accounts.keys())

    def update_checkpoint(self, account_id: int, last_deal_ticket: int):
        acc = self.accounts.get(account_id)
        if acc:
            if last_deal_ticket > acc.last_deal_ticket:
                acc.last_deal_ticket = last_deal_ticket
            acc.last_sync_time = datetime.utcnow()
            acc.error_count = 0
            acc.last_error = None
            acc.status = "ONLINE"

    def mark_error(self, account_id: int, error_message: str):
        acc = self.accounts.get(account_id)
        if acc:
            acc.error_count += 1
            acc.last_error = error_message
            if acc.error_count >= 3:
                acc.status = "FAILED"
            else:
                acc.status = "OFFLINE"
