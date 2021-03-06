module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
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
        allowNull: true
      },
      idNumber: {
        type: DataTypes.STRING(256),
        field: "idNumber",
        allowNull: true
      },
      questionsJson: {
        // Store each question's text and an array of options.
        //   {
        //     questions: [
        //     {
        //       text: "What is your favorite color?",
        //       options: ["Blue", "Yellow", "Green", "Red"]
        //     },
        //     {
        //       text: "What is your favorite alcohol?",
        //       options: ["Beer", "Wine", "Vermouth", "Gin"]
        //     }
        //   ]
        // }
        type: DataTypes.JSONB,
        field: "questionsJson",
        allowNull: false,
        unique: false
      }
    },
    {
      schema: "public",
      tableName: "Survey",
      timestamps: true
    }
  );

  Survey.associate = model => {
    const { Response } = model;
    Survey.hasMany(Response, {
      as: "responses",
      foreignKey: "responseId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  return Survey;
};

//HasOne inserts the association key in target model whereas BelongsTo inserts the association key in the source model.
