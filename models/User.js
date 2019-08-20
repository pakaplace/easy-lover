module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        field: "id",
        allowNull: false,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING(256),
        field: "firstName",
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(256),
        field: "lastName",
        allowNull: false
      },
      gender: {
        type: DataTypes.STRING(256),
        field: "gender",
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(256),
        field: "email",
        allowNull: true,
        unique: false
      },
      phoneNumber: {
        type: DataTypes.STRING(256),
        field: "phoneNumber",
        allowNull: false,
        unique: true
      }
    },
    {
      schema: "public",
      tableName: "User",
      timestamps: true
    }
  );

  User.associate = model => {
    const { Response } = model;
    User.hasMany(Response, {
      as: "Responses",
      foreignKey: "userId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  return User;
};
