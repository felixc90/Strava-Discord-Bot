const { distanceStrategy } = require('./distanceStrategy.js')
const { timeStrategy } = require('./timeStrategy.js')
const { pointsStrategy } = require('./pointsStrategy.js')

module.exports = { createMetricStrategy : function createMetricStrategy(key) {
        switch (key) {
            case "time":
                return new timeStrategy();
            case "distance":
                return new distanceStrategy();
            case "points":
                console.log("woowow")
                return new pointsStrategy();
            default:
                break;
        }
    }
}