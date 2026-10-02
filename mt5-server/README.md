# TorexJournal MT5 Server (Windows Worker Node)

Serviço autônomo em Python com a biblioteca oficial `MetaTrader5` para orquestração de terminais e sincronização incremental com o backend Linux do **Torex Journal**.

## 📌 Principais Recursos

- **Até 10 Contas Simultâneas**: Isolamento de processos MT5 em modo portátil (`/portable`) por diretório dedicado.
- **Segurança de Credenciais**: Resgate sob demanda com token temporário de uso único (`credentialToken`), sem transmissão de senhas em texto puro no polling.
- **Sincronização Incremental Rigorosa**: Busca apenas novos `deals` a partir de `last_deal_ticket`, evitando duplicidade ou sobrecarga.
- **Watchdog & Auto-Recovery**: Detecta automaticamente quedas do terminal MT5 ou desconexão da corretora e reinicia o processo.
- **Buffer Offline Resiliente**: SQLite local (`offline_buffer.db`) retém payloads de sincronização caso a conexão com o backend oscile.
- **Telemetria Contínua**: Heartbeat com telemetria de CPU, RAM e integridade de instâncias ativas.

---

## 📂 Estrutura do Projeto

```
mt5-server/
├── api_client/             # Cliente HTTP para a API /api/v1/mt5-worker/ no NestJS
│   ├── __init__.py
│   └── client.py
├── config/                 # Configurações tipadas e carregamento de .env
│   ├── __init__.py
│   └── settings.py
├── core/                   # Núcleo operacional
│   ├── __init__.py
│   ├── account_manager.py  # Pool de até 10 contas ativas
│   ├── health_monitor.py   # Telemetria do sistema e watchdog de processos
│   ├── local_queue.py      # Buffer offline em SQLite
│   ├── process_manager.py  # Spawn e monitoramento de terminais terminal64.exe
│   ├── retry_manager.py    # Exponential Backoff com jitter
│   ├── sync_engine.py      # Extração incremental de Deals, Ordens e Posições (MetaTrader5)
│   └── worker_manager.py   # Orquestrador central de threads e loops
├── instances/              # Diretórios isolados por conta (criado em runtime)
├── models/                 # Schemas de dados Pydantic
│   ├── __init__.py
│   └── schemas.py
├── service/                # Script de instalação como Windows Service
│   └── register_service.bat
├── .env.example
├── main.py                 # Runner interativo / CLI
├── requirements.txt
└── README.md
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Windows 10/11 ou Windows Server (64-bit).
- Python 3.10+ (64-bit).
- MetaTrader 5 instalado (por padrão em `C:\Program Files\MetaTrader 5\terminal64.exe`).

### 2. Configuração do Ambiente Virtual

```powershell
cd "e:\TRADING COSSA\mt5-server"

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configuração do `.env`

Copie o `.env.example` para `.env`:
```powershell
copy .env.example .env
```
Ajuste os valores conforme o seu ambiente (URL do backend Linux, chave secreta do worker, caminho do terminal MT5).

### 4. Executar em Modo Console (Desenvolvimento/Testes)

```powershell
python main.py
```

### 5. Executar como Serviço do Windows (Produção)

Execute o script `service/register_service.bat` como Administrador ou utilize o [NSSM](https://nssm.cc/):
```powershell
net start TorexMT5Worker
```
