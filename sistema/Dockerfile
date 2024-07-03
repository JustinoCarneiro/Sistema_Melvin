# Etapa 1: Construir a aplicação com Maven
FROM eclipse-temurin:21-jdk AS build

# Instalar Maven
RUN apt-get update \
  && apt-get install -y maven \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: Criar a imagem para executar a aplicação
FROM eclipse-temurin:21-jdk

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
