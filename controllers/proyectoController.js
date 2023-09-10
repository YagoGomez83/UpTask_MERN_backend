import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";
//******************************************************* */

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      {
        colaboradores: { $in: req.usuario },
      },
      {
        creador: { $in: req.usuario },
      },
    ],
  }).select("-tareas");

  res.json(proyectos);
};

//********************************************** */

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoAlmacenado = await proyecto.save();
    res.json({ proyectoAlmacenado });
  } catch (error) {
    console.log(error);
  }
};

//***************************************************** */

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const proyecto = await Proyecto.findById(id.trim())
      .populate({
        path: "tareas",
        populate: { path: "completado", select: "nombre" },
      })
      .populate("colaboradores", "nombre email");

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }
    if (
      proyecto.creador.toString() !== req.usuario._id.toString() &&
      !proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("No tienes los permisos");
      return res.status(401).json({
        msg: error.message,
      });
    }

    res.json(proyecto);
  } else {
    const error = new Error("Proyecto no encontrado");
    res.status(401).json({
      msg: error.message,
    });
  }
};

//************************************************* */

const editarProyecto = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const proyecto = await Proyecto.findById(id.trim());

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos");
      return res.status(401).json({
        msg: error.message,
      });
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;
    try {
      const proyectoAlmacenado = await proyecto.save();
      res.json(proyectoAlmacenado);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Proyecto no encontrado");
    res.status(401).json({
      msg: error.message,
    });
  }
};

//****************************************************** */

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const proyecto = await Proyecto.findById(id.trim());

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("No tienes los permisos");
      return res.status(401).json({
        msg: error.message,
      });
    }

    try {
      await proyecto.deleteOne();
      res.json({ msg: "Proyecto Eliminado" });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Proyecto no encontrado");
    res.status(401).json({
      msg: error.message,
    });
  }
};

//********************************** */
const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createdAt -updatedAt -password -token -__v"
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};
//***************************************** */
const agregarColaborador = async (req, res) => {
  const { id } = req.params;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción No valida");
      return res.status(404).json({
        msg: error.message,
      });
    }
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select(
      "-confirmado -createdAt -updatedAt -password -token -__v"
    );
    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ msg: error.message });
    }

    //El colaborador no el creador del Proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
      const error = new Error(
        "El creador del Proyecto no puede ser colaborador"
      );
      return res.status(404).json({ msg: error.message });
    }

    //Revisar que no este agregado al proyecto

    if (proyecto.colaboradores.includes(usuario._id)) {
      const error = new Error("El usuario ya pertenece al proyecto");
      return res.status(404).json({ msg: error.message });
    }

    //Si todo esta bien

    proyecto.colaboradores.push(usuario._id);
    await proyecto.save();
    res.json({
      msg: "Colaborador Agregado Correctamente",
    });
  } else {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({
      msg: error.message,
    });
  }
};

//*********************************************** */

const eliminarColaborador = async (req, res) => {
  const { id } = req.params;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({
        msg: error.message,
      });
    }
    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción No valida");
      return res.status(404).json({
        msg: error.message,
      });
    }

    // Si todo esta bien se puede eliminar
    proyecto.colaboradores.pull(req.body.id);

    await proyecto.save();
    res.json({
      msg: "Colaborador Eliminado Correctamente",
    });
  } else {
    const error = new Error("Proyecto no encontrado");
    return res.status(404).json({
      msg: error.message,
    });
  }
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
