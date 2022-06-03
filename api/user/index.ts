import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { collections } from "../../core/constants";
import { ObjectId } from "mongodb";
import { celebrate, Joi, Segments } from "celebrate";
import { UserModel } from "../../data/models/UserModel";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

const bodySchema = Joi.object<UserModel>().keys({
  name: Joi.string().required(),
  isAdmin: Joi.boolean().required(),
  attemptsCount: Joi.number().required(),
  isBlocked: Joi.boolean().required(),
  password: Joi.string().required(),
  username: Joi.string().required(),
});

export default () => {
  let api = Router();
  api.get("/user", async (req, res) => {
    const _ = await getUsers();
    res.status(200).json({
      code: 200,
      status: true,
      data: _,
      error: null,
    });
  });

  api.get(
    "/user/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const table = await getUser(req.params.id);
      res.status(200).json({
        code: 200,
        status: true,
        data: table,
        error: null,
      });
    }
  );

  api.delete(
    "/user/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const _ = await deleteUser(req.params.id);
      if (_.deletedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `User ${req.params.id} deleted successfully`,
          error: null,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: null,
          error: `User ${req.params.id} not found`,
        });
      }
    }
  );

  api.put(
    "/user/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await updateUser(req.params.id, req.body);
      if (_.modifiedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `User ${req.params.id} updated successfully`,
          error: null,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: null,
          error: `User ${req.params.id} not found`,
        });
      }
    }
  );

  api.post(
    "/user",
    celebrate({
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await createUser(req.body);
      res.status(200).json({
        code: 200,
        status: true,
        data: _.insertedId,
        error: null,
      });
    }
  );

  return api;
};

async function getUsers() {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>(collections.user)
    .find()
    .toArray();
}

async function getUser(id: string) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>(collections.user)
    .findOne({ _id: new ObjectId(id) });
}

async function deleteUser(id: string) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>(collections.user)
    .deleteOne({ _id: new ObjectId(id) });
}

async function updateUser(id: string, user: UserModel) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>(collections.user)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...user } });
}

async function createUser(user: UserModel) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<UserModel>(collections.user)
    .insertOne(user);
}
