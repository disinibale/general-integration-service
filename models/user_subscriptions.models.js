module.exports = (sequelize, Sequelize) => {
    const TableName = sequelize.define("user_subscriptions", {
        id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING,
        },
        sub_id: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        phone_number: {
            type: Sequelize.STRING,
        },
        chat_mode: {
            type: Sequelize.STRING,
        },
        role: {
            type: Sequelize.STRING,
        },
        workspace_name: {
            type: Sequelize.STRING,
        },
        auto_assign: {
            type: Sequelize.BOOLEAN,
        },
        view_assign_only: {
            type: Sequelize.BOOLEAN,
        },
        limited_channel: {
            type: Sequelize.BOOLEAN,
        },
        enabled_channel: {
            type: Sequelize.JSONB,
        },
        limited_menu: {
            type: Sequelize.BOOLEAN,
        },
        enabled_menu: {
            type: Sequelize.JSONB,
        },
        register_time: {
            type: Sequelize.BIGINT,
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        }
    })

    return TableName;
};