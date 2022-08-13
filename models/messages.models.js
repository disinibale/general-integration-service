/* eslint-disable */
module.exports = (sequelize, Sequelize, dbName) => {
  const TableName = sequelize.define(
    dbName,
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      chatId: {
        type: Sequelize.STRING,
      },
      dbRoomId: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.TEXT,
      },
      files: {
        type: Sequelize.JSONB,
      },
      original_message: {
        type: Sequelize.JSONB,
      },
      data: {
        type: Sequelize.JSONB,
      },
      fromMe: {
        type: Sequelize.BOOLEAN,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
      },
      sender_id: {
        type: Sequelize.STRING,
      },
      sender_name: {
        type: Sequelize.STRING,
      },
      source_id: {
        type: Sequelize.STRING,
      },
      timestamp: {
        type: Sequelize.JSONB,
      },
      distributed: {
        type: Sequelize.BOOLEAN,
      },
      seen: {
        type: Sequelize.BOOLEAN,
      },
      seen_by: {
        type: Sequelize.JSONB,
      },
      replyMessage: {
        type: Sequelize.JSONB,
      },
      content_notification: {
        type: Sequelize.TEXT,
      },
      couch_timestamp: {
        type: Sequelize.BIGINT,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    },
    {
      indexes: [
        {
          name: `${dbName}_couch_timestamp`,
          fields: ["couch_timestamp"],
        },
        {
          name: `${dbName}_dbRoomId`,
          fields: ["dbRoomId"],
        },
      ],
    }
  );

  return TableName;
};
