DROP TABLE USUARIOS;
DROP TABLE ROLES;
DROP TABLE OCUPACIONES;
DROP TABLE SEXOS;
DROP TABLE EVENTOS;
DROP TABLE CARRERA USUARIO;

----- TABLAS-----
CREATE TABLE USUARIOS
(ID_USER  VARCHAR (15),
NOMBRE VARCHAR (60),
FECHA_NACIMIENTO DATE, 
CORREO_INSTITUCIONAL VARCHAR2 (50),
CONTRASENA VARCHAR(15),
CONTACTO NUMBER(14),
SEXO_USUARIO NUMBER(1),
ROL_USUARIO NUMBER(1),
CARRERA_USUARIO VARCHAR(60)
OCUPACION_USUARIO VARCHAR(40),
EVENTO VARCHAR(50),
TABLESPACE TS_PPI


CREATE TABLA ROLES
(ID_ROL      NUMBER(1),
NOMBRE_ROL  VARCHAR (15))
TABLESPACE TS_PPI

CREATE TABLA SEXOS
(ID_SEXO   NUMBER (1),
NOMBRE_SEXO   VARCHAR(15),
NOMBRE_GENERO  VARCHAR(30))
TABLESPACE TS_PPI

CREATE TABLA CARRERAS
(ID_FACULTAD VARCHAR(40),
NOMBRE_CARRERA VARCHAR(60),
SEMESTRE NUMBER(2))
TABLESPACE TS_PPI

CREATE TABLA OCUPACIONES
(ID_OCUPACION VARCHAR(50),
NOMBRE_OCUPACION(50))
TABLESPACE TS_PPI

CREATE TABLA EVENTOS
(ID_EVENTO NUMBER(2),
NOMBRE_EVENTO VARCHAR(50),
FECHA_EVENTO DATE))
TABLESPACE TS_PPI



PURGE TABLESPACE TS_PPI