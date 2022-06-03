import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { collections } from "../../core/constants";
import { ObjectId } from "mongodb";
import { celebrate, Joi, Segments } from "celebrate";
import { PlateModel } from "../../data/models/PlateModel";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

const bodySchema = Joi.object<PlateModel>().keys({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  code: Joi.string().required(),
  categoryId: idSchema,
});

export default () => {
  let api = Router();

  api.get("/plate", async (req, res) => {
    const plates = await getPlates();
    res.status(200).json({
      code: 200,
      status: true,
      data: plates,
    });
  });

  api.delete(
    "/plate/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const _ = await deletePlate(req.params.id);
      if (_.deletedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Plate ${req.params.id} deleted successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Plate ${req.params.id} not found`,
        });
      }
    }
  );

  api.put(
    "/plate/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await updatePlate(req.params.id, req.body);
      if (_.modifiedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Plate ${req.params.id} updated successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Plate ${req.params.id} not found`,
        });
      }
    }
  );

  api.post(
    "/plate",
    celebrate({
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await createPlate(req.body);
      res.status(200).json({
        code: 200,
        status: true,
        data: _.insertedId,
      });
    }
  );

  return api;
};

const getPlates = async () => {
  try {
    const client = await clientPromise;
    return client
      .db(process.env.MONGODB_DB)
      .collection<PlateModel>(collections.plate)
      .find()
      .toArray();
  } catch (e) {
    console.error(e);
    return [];
  }
};

const deletePlate = async (id: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<PlateModel>(collections.plate)
    .deleteOne({ _id: new ObjectId(id) });
};

const updatePlate = async (id: string, plate: PlateModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<PlateModel>(collections.plate)
    .updateOne({ _id: new ObjectId(id) }, { $set: plate });
};

const createPlate = async (plate: PlateModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<PlateModel>(collections.plate)
    .insertOne(plate);
};
