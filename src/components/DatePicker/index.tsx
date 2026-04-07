import generatePicker from 'antd/es/date-picker/generatePicker'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'

// rc-picker bundles its own dayjs typings; omit generic to avoid TS mismatch with project dayjs.
const DatePicker = generatePicker(dayjsGenerateConfig)

export default DatePicker
