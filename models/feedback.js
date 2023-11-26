const { DataTypes } = require("sequelize")
const Feedback = (sequelize) => {
    const feedback = sequelize.define('feedback', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        clinicalError:{
            type: DataTypes.INTEGER,
        },
        translationalError:{
            type: DataTypes.INTEGER,
        },
        message: {
            type: DataTypes.STRING,
        },
        userId:{
            type: DataTypes.INTEGER,
        },
    });
    return feedback;
}

module.exports = Feedback;