service postgresql stop

docker-compose down

docker build -t postgresqldb-melvin ./postgres

docker build -t backend-melvin ./sistema

docker build -t frontend-melvin ./frontend

docker-compose up --build --force-recreate --remove-orphans