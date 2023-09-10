import express from "express";

import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

//Area Publica

//Autenticación, Registro y confirmación de Usuarios
router.post("/", registrar); //Ruta donde se va a registrar el usuario
router.post("/login", autenticar); //Nos permite validar un usuario
router.get("/confirmar/:token", confirmar); // confirmar un usuario vía token
router.post("/olvide-password", olvidePassword); //Recuperar usuario via email y token
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

//Area Privada

router.get("/perfil", checkAuth, perfil);
export default router;
