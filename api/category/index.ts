import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { CategoryModel } from "../../data/models/CategoryModel";
import { collections } from "../../core/constants";
import { ObjectId } from "mongodb";
import { celebrate, Joi, Segments } from "celebrate";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

const bodySchema = Joi.object<CategoryModel>().keys({
  name: Joi.string().required(),
  imageUrl: Joi.string().required(),
});

export default () => {
  let api = Router();
  api.get("/category", async (req, res) => {
    const categories = await getCategories();
    res.status(200).json({
      code: 200,
      status: true,
      data: categories,
      error: null,
    });
  });

  api.delete(
    "/category/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const deletedTable = await deleteCategory(req.params.id);
      if (deletedTable.deletedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Category ${req.params.id} deleted successfully`,
          error: null,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: null,
          error: `Category ${req.params.id} not found`,
        });
      }
    }
  );

  api.put(
    "/category/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const updatedTable = await updateCategory(req.params.id, req.body);
      if (updatedTable.modifiedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Category ${req.params.id} updated successfully`,
          error: null,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: null,
          error: `Category ${req.params.id} not found`,
        });
      }
    }
  );

  api.post(
    "/category",
    celebrate({
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const created = await createCategory(req.body);
      res.status(200).json({
        code: 200,
        status: true,
        data: created.insertedId,
        error: null,
      });
    }
  );

  return api;
};

const getCategories = async () => {
  try {
    const client = await clientPromise;
    return client
      .db(process.env.MONGODB_DB)
      .collection<CategoryModel>(collections.category)
      .find()
      .toArray();
  } catch (e) {
    console.error(e);
    return [];
  }
};

const deleteCategory = async (id: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<CategoryModel>(collections.category)
    .deleteOne({ _id: new ObjectId(id) });
};

const updateCategory = async (id: string, category: CategoryModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<CategoryModel>(collections.category)
    .updateOne({ _id: new ObjectId(id) }, { $set: category });
};

const createCategory = async (category: CategoryModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<CategoryModel>(collections.category)
    .insertOne(category);
};
