class timeStrategy {
    getHeader() {
        return '=======based on time========'
    }

    getLabel() {
        return 'Use points'
    }

    nextMetric() {
        return 'points'
    }

    getType() {
        return "time"
    }

    getValue(data) {
        return parseInt(data) + ' min'
    }
        
}

module.exports = { timeStrategy : timeStrategy };