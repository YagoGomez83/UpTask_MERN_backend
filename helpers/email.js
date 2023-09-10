import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del Email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuenta@uptask.com> ',
    to: email,
    subject: "UpTask - Confirma tu cuenta",
    text: "Comprueba tu cuenta en UpTask",
    html: `<p>Hola: ${nombre} Comprueba tu cuenta en Uptask</p>
    <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
    <p>Si tu no creaste esta cuenta ignora este mensaje</p>
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Información del Email

  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuenta@uptask.com> ',
    to: email,
    subject: "UpTask - Restablece tu password",
    text: "Restablece tu password",
    html: `<p>Hola: ${nombre} has solicitado restablecer tu password</p>
    <p>Sigue el siguiente enlace para generar un nuevo password:</p>
    <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password</a>
    <p>Si tu no solicitaste este email ignora este mensaje</p>
    `,
  });
};
