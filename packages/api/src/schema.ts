import gql from 'graphql-tag';

export const typeDefs = gql`
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
