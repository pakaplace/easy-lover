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
      email: {
        type: DataTypes.STRING(256),
        field: "email",
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
      foreignKey: "responseId",
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    });
  };

  // User.hook("afterCreate", async user => {
  //   const { Portfolio } = sequelize.models;
  //   const { id: portfolioId } = await Portfolio.create({ userId: user.id });
  //   user.portfolioId = portfolioId;
  //   const updatedUser = await User.update(
  //     { portfolioId },
  //     { where: { id: user.id }, returning: true }
  //   );
  //   return updatedUser[1];
  // });

  // User.hook("afterDestroy", async user => {
  //   const { Portfolio } = sequelize.models;
  //   await Portfolio.destroy({ where: { userId: user.id } });
  //   user.portfolioId = null;
  //   await user.save();
  //   return user;
  // });

  // User.hook("beforeBulkDestroy", async options => {
  //   const user = await User.findByPk(options.where.id);
  //   user.portfolioId = null;
  //   await user.save();
  // });

  // User.hook("afterBulkDestroy", async options => {
  //   const { Portfolio } = sequelize.models;
  //   await Portfolio.destroy({ where: { userId: options.where.id } });
  // });

  // User.addScope("withImage", () => ({
  //   include: {
  //     model: sequelize.models.Image,
  //     as: "image",
  //     attributes: ["id", "url", "title", "description"],
  //     where: { objectType: "User" },
  //     required: false
  //   }
  // }));

  // User.addScope("withAuth", () => ({
  //   include: {
  //     model: sequelize.models.UserAuthentication,
  //     as: "UserAuthentication",
  //     required: false,
  //     plain: true
  //   }
  // }));

  // User.addScope("withLead", () => ({
  //   include: {
  //     model: sequelize.models.UserLead,
  //     as: "UserLead",
  //     required: false,
  //     plain: true
  //   }
  // }));

  // User.verifyId = id => isUUID(id);

  // User.prototype.generateToken = async function generateToken() {
  //   console.log("Prototype method");
  // };

  return User;
};
