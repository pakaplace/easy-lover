module.exports = (sequelize, DataTypes) => {
  const Surve3y = sequelize.define(
    "Survey",
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(256),
        field: "name",
        allowNull: false
      },
      status: {
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
      tableName: "Survey",
      timestamps: true
    }
  );

  Survey.associate = model => {
    const { User, Response } = model;

    Survey.hasMany(Response, {
      as: "responses",
      foreignKey: "surveyId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  return Survey;
};

//HasOne inserts the association key in target model whereas BelongsTo inserts the association key in the source model.
