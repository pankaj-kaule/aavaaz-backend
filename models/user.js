const { DataTypes } = require("sequelize")
const User = (sequelize) => {
    const user = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        role: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
        },
        passwordConfirm: {
            type: DataTypes.BOOLEAN,
        },
        passwordChangedAt: {
            type: DataTypes.DATE,
        },
        organization:{
            type: DataTypes.STRING,
        },
        isVerified:{
            type: DataTypes.STRING,
        },
        otp:{
            type: DataTypes.INTEGER,
        }
    });
    return user;
}

module.exports = User;