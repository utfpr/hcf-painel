import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PrinterMode = 'TCP' | 'USB' | 'MOCK'

interface PrinterConfig {
  apiUrl: string
  mode: PrinterMode
  host: string
  port: number
  dpi: number
  labelWidthDots: number
  labelHeightDots: number
}

interface PrinterState extends PrinterConfig {
  setConfig: (config: Partial<PrinterConfig>) => void
}

export const usePrinterStore = create<PrinterState>()(
  persist(
    set => ({
      apiUrl: 'http://localhost:43786',
      mode: 'MOCK',
      host: '',
      port: 9100,
      dpi: 203,
      labelWidthDots: 799,
      labelHeightDots: 304,
      setConfig: config => set(config)
    }),
    {
      name: 'rfid-printer-storage',
      partialize: ({
        apiUrl, mode, host, port, dpi, labelWidthDots, labelHeightDots
      }) =>
        ({
          apiUrl, mode, host, port, dpi, labelWidthDots, labelHeightDots
        })
    }
  )
)
