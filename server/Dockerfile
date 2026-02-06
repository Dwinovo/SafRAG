# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY safrag/pom.xml .
COPY safrag/src ./src
# 跳过测试以加快构建，且用户表示"还不用运行"，可能环境不全
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21
WORKDIR /app
# 从第一阶段复制构建好的 jar 包
COPY --from=build /app/target/safrag-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]