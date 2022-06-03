import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { UserModel } from "../../data/models/UserModel";
import { WithId } from "mongodb";
import { celebrate, Joi, Segments } from "celebrate";

export default () => {
  let api = Router();
  api.post(
    "/auth/login",
    celebrate({
      [Segments.BODY]: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req, res) => {
      const { username, password } = req.body;
      const user = await validateUser(username);
      console.log(user);
      if (user) {
        if (user.attemptsCount >= 3) {
          res.status(200).json({
            code: 200,
            status: false,
            data: null,
            error: "Su cuenta ha sido bloqueada",
          });
          return;
        }

        if (user.password === password) {
          await resetCount(user);
          res.status(200).json({
            code: 200,
            status: true,
            data: user,
            error: null,
          });
        } else {
          await increaseCount(user);
          res.status(200).json({
            code: 200,
            status: false,
            data: null,
            error: "Contraseña incorrecta, reintentos: " + user.attemptsCount,
          });
        }
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: null,
          error: `El usuario ${username} no existe`,
        });
      }
    }
  );

  return api;
};

const validateUser = async (username: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>("user")
    .findOne({ username });
};

const increaseCount = async (user: WithId<UserModel>) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>("user")
    .updateOne(
      { _id: user._id },
      { $set: { attemptsCount: user.attemptsCount + 1 } }
    );
};

const resetCount = async (user: WithId<UserModel>) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>("user")
    .updateOne({ _id: user._id }, { $set: { attemptsCount: 0 } });
};
