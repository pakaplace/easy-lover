module.exports = (sequelize, DataTypes) => {
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
        type: DataTypes.STRING(256),
        field: "name",
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        field: "userId",
        allowNull: false,
        // references: {
        //   model: "User",
        //   key: "id"
        // },
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      idNumber: {
        type: DataTypes.STRING(256),
        field: "idNumber",
        allowNull: false
      },
      answersJson: {
        // Array of question answers in sequential order. We can return the string of the answer, or a numerical representation.
        // {answers: ["Blue", "Gin"]} }
        type: DataTypes.STRING(256),
        field: "questionsJson",
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
      foreignKey: "responseId",
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
