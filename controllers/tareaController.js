import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

//*************************************************** */
const agregarTarea = async (req, res) => {
  const { nombre, descripcion, fechaEntrega, prioridad, proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error("El Proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(404).json({ msg: error.message });
  }
  try {
    const tareaAlmacenada = await Tarea.create({
      nombre,
      descripcion,
      fechaEntrega,
      prioridad,
      proyecto,
    });

    //Amlacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

//*************************************************** */

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("Tarea no Encontrada");
      return res.status(404).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción no permitida");
      return res.status(403).json({ msg: error.message });
    }
    res.json(tarea);
  } else {
    const error = new Error("Tarea No encontrada");
    return res.status(404).json({ msg: error.message });
  }
};

//*************************************************** */
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("Tarea no Encontrada");
      return res.status(404).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción no permitida");
      return res.status(403).json({ msg: error.message });
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
    try {
      const tareaAlmacenada = await tarea.save();
      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Tarea No encontrada");
    return res.status(404).json({ msg: error.message });
  }
};

//*************************************************** */

const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const tarea = await Tarea.findById(id).populate("proyecto");
    console.log(tarea);
    if (!tarea) {
      const error = new Error("Tarea no Encontrada");
      return res.status(404).json({ msg: error.message });
    }
    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
      const error = new Error("Acción no permitida");
      return res.status(403).json({ msg: error.message });
    }

    try {
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id);
      await Promise.allSettled([
        await proyecto.save(),
        await tarea.deleteOne(),
      ]);
      res.json({ msg: "La Tarea se eliminó" });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Tarea No encontrada");
    return res.status(404).json({ msg: error.message });
  }
};

//*************************************************** */

const cambiarEstado = async (req, res) => {
  const { id } = req.params;

  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const tarea = await Tarea.findById(id).populate("proyecto");

    if (!tarea) {
      const error = new Error("Tarea no Encontrada");
      return res.status(404).json({ msg: error.message });
    }

    if (
      tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
      !tarea.proyecto.colaboradores.some(
        (colaborador) =>
          colaborador._id.toString() === req.usuario._id.toString()
      )
    ) {
      const error = new Error("Acción no permitida");
      return res.status(403).json({ msg: error.message });
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();
    const tareaAlmacenada = await Tarea.findById(id)
      .populate("proyecto")
      .populate("completado");
    res.json(tareaAlmacenada);
  }
};
export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
