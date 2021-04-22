const { ApolloServer } = require("apollo-server");
const { MongoClient } = require("mongodb");
const typeDefs = require("./shema/Schema");
const resolvers = require("./shema/resolvers");

require("dotenv").config();
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_URL = `mongodb+srv://Admin:${MONGO_PASS}@cluster0.elolo.mongodb.net/trips`;
const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });
client.connect();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const db = client.db().collection("trips");
    return { db };
  },
});
(async function () {
  try {
    const { url } = await server.listen();
    console.log(`🚀 Server is ready at  ${url}`);
  } catch (error) {
    console.log(error);
  }
})();
