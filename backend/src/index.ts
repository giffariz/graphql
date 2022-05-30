import { Sequelize } from "sequelize";
import {
  initModels,
  product,
  order,
  orderdetail,
  productCreationAttributes,
  orderCreationAttributes,
  orderdetailCreationAttributes,
} from "./models/init-models";
import * as dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server";
import { readFileSync } from "fs";
import { randomBytes, randomInt } from "crypto";

const typeDefs = readFileSync("./src/schema.graphql").toString("utf-8");

dotenv.config();

const sequelize = new Sequelize("graphqlorder", "root", "", {
  host: process.env.DB_HOST as string,
  dialect: "mysql",
});

initModels(sequelize);

const resolvers = {
  Query: {
    products: async () => await product.findAll(),
    orders: async () => await order.findAll(),
  },
  Mutation: {
    GetDetailProduct: async (_parent: any, args: any) => {
      return await product.findByPk(args.id);
    },
    CreateProduct: async (_parent: any, args: any) => {
      const newProduct: productCreationAttributes = {
        name: args.name,
        stock: args.stock,
        price: args.price,
        created: new Date(),
      };
      return await product.create(newProduct);
    },
    UpdateProduct: async (_parent: any, args: any) => {
      const updProduct = await product.findByPk(args.id);
      updProduct?.set("name", args.name);
      updProduct?.set("stock", args.stock);
      updProduct?.set("price", args.price);
      return updProduct?.save();
    },
    DeleteProduct: async (_parent: any, args: any) => {
      await product.destroy({
        where: { id: args.id },
      });

      return await product.findAll();
    },
    GetDetailOrder: async (_parent: any, args: any) => {
      return await order.findByPk(args.id);
    },
    CreateOrder: async (_parent: any, args: any) => {
        const Product = await product.findByPk(args.produkId);

      const newOrder: orderCreationAttributes = {
        transcode: randomBytes(10).toString("hex"),
        created: new Date(),
      };
      await order.create(newOrder);

      const newDetail: orderdetailCreationAttributes = {
        productid: args.productId,
        quantity: args.quantity,
        price: Product!.price,
        Order_id: newOrder.id!,
      };
      await orderdetail.create(newDetail)
      
      return await order.findByPk(newOrder.id);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
