import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { TableModel } from "../../data/models/TableModel";
import { collections } from "../../core/constants";
import { ObjectId } from "mongodb";
import { celebrate, Joi, errors, Segments } from "celebrate";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

const bodySchema = Joi.object<TableModel>().keys({
  name: Joi.string().required(),
  isTaken: Joi.boolean().required(),
});

export default () => {
  let api = Router();
  api.get("/table", async (req, res) => {
    const tables = await getTables();
    res.status(200).json({
      code: 200,
      status: true,
      data: tables,
    });
  });

  api.get(
    "/table/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const table = await getTable(req.params.id);
      res.status(200).json({
        code: 200,
        status: true,
        data: table,
      });
    }
  );

  api.delete(
    "/table/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const deletedTable = await deleteTable(req.params.id);
      if (deletedTable.deletedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Table ${req.params.id} deleted successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Table ${req.params.id} not found`,
        });
      }
    }
  );

  api.put(
    "/table/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const updatedTable = await updateTable(req.params.id, req.body);
      if (updatedTable.modifiedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Table ${req.params.id} updated successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Table ${req.params.id} not found`,
        });
      }
    }
  );

  api.post(
    "/table",
    celebrate({
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const createdTable = await createTable(req.body);
      res.status(200).json({
        code: 200,
        status: true,
        data: createdTable.insertedId,
      });
    }
  );

  return api;
};

async function getTables() {
  try {
    const client = await clientPromise;
    return client
      .db(process.env.MONGODB_DB)
      .collection<TableModel>(collections.table)
      .find()
      .toArray();
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getTable(id: string) {
  try {
    const client = await clientPromise;
    return client
      .db(process.env.MONGODB_DB)
      .collection<TableModel>(collections.table)
      .findOne({ _id: new ObjectId(id) });
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function deleteTable(id: string) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<TableModel>(collections.table)
    .deleteOne({ _id: new ObjectId(id) });
}

async function updateTable(id: string, table: TableModel) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<TableModel>(collections.table)
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...table } });
}

async function createTable(table: TableModel) {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<TableModel>(collections.table)
    .insertOne(table);
}
