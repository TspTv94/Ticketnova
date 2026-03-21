const morgan = require('morgan');
const getLogger = () => morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');
module.exports = { getLogger };
