import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

//Configurar CORS

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      //Puede Consultar la api
      callback(null, true);
    } else {
      //No esta permitido su request
      callback(new Error("Error de Cors"));
    }
  },
};
app.use(cors(corsOptions));
//Routing

app.use("/api/usuarios/", usuarioRoutes);
app.use("/api/proyectos/", proyectoRoutes);
app.use("/api/tareas/", tareaRoutes);

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {});

//sockey.io

import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: { origin: process.env.FRONTEND_URL },
});

io.on("connection", (socket) => {
  //Definir los eventos de socket io
  socket.on("abrir proyecto", (idProyecto) => {
    socket.join(idProyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    socket.to(tarea.proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tareaEliminada) => {
    const proyecto = tareaEliminada.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tareaEliminada);
  });
  socket.on("editar tarea", (tareaEditada) => {
    const proyecto = tareaEditada.proyecto._id;
    socket.to(proyecto).emit("tarea editada", tareaEditada);
  });
  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
