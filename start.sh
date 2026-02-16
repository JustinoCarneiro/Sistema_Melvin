#!/bin/bash
# (Adicionei o shebang #!/bin/bash para garantir que execute como script shell)

# Tenta parar o postgres local para não dar conflito de porta
sudo service postgresql stop 2>/dev/null || true

# Derruba os containers antigos
docker compose down

# Constrói as imagens (opcional, o 'up --build' já faz isso, mas mal não faz)
docker build -t postgresqldb-melvin ./postgres
docker build -t backend-melvin ./sistema
docker build -t frontend-melvin ./frontend

# Sobe tudo recriando containers
docker compose up --build --force-recreate --remove-orphans
