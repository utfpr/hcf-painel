import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export type StatusConexao = 'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO'

interface RfidState {
  apiUrl: string
  identificador: string
  tipoDispositivo: string
  hardwareOnline: boolean
  statusConexao: StatusConexao
  validandoHardware: boolean

  setConfig: (config: Partial<{ apiUrl: string, identificador: string, tipoDispositivo: string }>) => void
  verificarHardware: () => Promise<void>
  conectar: () => Promise<boolean>
  desconectar: () => void
}

export const useRfidStore = create<RfidState>()(
  persist(
    (set, get) => ({
      apiUrl: 'http://localhost:43785',
      identificador: 'chainway_native',
      tipoDispositivo: 'CHAINWAY_NATIVE',
      hardwareOnline: false,
      statusConexao: 'DESCONECTADO',
      validandoHardware: true,

      setConfig: (config) => set((state) => ({ ...state, ...config })),

      verificarHardware: async () => {
        set({
          validandoHardware: true
        })
        const { apiUrl, identificador, statusConexao } = get()

        try {
          const res = await axios.get(`${apiUrl}/status`, { timeout: 2000 })

          if (res.status === 200) {
            if (statusConexao === 'CONECTADO') {
              const confRes = await axios.get(`${apiUrl}/status/${identificador}`, { timeout: 2000 })
              const configurado = confRes.status === 200 && confRes.data?.configurado === true

              set({
                hardwareOnline: configurado,
                statusConexao: configurado ? 'CONECTADO' : 'DESCONECTADO'
              })

            } else {
              set({
                hardwareOnline: true
              })
            }

          } else {
            set({
              hardwareOnline: false,
              statusConexao: 'DESCONECTADO'
            })
          }

        } catch (error) {
          set({
            hardwareOnline: false,
            statusConexao: 'DESCONECTADO'
          })

        } finally {
          set({
            validandoHardware: false
          })
        }
      },

      conectar: async () => {
        const { apiUrl, identificador, tipoDispositivo } = get()
        set({
          statusConexao: 'CONECTANDO',
          validandoHardware: true
        })

        try {
          const response = await axios.put(`${apiUrl}/configuracao`, {
            type: tipoDispositivo,
            id: identificador
          })

          if (response.status === 200 || response.status === 204) {
            set({
              hardwareOnline: true,
              statusConexao: 'CONECTADO'
            })

            return true
          }

          set({
            statusConexao: 'DESCONECTADO'
          })
          return false

        } catch (error) {

          set({
            hardwareOnline: false,
            statusConexao: 'DESCONECTADO'
          })
          return false
        } finally {
          set({
            validandoHardware: false
          })
        }
      },

      desconectar: () => {
        set({
          statusConexao: 'DESCONECTADO',
          hardwareOnline: false
        })
      }
    }),
    {
      name: 'rfid-storage',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        identificador: state.identificador,
        tipoDispositivo: state.tipoDispositivo
      }),
    }
  )
)
