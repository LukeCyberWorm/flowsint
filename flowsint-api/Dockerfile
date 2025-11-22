FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    pkg-config \
    libcairo2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /root/.local/bin/poetry /usr/local/bin/poetry

WORKDIR /app

# ============= DEV STAGE =============
FROM base AS dev

ENV APP_ENV=development

COPY flowsint-core /app/flowsint-core
COPY flowsint-types /app/flowsint-types
COPY flowsint-transforms /app/flowsint-transforms
COPY flowsint-api /app/flowsint-api

# Fix Windows + permissão
COPY --chmod=755 flowsint-api/entrypoint.sh /app/flowsint-api/entrypoint.sh

WORKDIR /app/flowsint-api

RUN poetry install --no-root --with dev

EXPOSE 5001

ENTRYPOINT ["/app/flowsint-api/entrypoint.sh"]
# AQUI ESTAVA O ERRO FINAL: underscore → hífen
CMD ["uvicorn", "flowsint-api.main:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]

# ============= PROD STAGE =============
FROM base AS prod

ENV APP_ENV=production

COPY flowsint-core /app/flowsint-core
COPY flowsint-types /app/flowsint-types
COPY flowsint-transforms /app/flowsint-transforms
COPY flowsint-api /app/flowsint-api

COPY --chmod=755 flowsint-api/entrypoint.sh /app/flowsint-api/entrypoint.sh

WORKDIR /app/flowsint-api

RUN poetry install --only main

EXPOSE 5001

ENTRYPOINT ["/app/flowsint-api/entrypoint.sh"]
CMD ["uvicorn", "flowsint-api.main:app", "--host", "0.0.0.0", "--port", "5001"]