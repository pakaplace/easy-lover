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
        type: DataTypes.STRING(256),
        field: "status",
        allowNull: false
      },
      idNumber: {
        type: DataTypes.STRING(256),
        field: "idNumber",
        allowNull: false
      },
      questionsJson: {
        type: DataTypes.STRING(256),
        field: "questionsJson",
        allowNull: false,
        unique: true
      }
    },
    {
      schema: "public",
      tableName: "Response",
      timestamps: true
    }
  );

  Response.associate = model => {
    const { Survey } = model;

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
