import { models } from './db';

const setNewParent = async ({ id, newParentId }) => {
  let ticket = await models.Ticket.findByPk(id);

  ticket.parentId = newParentId;

  await ticket.save();

  return ticket;
};

export const resolvers = {
  Query: {
    ticket: async (root, args, context) => {
      return models.Ticket.findByPk(args.id);
    },

    tickets: async (root, args, context) => {
      return models.Ticket.findAll({ where: { parentId: null } });
    },
  },

  Ticket: {
    children: async (root, args, context) => {
      return models.Ticket.findAll({
        where: { parentId: root.dataValues.id },
      });
    },
  },

  Mutation: {
    createTicket: async (root, args, context) => {
      return models.Ticket.create(args);
    },

    updateTicket: async (root, args, context) => {
      let ticket = await models.Ticket.findByPk(args.id);

      ticket.title = args.title;

      await ticket.save();

      return ticket;
    },

    toggleTicket: async (root, args, context) => {
      let ticket = await models.Ticket.findByPk(args.id);

      ticket.isCompleted = args.isCompleted;

      await ticket.save();

      return ticket;
    },

    removeTicket: async (root, args, context) => {
      let ticket = await models.Ticket.findByPk(args.id);

      if (!ticket) {
        return false;
      }

      await ticket.destroy();

      return true;
    },

    addChildrenToTicket: async (root, args, context) => {
      args.childrenIds.map(async (id) => {
        await models.Ticket.update(
          { parentId: args.parentId },
          { where: { id } }
        );
      });

      let parent = await models.Ticket.findByPk(args.parentId);
      return parent;
    },

    setParentOfTicket: async (root, args, context) => {
      return setNewParent({ id: args.childId, newParentId: args.parentId });
    },

    removeParentFromTicket: async (root, args, context) => {
      return setNewParent({ id: args.id, newParentId: null });
    },
  },
};
