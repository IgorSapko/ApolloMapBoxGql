const { gql } = require("apollo-server");
const typeDefs = gql`
type Query {
    trips(offset: Int, limit: Int): [Trip]
  }

  type Mutation {
    createTrip(input: CreateTripInput!): Trip
  }

  type Trip {
    id: ID!
    fromPlace: Location!
    toPlace: Location!
  }

  type Location {
    id: String
    name: String!
  }

  input CreateTripInput {
    fromPlaceName: String!
    toPlaceName: String! 
  }`

module.exports = typeDefs;