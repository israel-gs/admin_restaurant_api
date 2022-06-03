import { Router } from "express";
import clientPromise from "../../data/db/mongodb";
import { collections } from "../../core/constants";
import { ObjectId } from "mongodb";
import { celebrate, Joi, Segments } from "celebrate";
import { OrderModel } from "../../data/models/OrderModel";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

const bodySchema = Joi.object<OrderModel>().keys({
  userId: idSchema,
  tableId: idSchema,
  date: Joi.date().required(),
  tip: Joi.number().required(),
  plates: Joi.array().items(
    Joi.object().keys({
      plate: Joi.object().keys({
        name: Joi.string().required(),
        price: Joi.number().required(),
        description: Joi.string().required(),
        code: Joi.string().required(),
        categoryId: idSchema,
      }),
      quantity: Joi.number().required(),
    })
  ),
  orderClosed: Joi.boolean().required(),
});

export default () => {
  let api = Router();

  api.get("/order", async (req, res) => {
    const _ = await getOrders();
    res.status(200).json({
      code: 200,
      status: true,
      data: _,
    });
  });

  api.get(
    "/order/user/:userId",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        userId: idSchema,
      }),
    }),
    async (req, res) => {
      const _ = await getOrderByUserId(req.params.userId);
      if (_) {
        res.status(200).json({
          code: 200,
          status: true,
          data: _,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Orders with User ${req.params.userId} not found`,
        });
      }
    }
  );

  api.get(
    "/order/table/:tableId",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        tableId: idSchema,
      }),
    }),
    async (req, res) => {
      const _ = await getActiveOrderByTableId(req.params.tableId);
      if (_) {
        res.status(200).json({
          code: 200,
          status: true,
          data: _,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Orders with Table ${req.params.tableId} not found`,
        });
      }
    }
  );

  api.delete(
    "/order/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
    }),
    async (req, res) => {
      const _ = await deleteOrder(req.params.id);
      if (_.deletedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Order ${req.params.id} deleted successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Order ${req.params.id} not found`,
        });
      }
    }
  );

  api.put(
    "/order/:id",
    celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        id: idSchema,
      }),
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await updateOrder(req.params.id, req.body);
      if (_.modifiedCount === 1) {
        res.status(200).json({
          code: 200,
          status: true,
          data: `Order ${req.params.id} updated successfully`,
        });
      } else {
        res.status(200).json({
          code: 200,
          status: false,
          data: `Order ${req.params.id} not found`,
        });
      }
    }
  );

  api.post(
    "/order",
    celebrate({
      [Segments.BODY]: bodySchema,
    }),
    async (req, res) => {
      const _ = await createOrder(req.body);
      res.status(200).json({
        code: 200,
        status: true,
        data: _.insertedId,
      });
    }
  );

  return api;
};

const getOrders = async () => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .find()
    .toArray();
};

const getOrderByUserId = async (userId: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .findOne({ userId: new ObjectId(userId) });
};

const getActiveOrderByTableId = async (tableId: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .findOne({ tableId: new ObjectId(tableId), orderClosed: false });
};

const deleteOrder = async (id: string) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .deleteOne({ _id: new ObjectId(id) });
};

const updateOrder = async (id: string, order: OrderModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .updateOne({ _id: new ObjectId(id) }, { $set: order });
};

const createOrder = async (order: OrderModel) => {
  const client = await clientPromise;
  return client
    .db(process.env.MONGODB_DB)
    .collection<OrderModel>(collections.order)
    .insertOne(order);
};
