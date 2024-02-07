const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3008;

const dbConfig = {
  user: 'admin_carlos',
  password: '5599',
  connectString: 'localhost:1521/xe'
};
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'img_vdeo')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/principal.html'));

// Configuración de sesiones
app.use(session({
  secret: 'XD',
  resave: false,
  saveUninitialized: true
}));

// Agrega un controlador de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado: ', err);
  res.status(500).send('Error en el servidor');
});

// Rutas para las páginas HTML
app.get('/index', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/panel_admi', (req, res) => res.sendFile(__dirname + '/panel_admi.html'));
app.get('/inicio', (req, res) => res.sendFile(__dirname + '/inicio.html'));
app.get('/registro', (req, res) => res.sendFile(__dirname + '/registro.html'));
app.get('/principal', (req, res) => res.sendFile(__dirname + '/principal.html'));
app.get('/lideres', (req, res) => res.sendFile(__dirname + '/lideres.html'));
app.get('/panel_C', (req, res) => res.sendFile(__dirname + '/panel_C.html'));
app.get('/crono18', (req, res) => res.sendFile(__dirname + '/crono18.html'));
app.get('/crono19', (req, res) => res.sendFile(__dirname + '/crono19.html'));
app.get('/gestion_u', (req, res) => res.sendFile(__dirname + '/gestion_u.html'));
app.get('/editar_u', (req, res) => res.sendFile(__dirname + '/editar.html'));

//-------------------------------------------------------------------------------------------------------------------

// Ruta para procesar el formulario de registro
app.post('/registro', (req, res) => {
  const { nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad, id_rol } = req.body;

  console.log('Fecha de nacimiento recibida:', fecha_nacimiento);

  // Conecta a la base de datos Oracle
  oracledb.getConnection(dbConfig, (err, conexión) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    // Ejecuta una consulta SQL para insertar los datos en la tabla usuarios
    const sql = `INSERT INTO usuarios (nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad, id_rol) VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5, :6, :7)`;

    conexión.execute(sql, [nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad, 3], { autoCommit: true }, (err, result) => {
      if (err) {
        console.error('Error al insertar en la base de datos Oracle: ', err);
        res.status(500).send('Error al registrar el usuario');
      } else {
        console.log('Registro exitoso');

        // Inserta una solicitud en la tabla de solicitudes de cambio de rol
        const solicitudSql = `INSERT INTO solicitudes_cambio_rol (id_solicitud, id_usuario, id_rol_solicitado, estado) VALUES (solicitud_seq.NEXTVAL, :1, :2, :3)`;
        conexión.execute(solicitudSql, [documento_identidad, id_rol, 'pendiente'], { autoCommit: true }, (err) => {
          if (err) {
            console.error('Error al insertar la solicitud: ', err);
          }
        });

        res.send('Registro exitoso');
      }

      // Cierra la conexión a la base de datos
      conexión.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión a la base de datos: ', err);
        }
      });
    });
  });
});

//--------------------------------------------------------------------------------------------------------------------

// Ruta para procesar el formulario de inicio de sesión
app.post('/inicio', async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  oracledb.getConnection(dbConfig, (err, conexión) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    const sql = `SELECT * FROM usuarios WHERE correo_electronico = :1 AND contrasena = :2`;

    conexión.execute(sql, [correo_electronico, contrasena], (err, result) => {
      if (err) {
        console.error('Error al consultar la base de datos Oracle: ', err);
        res.status(500).send('Error en el servidor');
      } else {
        if (result.rows.length === 1) {
          console.log('Inicio de sesión exitosa');

          console.log('Información del usuario:', result.rows[0]);

          // Almacenar información del usuario en la sesión
          const usuario = result.rows[0];
          req.session.user = {
            correo: usuario[2],  
            documentoIdentidad: usuario[0]  
          };

          console.log('Usuario almacenado en la sesión del servidor:', req.session.user);

          res.send('Inicio de sesión exitosa');
        } else {
          res.status(401).send('Credenciales no válidas');
        }
      }

      conexión.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión a la base de datos: ', err);
        }
      });
    });
  });
});


//----------------------------------------------------------------------------------------------------------------------

// Mostrar el número total de usuarios registrados
app.get('/getTotalUsers', (req, res) => {
  const sql = 'SELECT COUNT (*) FROM usuarios';
  oracledb.getConnection(dbConfig, (err, conexión) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    conexión.execute(sql, (err, result) => {
      if (err) {
        console.error('Error al consultar la base de datos Oracle: ', err);
        res.status(500).send('Error en el servidor');
      } else {
        const totalUsuarios = result.rows[0][0];
        console.log('Número total de usuarios registrados:', totalUsuarios);
        res.json({ totalUsuarios });
      }

      conexión.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión a la base de datos: ', err);
        }
      });
    });
  });
});

//--------------------------------------------------------------------------------------------------------------------

// El total de eventos

app.get('/getTotalEvents', (req, res) => {
    const sql = 'SELECT COUNT(*) FROM eventos';
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ error : 'Error al conectar a la base de datos' });
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).json({ error: 'Error al obtener el número de eventos programados' });
          return;
        }
  
        const totalEvents = resultado.rows[0][0];
        // Enviar la respuesta como JSON
        res.json({ totalEvents });
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//------------------------------------------------------------------------------------------------------------------
//Ruta para el registro desde el administrador

app.post('/gestion_u', (req, res) => {
    // Obtener los datos del cuerpo de la solicitud
    const { documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, id_rol } = req.body;
  
    // Conecta a la base de datos Oracle
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ éxito: false, mensaje: 'Error en la conexión a la base de datos' });
        return;
      }
  
      // Ejecuta una consulta SQL para insertar los datos en la tabla de usuarios
      const sql = `
        INSERT INTO usuarios (documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, id_rol)
        VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), :6, :7)
      `;
  
      conexión.execute(
        sql,
        [documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, id_rol],
        { autoCommit: true }, 
        (err, result) => {
          if (err) {
            console.error('Error al insertar en la base de datos Oracle: ', err);
            res.status(500).json({ éxito: false, mensaje: 'Error al registrar el usuario' });
          } else {
            console.log('Registro exitoso');
            res.json({ éxito: true, mensaje: 'Usuario registrado exitosamente' });
          }
  
          // Cierra la conexión a la base de datos
          conexión.close((err) => {
            if (err) {
              console.error('Error al cerrar la conexión a la base de datos: ', err);
            }
          });
        }
      );
    });
  });

  //-------------------------------------------------------------------------------------------------------------------

  //Mostrar todos los registros

  app.get('/getUsuarios', (req, res) => {
    console.log('Recibida solicitud para /getUsuarios');
  
    // Realiza una consulta SQL para obtener los usuarios
    const sql = `
      SELECT documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, id_rol
      FROM usuarios
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de usuarios');
          return;
        }
  
        // Crear una tabla HTML a partir de los resultados
        const htmlTable = `
          <table>
            <thead>
              <tr>
                <th>Documento de Identidad</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Contraseña</th>
                <th>Fecha de Nacimiento</th>
                <th>Sexo</th>
                <th>Id_rol</th>
              </tr>
            </thead>
            <tbody>
              ${resultado.rows.map(fila => `
                <tr>
                  <td>${fila[0]}</td>
                  <td>${fila[1]}</td>
                  <td>${fila[2]}</td>
                  <td>${fila[3]}</td>
                  <td>${fila[4]}</td>
                  <td>${fila[5]}</td>
                  <td>${fila[6]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
  
        res.send(htmlTable);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//-------------------------------------------------------------------------------------------------------------------
// GUARDAR EVENTO

app.post('/guardarEvento', (req, res) => {
    const { titulo, descripcion, fecha, hora, lugar } = req.body;
  
    // Conecta a la base de datos
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      // Ejecuta una consulta SQL para insertar los datos en la tabla eventos
      const sql = `
        INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar)
        VALUES (:titulo, :descripcion, TO_DATE(:fecha, 'YYYY-MM-DD'), :hora, :lugar)
      `;
  
      conexión.execute(
        sql,
        { titulo: titulo, descripcion: descripcion, fecha: fecha, hora: hora, lugar: lugar },
        { autoCommit: true },
        (err, resultado) => {
          if (err) {
            console.error('Error al insertar en la base de datos Oracle: ', err);
            res.status(500).send('Error al guardar el evento');
          } else {
            console.log('Evento guardado exitosamente');
            res.json({ estado: "éxito", mensaje: "Evento guardado exitosamente" });
          }
  
          // Cierra la conexión a la base de datos
          conexión.close((err) => {
            if (err) {
              console.error('Error al cerrar la conexión a la base de datos: ', err);
            }
          });
        }
      );
    });
  });

//-------------------------------------------------------------------------------------------------------------------

// MOSTRAR EVENTOS PARA ELIMINAR

app.get('/getListaEventosEliminar', (req, res) => {
    // Realiza una consulta SQL para obtener la lista de eventos (evento_id y título).
    const sql = 'SELECT evento_id, titulo FROM eventos';
  
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de eventos');
          return;
        }
  
        // Enviar los resultados como JSON al cliente
        res.json(resultado.rows);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//------------------------------------------------------------------------------------------------------------------

//Eliminar evento

app.post('/eliminarEvento', async (req, res) => {
  const { eventoId, titulo } = req.body;

  try {
    const conexión = await oracledb.getConnection(dbConfig);

    // Elimina las inscripciones asociadas al evento
    const eliminarInscripcionesSql = 'DELETE FROM inscripciones WHERE evento_id = :1';
    await conexión.execute(eliminarInscripcionesSql, [eventoId]);

    // Elimina el evento
    const eliminarEventoSql = 'DELETE FROM eventos WHERE evento_id = :1';
    await conexión.execute(eliminarEventoSql, [eventoId], { autoCommit: true });

    console.log('Evento y sus inscripciones eliminados exitosamente');
    res.json({ éxito: true, mensaje: 'Evento y sus inscripciones eliminados exitosamente' });

    // Cierra la conexión a la base de datos
    await conexión.close();
  } catch (error) {
    console.error('Error al eliminar evento y sus inscripciones:', error);
    res.status(500).json({ éxito: false, mensaje: 'Error al eliminar evento y sus inscripciones' });
  }
});

 //-------------------------------------------------------------------------------------------------------------------
 
 // Agrega esta ruta para obtener la lista de eventos para editar
app.get('/getListaEventosEditar', (req, res) => {
    // Realiza la consulta a la base de datos para obtener la lista de eventos
    const sql = 'SELECT evento_id, titulo FROM eventos';
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, (err, result) => {
        if (err) {
          console.error('Error al consultar la base de datos Oracle: ', err);
          res.status(500).send('Error en el servidor');
        } else {
            const eventos = result.rows.map((fila) => ({
                evento_id: fila[0],
                titulo: fila[1],
              }));
              res.json(eventos); 
        }
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

  //----------------------------------------------------------------------------------------------------------------

  // Ruta para obtener los detalles de un evento específico
app.get('/getDetallesEvento/:evento_id', async (req, res) => {
    const evento_id = req.params.evento_id;
  
    try {
      const conexión = await oracledb.getConnection(dbConfig);
  
      const sql = 'SELECT * FROM eventos WHERE evento_id = :evento_id';
      const resultado = await conexión.execute(sql, [evento_id], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  
      const detallesEvento = resultado.rows[0];
      res.json(detallesEvento);
  
      await conexión.close();
    } catch (error) {
      console.error('Error al obtener detalles del evento:', error);
      res.status(500).json({ error: 'Error al obtener detalles del evento' });
    }
  });
  
  //--------------------------------------------------------------------------------------------------------------------

  // Ruta para actualizar un evento
app.post('/actualizarEvento', async (req, res) => {
    const { evento_id, titulo, descripcion, fecha, hora, lugar } = req.body;
  
    try {
      const conexión = await oracledb.getConnection(dbConfig);
  
      const sql = `
  UPDATE eventos
  SET titulo = :titulo,
      descripcion = :descripcion,
      fecha = TO_DATE(:fecha, 'YYYY-MM-DD'),
      hora = TO_TIMESTAMP(:hora, 'HH24:MI:SS'),
      lugar = :lugar
  WHERE evento_id = :evento_id
`;

  
      await conexión.execute(sql, { evento_id, titulo, descripcion, fecha, hora, lugar }, { autoCommit: true });
  
      res.json({ estado: 'éxito', mensaje: 'Evento actualizado exitosamente' });
  
      await conexión.close();
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
      res.status(500).json({ error: 'Error al actualizar el evento' });
    }
  });
  

  //-------------------------------------------------------------------------------------------------------------------

  app.get('/getListaUsuarios', (req, res) => {
    // Realiza una consulta SQL para obtener la lista de usuarios (documento_identidad y nombre_completo).
    const sql = 'SELECT documento_identidad, nombre_completo FROM usuarios';
  
    // Realiza la consulta a la base de datos y devuelve los resultados como JSON.
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de usuarios');
          return;
        }
  
        // Enviar los resultados como JSON al cliente
        res.json(resultado.rows);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//--------------------------------------------------------------------------------------------------------------------

 //MOSTRAR USUARIOS PAERA ELIMINAR 

 app.get('/getListaUsuariosEliminar', (req, res) => {
    // Realiza una consulta SQL para obtener la lista de usuarios (documento_identidad y nombre_completo).
    const sql = 'SELECT documento_identidad, nombre_completo FROM usuarios';
  
    
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de usuarios');
          return;
        }
  
        // Enviar los resultados como JSON al cliente
        res.json(resultado.rows);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//-------------------------------------------------------------------------------------------------------------------

app.post('/eliminarUsuario', async (req, res) => {
    const { documento, nombre } = req.body;

    // Conecta a la base de datos Oracle
    try {
        const conexión = await oracledb.getConnection(dbConfig);

        // Verificar si hay una solicitud de cambio de rol pendiente para el usuario
        const verificarSolicitudSql = `
            SELECT id_solicitud
            FROM solicitudes_cambio_rol
            WHERE id_usuario = :1
        `;

        const verificarSolicitudResult = await conexión.execute(verificarSolicitudSql, [documento]);

        if (verificarSolicitudResult.rows.length > 0) {
            // Si hay una solicitud pendiente, eliminarla
            const eliminarSolicitudSql = `
                DELETE FROM solicitudes_cambio_rol
                WHERE id_usuario = :1
            `;

            await conexión.execute(eliminarSolicitudSql, [documento], { autoCommit: true });
        }

        // Eliminar el usuario de la tabla usuarios
        const eliminarUsuarioSql = 'DELETE FROM usuarios WHERE documento_identidad = :1';
        await conexión.execute(eliminarUsuarioSql, [documento], { autoCommit: true });

        console.log('Usuario eliminado exitosamente');
        res.json({ éxito: true, mensaje: 'Usuario eliminado exitosamente' });

        // Cierra la conexión a la base de datos
        await conexión.close();
    } catch (err) {
        console.error('Error al eliminar el usuario: ', err);
        res.status(500).json({ éxito: false, mensaje: 'Error al eliminar el usuario' });
    }
});

//------------------------------------------------------------------------------------------------------------------

app.get('/getUsuarios', (req, res) => {
    
    const sql = 'SELECT documento_identidad, nombre_completo FROM usuarios';
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
          return;
        }
  
        const usuarios = resultado.rows.map((fila) => ({
          documento_identidad: fila[0],
          nombre_completo: fila[1],
        }));
  
        // Enviar la respuesta como JSON
        res.json({ usuarios });
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//------------------------------------------------------------------------------------------------------------------

//Mostrar la lista de roles disponibles de la tabla roles

app.get('/getListaRoles', (req, res) => {

    const sql = 'SELECT id_rol, nombre_rol FROM roles';
  
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de roles');
          return;
        }
  
        // Enviar los resultados como JSON al cliente
        res.json(resultado.rows);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

  //-----------------------------------------------------------------------------------------------------------------

  // Ruta para obtener las solicitudes de cambio de rol

  app.get('/getSolicitudesCambioRol', (req, res) => {
    console.log('Recibida solicitud para /getSolicitudesCambioRol');
  
    // Realiza una consulta SQL para obtener las solicitudes
    const sql = `
  SELECT scr.id_solicitud, u.nombre_completo, scr.estado, scr.id_rol_solicitado
  FROM solicitudes_cambio_rol scr
  JOIN usuarios u ON scr.id_usuario = u.documento_identidad
`;

  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }

      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de solicitudes de cambio de rol');
          return;
        }
  
        const solicitudes = resultado.rows.map((fila) => ({
          id_solicitud: fila[0],
          nombre_completo: fila[1],
          estado: fila[2],
          id_rol_solicitado: fila[3]
        }));
  
        res.json(solicitudes);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//---------------------------------------------------------------------------------------------------------------------

 // Ruta para obtener los roles disponibles 

 app.get('/getRolesDisponibles', (req, res) => {
    console.log('Recibida solicitud para /getRolesDisponibles');
  
   
    const sql = `
      SELECT id_rol, nombre_rol
      FROM roles
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).send('Error al obtener la lista de roles disponibles');
          return;
        }
  
        const roles = resultado.rows.map((fila) => ({
          id_rol: fila[0],
          nombre_rol: fila[1],
        }));
  
        res.json(roles);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });


//--------------------------------------------------------------------------------------------------------------------

// Ruta para asignar un rol a un usuario 

app.post('/asignarRol', (req, res) => {
    console.log('Recibida solicitud para /asignarRol');
    const { idSolicitud, idRol } = req.body;
  
    // Realiza una consulta SQL para asignar el rol al usuario
    const sql = `
      UPDATE usuarios
      SET id_rol = :1
      WHERE documento_identidad = (
        SELECT id_usuario
        FROM solicitudes_cambio_rol
        WHERE id_solicitud = :2
      )
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(sql, [idRol, idSolicitud], (err, resultado) => {
        if (err) {
          console.error('Error al asignar el rol: ', err);
          res.status(500).send('Error al asignar el rol');
          return;
        }
  
        res.send('Rol asignado exitosamente');
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//--------------------------------------------------------------------------------------------------------------------
// Controlador para actualizar el estado en la tabla solicitudes_cambio_rol

app.post('/actualizarEstadoRol', (req, res) => {
    const { idSolicitud, nuevoEstado } = req.body;
  
    const sql = `
      UPDATE solicitudes_cambio_rol
      SET estado = :nuevoEstado
      WHERE id_solicitud = :idSolicitud
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(
        sql,
        { nuevoEstado, idSolicitud },
        { autoCommit: true },
        (err, resultado) => {
          if (err) {
            console.error('Error al actualizar el estado: ', err);
            res.status(500).send('Error al actualizar el estado');
          } else {
            res.send('Estado actualizado correctamente');
          }
  
          conexión.close((err) => {
            if (err) {
              console.error('Error al cerrar la conexión a la base de datos: ', err);
            }
          });
        }
      );
    });
  });

//--------------------------------------------------------------------------------------------------------------------

// Controlador para actualizar el nuevo rol en la tabla usuarios


app.post('/actualizarNuevoRol', (req, res) => {
    const { idSolicitud, nuevoRol } = req.body;
  
    const sql = `
      UPDATE usuarios
      SET id_rol = :nuevoRol
      WHERE documento_identidad = (
        SELECT id_usuario
        FROM solicitudes_cambio_rol
        WHERE id_solicitud = :idSolicitud
      )
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).send('Error al conectar a la base de datos');
        return;
      }
  
      conexión.execute(
        sql,
        { nuevoRol, idSolicitud },
        { autoCommit: true },
        (err, resultado) => {
          if (err) {
            console.error('Error al actualizar el nuevo rol: ', err);
            res.status(500).send('Error al actualizar el nuevo rol');
          } else {
            res.send('Nuevo rol actualizado correctamente');
          }
  
          conexión.close((err) => {
            if (err) {
              console.error('Error al cerrar la conexión a la base de datos: ', err);
            }
          });
        }
      );
    });
  });

//----------------------------------------------------------------------------------------------------------------------

app.get('/getListaUsuariosEditar', (req, res) => {
    // Realiza una consulta SQL para obtener la lista de usuarios en formato JSON
    const sql = 'SELECT documento_identidad, nombre_completo FROM usuarios';
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
        return;
      }
  
      conexión.execute(sql, [], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
          return;
        }
  
        const usuarios = resultado.rows.map((fila) => ({
          documento_identidad: fila[0],
          nombre_completo: fila[1],
        }));
  
        // Enviar la respuesta como JSON
        res.json(usuarios);
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

 //-------------------------------------------------------------------------------------------------------------------
 
 app.get('/getDetallesUsuario', (req, res) => {
    const documentoIdentidad = req.query.documentoIdentidad;
  
    // Realiza una consulta SQL para obtener los detalles de un usuario por su documento_identidad
    const sql = 'SELECT * FROM usuarios WHERE documento_identidad = :1';
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ error: 'Error al conectar a la base de datos' });
        return;
      }
  
      conexión.execute(sql, [documentoIdentidad], (err, resultado) => {
        if (err) {
          console.error('Error al ejecutar la consulta: ', err);
          res.status(500).json({ error: 'Error al obtener los detalles del usuario' });
          return;
        }
  
        if (resultado.rows.length === 1) {
          const usuario = {
            documento_identidad: resultado.rows[0][0],
            nombre_completo: resultado.rows[0][1],
            correo_electronico: resultado.rows[0][2],
            contrasena: resultado.rows[0][3],
            fecha_nacimiento: resultado.rows[0][4],
            sexo: resultado.rows[0][5],
            id_rol: resultado.rows[0][6]
         
          };
  
          // Enviar los detalles del usuario como JSON
          res.json(usuario);
        } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
        }
  
        conexión.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      });
    });
  });

//-----------------------------------------------------------------------------------------------------------------

app.post('/actualizarUsuario', (req, res) => {
    const {
      documentoIdentidad,
      nombre,
      email,
      contrasena,
      fechaNacimiento,
      sexo,
      idRol
    } = req.body;

    const fechaFormateada = new Date(fechaNacimiento).toISOString().slice(0, 10);

  
    // Realiza una consulta SQL para actualizar los detalles del usuario
    const sql = `
      UPDATE usuarios
      SET nombre_completo = :nombre,
          correo_electronico = :email,
          contrasena = :contrasena,
          fecha_nacimiento = TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'),
          sexo = :sexo,
          id_rol = :idRol
          -- Agrega más campos según tu tabla de usuarios
      WHERE documento_identidad = :documentoIdentidad
    `;
  
    oracledb.getConnection(dbConfig, (err, conexión) => {
      if (err) {
        console.error('Error al conectar a la base de datos Oracle: ', err);
        res.status(500).json({ Success: false, message: 'Error en la conexión a la base de datos' });
        return;
      }
  
      conexión.execute(
        sql,
        {
          nombre,
          email,
          contrasena,
          fechaNacimiento: fechaFormateada,
          sexo,
          idRol,
          documentoIdentidad 
        },
        { autoCommit: true },
        (err, resultado) => {
          if (err) {
       
            res.status(500).json({ Éxito: false, mensaje: 'Error al actualizar el usuario' });
          } else {
            res.json({ éxito: true, mensaje: 'Usuario actualizado exitosamente' });
          }
  
          conexión.close((err) => {
            if (err) {
              console.error('Error al cerrar la conexión a la base de datos: ', errar);
            }
          });
        }
      );
    });
  });

//------------------------------------------------------------------------------------------------------------------

// Agrega esta ruta en tu servidor para obtener la lista de usuarios
app.get('/obtenerListaUsuarios', (req, res) => {
    // Conecta a la base de datos
    oracledb.getConnection(dbConfig, (err, conexión) => {
        if (err) {
            console.error('Error al conectar a la base de datos Oracle: ', err);
            res.status(500).json({ error: 'Error al conectar a la base de datos' });
            return;
        }

        // Ejecuta una consulta SQL para obtener la lista de usuarios
        const sql = 'SELECT documento_identidad, nombre_completo FROM usuarios';

        conexión.execute(sql, [], (err, resultado) => {
            if (err) {
                console.error('Error al ejecutar la consulta: ', err);
                res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
                return;
            }

            console.log('Datos enviados desde el servidor:', resultado.rows);

            // Enviar la lista de usuarios como JSON
            const listaUsuarios = resultado.rows.map(row => ({
                documento_identidad: row[0],
                nombreCompleto: row[1]
            }));
            res.json(listaUsuarios);

            // Cierra la conexión a la base de datos
            conexión.close((err) => {
                if (err) {
                    console.error('Error al cerrar la conexión a la base de datos: ', err);
                }
            });
        });
    });
});

//----------------------------------------------------------------------------------------------------------------

// Agrega esta ruta en tu servidor para obtener la información de los eventos y descripciones
app.get('/obtenerInfoEventos', async (req, res) => {
    try {
      // Conecta a la base de datos
      const conexión = await oracledb.getConnection(dbConfig);
  
      // Consulta SQL para obtener la información básica de los eventos
      const sql = 'SELECT evento_id, titulo, fecha, hora, lugar FROM eventos';
      const resultadoInfo = await conexión.execute(sql, []);
  
      // Consulta SQL para obtener las descripciones de los eventos
      const sqlDescripciones = 'SELECT evento_id, descripcion FROM eventos';
      const resultadoDescripciones = await conexión.execute(sqlDescripciones, []);
  
  
  
      // Transforma y envía la información de los eventos como JSON
      const infoEventos = resultadoInfo.rows.map(row => ({
        evento_id: row[0],
        titulo: row[1],
        fecha: row[2],
        hora: row[3],
        lugar: row[4]
       
      }));
  

      const descripciones = resultadoDescripciones.rows.reduce((acc, row) => {
        acc[row[0]] = row[1] ? row[1].toString() : ''; 
        return acc;
      }, {});
  
      res.json({ infoEventos, descripciones });
  
      // Cierra la conexión a la base de datos
      await conexión.close();
    } catch (error) {
      console.error('Error al obtener la información de los eventos:', error);
      res.status(500).json({ error: 'Error al obtener la información de los eventos' });
    }
  });

  
  

//------------------------------------------------------------------------------------------------------------------

// Agrega esta nueva ruta para manejar la inscripción de usuarios en eventos
app.post('/inscribirUsuarioEnEvento', async (req, res) => {
    const { idEvento, documentoIdentidad } = req.body;

    try {
        // Conecta a la base de datos
        const conexión = await oracledb.getConnection(dbConfig);

        // Verifica si ya existe una inscripción para el mismo evento y usuario
        const verificarSql = `
            SELECT COUNT(*) AS numInscripciones
            FROM inscripciones
            WHERE evento_id = :idEvento
            AND documento_identidad = :documentoIdentidad
        `;
        const verificarResultado = await conexión.execute(verificarSql, { idEvento, documentoIdentidad });
        const numInscripciones = verificarResultado.rows[0][0];

        if (numInscripciones > 0) {
        
            res.json({ estado: "error", mensaje: "El usuario ya está inscrito en este evento" });
        } else {
            
            const insertarSql = `
                INSERT INTO inscripciones (evento_id, documento_identidad)
                VALUES (:idEvento, :documentoIdentidad)
            `;

            const resultado = await conexión.execute(insertarSql, { idEvento, documentoIdentidad }, { autoCommit: true });

            console.log('Usuario inscrito exitosamente en el evento');
            res.json({ estado: "éxito", mensaje: "Usuario inscrito exitosamente en el evento" });
        }

        // Cierra la conexión a la base de datos
        await conexión.close();
    } catch (error) {
        console.error('Error al inscribir al usuario en el evento:', error);
        res.status(500).json({ estado: 'error', mensaje: 'Error al inscribir al usuario en el evento' });
    }
});

//---------------------------------------------------------------------------------------------------------------

                                           //PAGINA PRINCIPAL

//------------------------------------------------------------------------------------------------------------------

// Ruta para obtener eventos desde la base de datos
app.get('/getEventos', async (req, res) => {
  try {
    const conexión = await oracledb.getConnection(dbConfig);

    const sql = 'SELECT * FROM eventos';  
    const resultado = await conexión.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const eventos = resultado.rows;
    res.json(eventos);

    await conexión.close();
  } catch (error) {
    console.error('Error al obtener eventos desde la base de datos:', error);
    res.status(500).json({ error: 'Error al obtener eventos desde la base de datos' });
  }
});


//--------------------------------------------------------------------------------------------------------------------

// Ruta para inscribir a un usuario en un evento
app.post('/inscribirEvento', async (req, res) => {
  try {
    const { eventoId, documentoIdentidad } = req.body;

    const conexión = await oracledb.getConnection(dbConfig);

    // Verificar si el usuario ya está inscrito en el evento
    const verificarInscripcionSql = 'SELECT * FROM inscripciones WHERE evento_id = :1 AND documento_identidad = :2';
    const resultado = await conexión.execute(verificarInscripcionSql, [eventoId, documentoIdentidad]);

    if (resultado.rows.length > 0) {
      res.status(400).json({ éxito: false, mensaje: 'El usuario ya está inscrito en este evento' });
      return;
    }

    // Inscribir al usuario en el evento
    const inscribirSql = 'INSERT INTO inscripciones (id_inscripcion, evento_id, documento_identidad) VALUES (inscripciones_seq.NEXTVAL, :1, :2)';
    await conexión.execute(inscribirSql, [eventoId, documentoIdentidad], { autoCommit: true });

    console.log('Usuario inscrito exitosamente en el evento');
    res.json({ éxito: true, mensaje: 'Usuario inscrito exitosamente en el evento' });

    // Cierra la conexión a la base de datos
    await conexión.close();
  } catch (error) {
    console.error('Error al inscribir usuario en el evento:', error);
    res.status(500).json({ éxito: false, mensaje: 'Error al inscribir usuario en el evento' });
  }
});

//-----------------------------------------------------------------------------------------------------------------

// Ruta para obtener información del usuario en la sesión
app.get('/obtenerUsuario', (req, res) => {
  const usuario = req.session.user || null;
  res.json(usuario);
});




//------------------------------------------------------------------------------------------------------------------



// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
