import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    hotels: (
      parent: any,
      args: { limit?: number; offset?: number; searchTerm?: string }
    ) => {
      const where: Prisma.HotelWhereInput = args.searchTerm
        ? {
            OR: [
              { name: { contains: args.searchTerm, mode: 'insensitive' } },
              {
                location: { contains: args.searchTerm, mode: 'insensitive' },
              },
            ],
          }
        : {};
      return prisma.hotel.findMany({
        take: args.limit,
        skip: args.offset,
        where,
      });
    },
    totalHotels: (parent: any, args: { searchTerm?: string }) => {
      const where: Prisma.HotelWhereInput = args.searchTerm
        ? {
            OR: [
              { name: { contains: args.searchTerm, mode: 'insensitive' } },
              {
                location: { contains: args.searchTerm, mode: 'insensitive' },
              },
            ],
          }
        : {};
      return prisma.hotel.count({ where });
    },
    hotel: (parent: any, args: { id: string }) => {
      return prisma.hotel.findUnique({
        where: { id: args.id },
      });
    },
  },
  Mutation: {
    createHotel: (
      parent: any,
      args: { name: string; location: string; description?: string }
    ) => {
      return prisma.hotel.create({
        data: {
          name: args.name,
          location: args.location,
          description: args.description,
        },
      });
    },
    updateHotel: (
      parent: any,
      args: { id: string; name?: string; location?: string; description?: string }
    ) => {
      const { id, ...data } = args;
      return prisma.hotel.update({
        where: { id },
        data,
      });
    },
    deleteHotel: (parent: any, args: { id: string }) => {
      return prisma.hotel.delete({
        where: { id: args.id },
      });
    },
  },
};
