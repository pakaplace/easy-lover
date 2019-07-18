const { responseTypeEnum } = require("../enum/DataTypeEnum");

module.exports = (sequelize, DataTypes) => {
  console.log(responseTypeEnum);
  const Response = sequelize.define(
    "Response",
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      surveyId: {
        type: DataTypes.INTEGER,
        field: "surveyId",
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        field: "userId",
        allowNull: true,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      answersJson: {
        // Array of question answers in sequential order. We can return the string of the answer, or a numerical representation.
        // {answers: ["Blue", "Gin"]} }
        type: DataTypes.JSONB,
        field: "answersJson",
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM,
        values: Object.values(responseTypeEnum),
        field: "type",
        allowNull: false
      }
    },
    {
      schema: "public",
      tableName: "Response",
      timestamps: true
    }
  );

  Response.associate = model => {
    const { Survey, User } = model;

    Response.belongsTo(Survey, {
      as: "Survey",
      foreignKey: "surveyId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
    Response.belongsTo(User, {
      as: "User",
      foreignKey: "userId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  return Response;
};
