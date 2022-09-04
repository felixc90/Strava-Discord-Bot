class pointsStrategy {
    getHeader() {
        return '======based on points======='
    }

    getLabel() {
        return 'Use distance'
    }

    nextMetric() {
        return 'distance'
    }

    getType() {
        return "points"
    }

    getValue(data) {
        return 0 + ' points'
    }
        
}

module.exports = { pointsStrategy : pointsStrategy };