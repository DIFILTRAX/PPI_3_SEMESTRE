-- LLAVE PRIMARIA
ALTER TABLE usuarios ADD CONSTRAINT PK_DOCUMENTO_IDENTIDAD
  PRIMARY KEY (documento_identidad);

ALTER TABLE usuarios ADD CONSTRAINT NN_NOMBRE_COMPLETO
  CHECK (nombre_completo IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_CORREO_ELECTRONICO
  CHECK (correo_electronico IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_CONTRASENA
  CHECK (contrasena IS NOT NULL);

ALTER TABLE roles ADD CONSTRAINT PK_ROL_ID
  PRIMARY KEY (rol_id);

-- LLAVE FORANEA (Si tienes una tabla de roles)
ALTER TABLE usuarios ADD CONSTRAINT FK_ROL
  FOREIGN KEY (rol_id)
  REFERENCES roles(rol_id);


---------------------------------
-- LLAVE PRIMARIA


-- CAMPOS OBLIGATORIOS
ALTER TABLE roles ADD CONSTRAINT NN_NOMBRE
  CHECK (nombre IS NOT NULL);
---------------------------------------
-- LLAVE PRIMARIA
ALTER TABLE usuarios_roles ADD CONSTRAINT PK_USUARIOS_ROLES
  PRIMARY KEY (usuario_id, rol_id);

-- LLAVE FORANEA
ALTER TABLE usuarios_roles ADD CONSTRAINT FK_USUARIO_ROL
  FOREIGN KEY (usuario_id)
  REFERENCES usuarios(documento_identidad);

ALTER TABLE usuarios_roles ADD CONSTRAINT FK_ROL_USUARIO
  FOREIGN KEY (rol_id)
  REFERENCES roles(rol_id);
-----------------------------------------
-- LLAVE PRIMARIA
ALTER TABLE eventos ADD CONSTRAINT PK_EVENTO_ID
  PRIMARY KEY (evento_id);

-- CAMPOS OBLIGATORIOS
ALTER TABLE eventos ADD CONSTRAINT NN_TITULO
  CHECK (titulo IS NOT NULL);

-----------------------------------------------
-- LLAVE PRIMARIA
ALTER TABLE usuarios_eventos ADD CONSTRAINT PK_USUARIOS_EVENTOS
  PRIMARY KEY (usuario_id, evento_id);

-- LLAVE FORANEA
ALTER TABLE usuarios_eventos ADD CONSTRAINT FK_USUARIO_EVENTO
  FOREIGN KEY (usuario_id)
  REFERENCES usuarios(documento_identidad);

ALTER TABLE usuarios_eventos ADD CONSTRAINT FK_EVENTO_USUARIO
  FOREIGN KEY (evento_id)
  REFERENCES eventos(evento_id);
---------------------------------------
-- LLAVE PRIMARIA
ALTER TABLE documentacion_historica ADD CONSTRAINT PK_DOC_ID
  PRIMARY KEY (doc_id);
-------------------------------------------------------------------------------------------------

DROP TABLE inscripciones;
DROP TABLE Solicitudes_cambio_rol;
DROP TABLE usuarios;
DROP TABLE eventos;
DROP TABLE roles;

-- TABLAS ROLES

CREATE TABLE roles (
id_rol      NUMBER(1),
nombre_rol  VARCHAR2(50))
TABLESPACE TS_PPI;

-- TABLA EVENTOS

CREATE TABLE eventos (
evento_id     NUMBER(4),
titulo        varchar2(60),
descripcion   VARCHAR2(300),
fecha         DATE,
hora          VARCHAR2(40),
lugar         VARCHAR2(100))
TABLESPACE TS_PPI;

--TABLA USUARIOS


CREATE TABLE usuarios (
documento_identidad   VARCHAR2(20),
nombre_completo       VARCHAR2(40),
correo_electronico    VARCHAR2(60),
contrasena            VARCHAR2(20),
fecha_nacimiento      DATE,
sexo                  VARCHAR2(20),
id_rol                NUMBER(1))
TABLESPACE TS_PPI;

-- TABLA SOLICITUD_CAMBIO ROLES
CREATE TABLE Solicitudes_cambio_rol (
id_solicitud        NUMBER(3),
id_usuario          VARCHAR2(20),
id_rol_Solicitado   NUMBER(1),
estado              VARCHAR2(20))
TABLESPACE TS_PPI;

-- TABLA INSCRIPCIONES

CREATE TABLE inscripciones (
id_inscripcion        NUMBER(3),
evento_id             NUMBER(4),
documento_identidad   VARCHAR2(20))
TABLESPACE TS_PPI;

PURGE TABLESPACE TS_PPI;


--------------------------------------------------------------------------------------------------

-- llaves primarias
ALTER TABLE roles ADD CONSTRAINT PK_ROLES
  PRIMARY KEY (id_rol);

ALTER TABLE usuarios ADD CONSTRAINT PK_DOCUMENTO_IDENTIDAD
  PRIMARY KEY (documento_identidad);

ALTER TABLE eventos ADD CONSTRAINT PK_EVENTO_ID
  PRIMARY KEY (evento_id);

ALTER TABLE Solicitudes_cambio_rol ADD CONSTRAINT PK_id_solicitud
  PRIMARY KEY (id_solicitud);

ALTER TABLE inscripciones ADD CONSTRAINT pk_id_inscripcion 
  PRIMARY KEY (id_inscripcion);


-- Agregar la restricción de NO NULO (CHECK) 
ALTER TABLE roles ADD CONSTRAINT NN_NOMBRE_ROL
  CHECK(nombre_rol IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_NOMBRE 
  CHECK(nombre_completo IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_ROL
  CHECK(ID_ROL IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_CONTRASENA 
  CHECK(contrasena IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_FECHA_NACIMIENTO 
  CHECK(fecha_nacimiento IS NOT NULL);

ALTER TABLE usuarios ADD CONSTRAINT NN_CORREO_ELECTRONICO 
  CHECK(correo_electronico IS NOT NULL);

ALTER TABLE eventos ADD CONSTRAINT NN_TITULO 
  CHECK(titulo IS NOT NULL);

ALTER TABLE eventos ADD CONSTRAINT NN_FECHA 
  CHECK(fecha IS NOT NULL);

ALTER TABLE inscripciones ADD CONSTRAINT nn_evento_id
 CHECK (evento_id IS NOT NULL);

ALTER TABLE inscripciones ADD CONSTRAINT nn_documento_identidad
 CHECK (documento_identidad IS NOT NULL);

ALTER TABLE Solicitudes_cambio_rol ADD CONSTRAINT NN_id_usuario
 CHECK (id_usuario IS NOT NULL);

ALTER TABLE Solicitudes_cambio_rol ADD CONSTRAINT NN_id_rol_Solicitado
  CHECK (id_rol_Solicitado IS NOT NULL);

ALTER TABLE Solicitudes_cambio_rol ADD CONSTRAINT NN_estado
  CHECK (estado IS NOT NULL);

-- LLAVES FORANEAS DE TODAS LAS TABLAS
ALTER TABLE usuarios ADD CONSTRAINT FK_ROL
  FOREIGN KEY (id_rol)
  REFERENCES roles (id_rol);

ALTER TABLE inscripciones ADD CONSTRAINT fk_evento
  FOREIGN KEY (evento_id)
  REFERENCES eventos(evento_id);

ALTER TABLE Solicitudes_cambio_rol ADD CONSTRAINT FK_id_usuario
  FOREIGN KEY (id_usuario)
  REFERENCES USUARIOS(DOCUMENTO_IDENTIDAD);


QUE ES UN TRIGGER
QUE ES DCL, DML, DDL, DQL 
QUE ES UNA DEPENDENCIA FUNCIONAL
QUE ES UNA TABLA CON DEPENDENCIAS FUNCIONALES
QUE ES UNA TABLA SIN DEPENDENCIAS FUNCIONALES
QUE ES UN SCRIPT 
QUE ES UN SCRIPT DE CALCULO DE ALMACENAMIENTO
QUE ES DBA
QUE ES SGDB
QUE SIGNIFICA SQL
UNIVERSO DEL DISCURSO
QUE ES UN CARACTER Y TIPOS DE FORMATOS
