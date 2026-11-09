export const rfidReaderTypes = [
  {
    type: 'CHAINWAY_NATIVE', identifier: 'chainway', labelKey: 'connection.chainwayNative'
  },
  {
    type: 'HEXAPAD', identifier: 'hexapad', labelKey: 'connection.hexapad'
  },
  {
    type: 'MOCK', identifier: 'mock', labelKey: 'connection.mockEmulator'
  }
] as const

export const getDefaultReaderIdentifier = (type: string): string => (
  rfidReaderTypes.find(reader => reader.type === type)?.identifier || 'mock'
)
