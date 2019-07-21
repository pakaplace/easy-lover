module.exports = (sequelize, DataTypes) => {
  const Interaction = sequelize.define(
    "Interaction",
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
      fromUserId: {
        type: DataTypes.UUID,
        field: "fromUserId",
        allowNull: false,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      toUserId: {
        type: DataTypes.UUID,
        field: "toUserId",
        allowNull: false,
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION"
      },
      compatibilityScore: {
        type: DataTypes.INTEGER,
        field: "compatibilityScore",
        allowNull: true
      }
      // question1: {
      //   type: DataTypes.INTEGER,
      //   field: "question1",
      //   allowNull: true
      // },
      // question2: {
      //   type: DataTypes.INTEGER,
      //   field: "question2",
      //   allowNull: true
      // },
      // question3: {
      //   type: DataTypes.INTEGER,
      //   field: "question3",
      //   allowNull: true
      // },
      // question4: {
      //   type: DataTypes.STRING(256),
      //   field: "question4",
      //   allowNull: true
      // }
    },
    {
      schema: "public",
      tableName: "Interaction",
      timestamps: true
    }
  );

  Interaction.associate = model => {
    const { Survey, User } = model;

    Interaction.belongsTo(Survey, {
      as: "Survey",
      foreignKey: "surveyId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
    Interaction.belongsTo(User, {
      as: "FromUser",
      foreignKey: "userId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
    Interaction.belongsTo(User, {
      as: "ToUser",
      foreignKey: "userId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  return Interaction;
};
