class distanceStrategy {

    getHeader() {
        return '======based on distance======'
    }

    getLabel() {
        return 'Use time'
    }

    nextMetric() {
        return 'time'
    }

    getValue(data) {
        return Math.round(parseInt(data) * 100) / 100.0 + ' km'
    }
}

module.exports = { distanceStrategy : distanceStrategy };