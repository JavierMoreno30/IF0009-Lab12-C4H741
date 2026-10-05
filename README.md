# IF0009 - Laboratorio 12: Expansión de TechConf

**Estudiante:** [Nombre completo] - **Carnet:** [carnet]
**Curso:** IF0009 Desarrollo de Software IV - UCR, Sede del Atlántico

Sistema full-stack para registrar charlas de una conferencia y sus asistentes.

## Tecnologías
- **Back-End:** Spring Boot 3.3.5, Spring Data JPA, H2 (en memoria), Bean Validation
- **Front-End:** Angular 18 (standalone) con Reactive Forms

## Cómo ejecutarlo

**Back-End** (puerto 8080):
```bash
cd techconf-backend
mvn spring-boot:run
```
Consola H2: http://localhost:8080/h2-console (`jdbc:h2:mem:techconfdb`, usuario `sa`, contraseña `password`)

**Front-End** (puerto 4200):
```bash
cd techconf-frontend
npm install
ng serve
```

## Qué incluye el Lab 12
- Entidad `Asistente` (nombre, correo, edad) con relación `@OneToMany` / `@ManyToOne` con `Charla`.
- `data.sql` con 5 asistentes distribuidos entre las 3 charlas.
- Endpoint `POST /api/charlas/{id}/asistentes`, con validación en el servidor (`@Valid`).
- Botón "Inscribir Asistente" en cada tarjeta, con un formulario reactivo anidado (`FormGroup` dentro de `FormGroup`).
- Validaciones: nombre requerido (mínimo 3 caracteres), correo con formato válido y edad con un validador personalizado (18 años o más).

## Parte 2: Depuración de la recursión infinita

### Síntoma
Con la relación bidireccional `Charla` <-> `Asistente` y sin protección de Jackson, el `GET /api/charlas` falla.

En la consola del back-end apareció:

```
HttpMessageNotWritableException: Could not write JSON: Document nesting depth (1001)
exceeds the maximum allowed (1000, from `StreamWriteConstraints.getMaxNestingDepth()`)
```

En el navegador, el front-end mostró `Http failure during parsing for http://localhost:8080/api/charlas`
con estado 200 y un `SyntaxError: ... is not valid JSON`. El JSON llegó cortado, terminando en
`..."charla":}]}]}]}]}`, y la agenda quedó vacía.

![Error en consola del back-end](docs/error_recursion.png)

### Causa
`Charla` tiene una lista `asistentes` y cada `Asistente` tiene una referencia `charla`. Al serializar
una charla, Jackson baja a sus asistentes, y cada asistente vuelve a serializar su charla, que otra vez
baja a sus asistentes, y así sucesivamente. Se forma un ciclo infinito.

En Jackson 2.15+ (el que usa Spring Boot 3.3.5) el ciclo no termina en un `StackOverflowError`, sino que
se corta al llegar al límite de profundidad de anidamiento (1000 niveles). Por eso el mensaje habla de
"nesting depth" y no de recursión. Como el servidor ya había empezado a enviar la respuesta, el
código HTTP seguía siendo 200 y el cuerpo llegó incompleto.

### Procedimiento
1. Comenté la anotación `@JsonIgnore` del campo `charla` en `Asistente.java`.
2. Reinicié el back-end y consulté `GET /api/charlas`.
3. Observé el error en la consola del servidor y el JSON roto en el front-end (capturas en `docs/`).
4. Identifiqué la causa: la relación bidireccional crea un ciclo en la serialización.
5. Restauré `@JsonIgnore` sobre el campo `charla` (el lado `@ManyToOne`).
6. Reinicié y verifiqué que `GET /api/charlas` devuelve cada charla con su lista de asistentes y que
   los asistentes ya no incluyen el campo `charla`.

### Solución
```java
@ManyToOne
@JoinColumn(name = "charla_id")
@JsonIgnore
private Charla charla;
```

**Directiva de Jackson utilizada:** `@JsonIgnore` (`com.fasterxml.jackson.annotation.JsonIgnore`).
Se aplica en el lado "muchos" para que, al serializar una charla, sí se incluya su lista de asistentes,
pero al serializar un asistente no se vuelva hacia su charla. Así se corta el ciclo sin perder la lista
de asistentes que pide el enunciado.

Otras opciones que existen para este problema, y que no se usaron: `@JsonManagedReference` /
`@JsonBackReference`, `@JsonIdentityInfo` y el uso de DTOs.