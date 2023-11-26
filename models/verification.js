const { DataTypes } = require("sequelize")
const Verification = (sequelize) => {
    const verification = sequelize.define('verification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
        },
        otp: {
            type: DataTypes.STRING,
        },
    });
    return verification;
}

module.exports = Verification;