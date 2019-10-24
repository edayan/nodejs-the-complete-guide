const Sequelize = require('sequilize');

const sequelize = new Sequelize('node_complete', 'root', 'node_complete', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
