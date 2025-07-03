FROM gradle:8.12-jdk21 AS build

WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle bootJar --no-daemon

FROM openjdk:21-slim
WORKDIR /app

VOLUME /app/logs

ENV SERVER_PORT=8080

COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

EXPOSE ${SERVER_PORT}

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${SERVER_PORT}"]
