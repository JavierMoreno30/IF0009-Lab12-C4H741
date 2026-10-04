INSERT INTO charla (titulo, expositor, nivel, email_contacto, fecha_inicio, fecha_fin)
VALUES ('Introduccion a la Inteligencia Artificial', 'Dra. Maria Rojas', 'Principiante', 'maria@ai-tech.cr', '2026-11-15', '2026-11-15');

INSERT INTO charla (titulo, expositor, nivel, email_contacto, fecha_inicio, fecha_fin)
VALUES ('Microservicios con Spring Cloud', 'Ing. Carlos Brenes', 'Avanzado', 'carlos@spring.io', '2026-11-16', '2026-11-17');

INSERT INTO charla (titulo, expositor, nivel, email_contacto, fecha_inicio, fecha_fin)
VALUES ('Angular 18: Señales y Standalone', 'Licda. Laura Gomez', 'Intermedio', 'laura@angular.dev', '2026-11-17', '2026-11-18');

INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (1, 'IA');
INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (1, 'Machine Learning');

INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (2, 'Spring Boot');
INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (2, 'Backend');
INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (2, 'Nube');
INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (3, 'Angular');
INSERT INTO charla_etiquetas (charla_id, etiqueta) VALUES (3, 'Frontend');
//Lab 12
INSERT INTO asistente (nombre, correo, edad, charla_id) VALUES ('Akil Watson', 'akil.watson@correo.com', 22, 1);
INSERT INTO asistente (nombre, correo, edad, charla_id) VALUES ('Andy Arias', 'andy.arias@correo.com', 25, 1);
INSERT INTO asistente (nombre, correo, edad, charla_id) VALUES ('Sofia Badilla', 'sofia.badilla@correo.com', 30, 2);
INSERT INTO asistente (nombre, correo, edad, charla_id) VALUES ('Diego Vega', 'diego.vega@correo.com', 21, 2);
INSERT INTO asistente (nombre, correo, edad, charla_id) VALUES ('Paula Jimenez', 'paula.jimenez@correo.com', 28, 3);