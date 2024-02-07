const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;


const dbConfig = {
  user: 'C##admi1',
  password: 'sam123',
  connectString: 'localhost:1521/xe' 
};

//--------------------------------------------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));


app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/panel_admi', (req, res) => {
  res.sendFile(__dirname + '/panel_admi.html');
});

app.get('/inicio', (req, res) => {
  res.sendFile(__dirname + '/inicio.html');
});

app.get('/registro', (req, res) => {
  res.sendFile(__dirname + '/registro.html'); 
});

app.get('/principal', (req, res) => {
  res.sendFile(__dirname + '/principal.html');
});

app.get('/lideres', (req, res) => {
  res.sendFile(__dirname + '/lideres.html'); 
});

app.get('/panel_C', (req, res) => {
  res.sendFile(__dirname + '/panel_C.html'); 
});

app.get('/crono18', (req, res) => {
  res.sendFile(__dirname + '/crono18.html');
});

app.get('/crono19', (req, res) => {
  res.sendFile(__dirname + '/crono19.html');
});

app.get('/gestion_u', (req, res) => {
  res.sendFile(__dirname + '/gestion_u.html');
});
//--------------------------------------------------------------------------------------------------------------------

// Agrega un manejador de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).send('Error en el servidor');
});


//--------------------------------------------------------------------------------------------------------------------
// Ruta para procesar el formulario de registro
app.post('/registro', (req, res) => {
  const {nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad} = req.body;

  console.log('Fecha de nacimiento recibida:', fecha_nacimiento);

  // Conecta a la base de datos
  oracledb.getConnection(dbConfig, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    // Ejecuta una consulta SQL para insertar los datos en la tabla
    const sql = `INSERT INTO usuarios (nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad) VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5, :6)`;

    connection.execute(
      sql,
      [nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo, documento_identidad],
      { autoCommit: true }, // Habilita el autocommit para confirmar la transacción automáticamente
      (err, result) => {
        if (err) {
          console.error('Error al insertar en la base de datos Oracle: ', err);
          res.status(500).send('Error al registrar el usuario');
        } else {
          console.log('Registro exitoso');
          res.send('Registro exitoso');
        }

        // Cierra la conexión a la base de datos
        connection.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      }
    );
  });
});
//----------------------------------------------------------------------------------------------------------------------

app.post('/inicio', async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  
  oracledb.getConnection(dbConfig, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    
    const sql = `SELECT * FROM usuarios WHERE correo_electronico = :1 AND contrasena = :2`;
    connection.execute(
      sql,
      [correo_electronico, contrasena],
      (err, result) => {
        if (err) {
          console.error('Error al consultar la base de datos Oracle: ', err);
          res.status(500).send('Error en el servidor');
        } else {
          if (result.rows.length === 1) {
          
            console.log('Inicio de sesión exitoso');
            res.send('Inicio de sesión exitoso');
          } else {
        
            res.status(401).send('Credenciales no válidas');
          }
        }


        connection.close((err) => {
          if (err) {
            console.error('Error al cerrar la conexión a la base de datos: ', err);
          }
        });
      }
    );
  });
});

    
//--------------------------------------------------------------------------------------------------------------------
//Mostrar el numero total de usuarios registrados

app.get('/getTotalUsers', (req, res) => {
  const sql = 'SELECT COUNT(*) FROM usuarios';

  oracledb.getConnection(dbConfig, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).json({ error: 'Error al conectar a la base de datos' });
      return;
    }

    connection.execute(sql, [], (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta: ', err);
        res.status(500).json({ error: 'Error al obtener el número de usuarios registrados' });
        return;
      }

      const totalUsers = result.rows[0];

      // Enviar la respuesta como JSON
      res.json({ totalUsers });

      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión a la base de datos: ', err);
        }
      });
    });
  });
});




//----------------------------------------------------------------------------------------------------------------------

//ruta para el registro desde el administrador

app.post('/gestion_u', (req, res) => {
  // Obtén los datos del cuerpo de la solicitud
  const { documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo } = req.body;

  // Conecta a la base de datos Oracle
  oracledb.getConnection(dbConfig, (err, connection) => {
      if (err) {
          console.error('Error al conectar a la base de datos Oracle: ', err);
          res.status(500).json({ success: false, message: 'Error en la conexión a la base de datos' });
          return;
      }

      // Ejecuta una consulta SQL para insertar los datos en la tabla de usuarios
      const sql = `
          INSERT INTO usuarios (documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo)
          VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), :6)
      `;

      connection.execute(
          sql,
          [documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo],
          { autoCommit: true }, // Habilita el autocommit para confirmar la transacción automáticamente
          (err, result) => {
              if (err) {
                  console.error('Error al insertar en la base de datos Oracle: ', err);
                  res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
              } else {
                  console.log('Registro exitoso');
                  res.json({ success: true, message: 'Usuario registrado exitosamente' });
              }

              // Cierra la conexión a la base de datos
              connection.close((err) => {
                  if (err) {
                      console.error('Error al cerrar la conexión a la base de datos: ', err);
                  }
              });
          }
      );
  });
});
//--------------------------------------------------------------------------------------------------------------------
//Mostrar todos los registros

app.get('/getUsuarios', (req, res) => {
  console.log('Recibida solicitud para /getUsuarios');

  // Realiza una consulta SQL para obtener los usuarios
  const sql = `
    SELECT documento_identidad, nombre_completo, correo_electronico, contrasena, fecha_nacimiento, sexo
    FROM usuarios
  `;

  oracledb.getConnection(dbConfig, (err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos Oracle: ', err);
      res.status(500).send('Error al conectar a la base de datos');
      return;
    }

    connection.execute(sql, [], (err, result) => {
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${result.rows.map(row => `
              <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
                <td>
                  <button class="btn btn-primary" onclick="editarUsuario(${row[0]})">Editar</button>
                  <button class="btn btn-danger" onclick="eliminarUsuario(${row[0]})">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      res.send(htmlTable);
      
      connection.close((err) => {
        if (err) {
          console.error('Error al cerrar la conexión a la base de datos: ', err);
        }
      });
    });
  });
});






//-------------------------------------------------------------------------------------------------------------------


// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor Node.js escuchando en el puerto ${port}`);
});
