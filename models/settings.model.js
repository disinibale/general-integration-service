module.exports = (sequelize, Sequelize, dbName) => {
    const TableName = sequelize.define(dbName, {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.JSONB,
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
        name: `${dbName}_key`,
        fields: ['key'],
      }
    ]})
  
    return TableName;
  };