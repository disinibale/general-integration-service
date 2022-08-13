module.exports = (sequelize, Sequelize, dbName) => {
    const TableName = sequelize.define(dbName, {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      phone_number_show: {
        type: Sequelize.STRING,
      },
      profile_picture: {
        type: Sequelize.STRING,
      },
      instance_id: {
        type: Sequelize.STRING,
      },
      sync_firestore: {
        type: Sequelize.BOOLEAN,
      },
      unread_count: {
        type: Sequelize.INTEGER,
      },
      roomId: {
        type: Sequelize.STRING,
      },
      assign_to: {
        type: Sequelize.JSONB,
      },
      pinned: {
        type: Sequelize.BOOLEAN,
      },
      last_interaction: {
        type: Sequelize.JSONB,
      },
      archived: {
        type: Sequelize.BOOLEAN,
      },
      roomStatus: {
        type: Sequelize.STRING,
      },
      unreplied: {
        type: Sequelize.BOOLEAN,
      },
      last_reply: {
        type: Sequelize.BIGINT,
      },
      last_message: {
        type: Sequelize.BIGINT,
      },
      lastMessage: {
        type: Sequelize.JSONB,
      },
      message_from_me: {
        type: Sequelize.BIGINT,
      },
      roomName: {
        type: Sequelize.STRING,
      },
      roomOwnerId: {
        type: Sequelize.STRING,
      },
      roomOwnerName: {
        type: Sequelize.STRING,
      },
      subId: {
        type: Sequelize.STRING,
      },
      users: {
        type: Sequelize.JSONB,
      },
      notes: {
        type: Sequelize.JSONB,
      },
      subId: {
        type: Sequelize.STRING,
      },
      channel_source: {
        type: Sequelize.STRING,
      },
      last_message_status: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    }, { 
      indexes: [
      {
        name: `${dbName}_last_message_not_null`,
        fields: ['lastMessage'],
        where: {
          lastMessage: { 
            [Sequelize.Op.ne]: null
          }
        },
      },
      {
        name: `${dbName}_roomId`,
        fields: ['roomId'],
      },
      {
        name: `${dbName}_channel_source`,
        fields: ['channel_source'],
      },
      {
        name: `${dbName}_instance_id`,
        fields: ['instance_id'],
      },
    ]})
  
    return TableName;
  };