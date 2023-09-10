import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";
//*************************** */
const registrar = async (req, res) => {
  //Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email: email });
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }
  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();
    //Enviar el email de confirmación
    const { nombre, email, token } = usuario;
    emailRegistro({ nombre, email, token });
    res.json({
      msg: "Usuario creado Correctamente, Revisa tu Email para confirmar tu cuenta",
    });
  } catch (error) {
    console.log(error);
  }
};
//**************************** */
const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({
      msg: error.message,
    });
  }
  //comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error("El usuario no esta confirmado");
    return res.status(403).json({
      msg: error.message,
    });
  }
  //comprobar su passord
  if (await usuario.comprobaPassword(password)) {
    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El Password no es correcto");
    return res.status(403).json({
      msg: error.message,
    });
  }
};
//***************************** */
const confirmar = async (req, res) => {
  const { token } = req.params;
  const usaurioConfirmar = await Usuario.findOne({ token });
  if (!usaurioConfirmar) {
    const error = new Error("Token no valido");
    res.status(403).json({
      msg: error.message,
    });
  }
  try {
    usaurioConfirmar.confirmado = true;
    usaurioConfirmar.token = "";
    await usaurioConfirmar.save();
    res.status(200).json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

//*********************************** */
const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email: email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    res.status(404).json({
      msg: error.message,
    });
  }

  try {
    usuario.token = generarId();
    await usuario.save();
    //Enviar el email para recuperar la cuenta
    const { nombre, email, token } = usuario;
    emailOlvidePassword({ nombre, email, token });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};
//*************************** */
const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Usuario.findOne({ token });

  if (tokenValido) {
    res.json({ msg: "El token es valido y el usuario existe" });
  } else {
    const error = new Error("Token no valido");
    res.status(404).json({
      msg: error.message,
    });
  }
};

//************************************** */
const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ token });
  const { password } = req.body;
  if (usuario) {
    usuario.password = password;
    usuario.token = "";
    try {
      await usuario.save();
      res.json({ msg: "Password modificado correctameente" });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error("Token no valido");
    res.status(404).json({
      msg: error.message,
    });
  }
};

//****************** */

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
