import { Broker } from '@/libraries/events/Broker'

type TestEvents = {
  'test.event': (payload: string) => void
  'test.numeric': (n: number) => void
}

describe('Broker', () => {
  let broker: Broker<TestEvents>

  beforeEach(() => {
    broker = new Broker<TestEvents>()
  })

  describe('subscribe', () => {
    it('registers a listener for an event', () => {
      const callback = jest.fn()
      broker.subscribe('test.event', callback)

      broker.emit('test.event', 'hello')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('hello')
    })

    it('returns this for chaining', () => {
      const callback = jest.fn()
      const result = broker.subscribe('test.event', callback)

      expect(result).toBe(broker)
    })

    it('supports multiple listeners for the same event', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      broker.subscribe('test.event', callback1)
      broker.subscribe('test.event', callback2)

      broker.emit('test.event', 'hello')

      expect(callback1).toHaveBeenCalledWith('hello')
      expect(callback2).toHaveBeenCalledWith('hello')
    })

    it('passes correct arguments to listeners', () => {
      const callback = jest.fn()
      broker.subscribe('test.numeric', callback)

      broker.emit('test.numeric', 42)

      expect(callback).toHaveBeenCalledWith(42)
    })
  })

  describe('unsubscribe', () => {
    it('removes a listener', () => {
      const callback = jest.fn()
      broker.subscribe('test.event', callback)
      broker.unsubscribe('test.event', callback)

      broker.emit('test.event', 'hello')

      expect(callback).not.toHaveBeenCalled()
    })

    it('returns this for chaining', () => {
      const callback = jest.fn()
      broker.subscribe('test.event', callback)
      const result = broker.unsubscribe('test.event', callback)

      expect(result).toBe(broker)
    })

    it('does not affect other listeners when unsubscribing one', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      broker.subscribe('test.event', callback1)
      broker.subscribe('test.event', callback2)
      broker.unsubscribe('test.event', callback1)

      broker.emit('test.event', 'hello')

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith('hello')
    })

    it('handles unsubscribe of non-existent listener gracefully', () => {
      const callback = jest.fn()
      expect(() => broker.unsubscribe('test.event', callback)).not.toThrow()
    })
  })

  describe('emit', () => {
    it('does nothing when no listeners are registered', () => {
      expect(() => broker.emit('test.event', 'hello')).not.toThrow()
    })

    it('returns this for chaining', () => {
      const callback = jest.fn()
      broker.subscribe('test.event', callback)
      const result = broker.emit('test.event', 'hello')

      expect(result).toBe(broker)
    })
  })
})
