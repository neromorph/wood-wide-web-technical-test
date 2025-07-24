"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.typeDefs = (0, graphql_tag_1.default) `
  type Hotel {
    id: ID!
    name: String!
    location: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    hotels(limit: Int, offset: Int, searchTerm: String): [Hotel!]!
    totalHotels(searchTerm: String): Int!
    hotel(id: ID!): Hotel
  }

  type Mutation {
    createHotel(name: String!, location: String!, description: String): Hotel!
    updateHotel(id: ID!, name: String, location: String, description: String): Hotel
    deleteHotel(id: ID!): Hotel
  }
`;
