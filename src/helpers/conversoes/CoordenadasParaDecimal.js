export const dmsToDecimal = (degrees, minutes, seconds, direction) => {
    const sign = (direction === 'S' || direction === 'W') ? -1 : 1
    return sign * (degrees + (minutes / 60) + (seconds / 3600))
}

export default dmsToDecimal
