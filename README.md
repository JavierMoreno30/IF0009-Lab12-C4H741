# TechConf (Práctica 11.a)

## Back-End
cd techconf-backend
mvn spring-boot:run        # o ejecutar TechconfBackendApplication desde el IDE
- API:         http://localhost:8080/api/charlas
- Consola H2:  http://localhost:8080/h2-console  (jdbc:h2:mem:techconfdb / sa / password)

## Front-End
cd techconf-frontend
npm install
ng serve                   # http://localhost:4200
