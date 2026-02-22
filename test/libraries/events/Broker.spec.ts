import { Broker } from '@/libraries/events/Broker'

type TestEvents = {
  'test.event': (payload: string) => void
  'test.numeric': (n: number) => void
}

describe('Broker', () => {
  describe('subscribe', () => {
    it('registers a listener for an event', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()

      // act
      broker.subscribe('test.event', callback)
      broker.emit('test.event', 'hello')

      // assert
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('hello')
    })

    it('returns this for chaining', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()

      // act
      const result = broker.subscribe('test.event', callback)

      // assert
      expect(result).toBe(broker)
    })

    it('supports multiple listeners for the same event', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      // act
      broker.subscribe('test.event', callback1)
      broker.subscribe('test.event', callback2)
      broker.emit('test.event', 'hello')

      // assert
      expect(callback1).toHaveBeenCalledWith('hello')
      expect(callback2).toHaveBeenCalledWith('hello')
    })

    it('passes correct arguments to listeners', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()

      // act
      broker.subscribe('test.numeric', callback)
      broker.emit('test.numeric', 42)

      // assert
      expect(callback).toHaveBeenCalledWith(42)
    })
  })

  describe('unsubscribe', () => {
    it('removes a listener', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()
      broker.subscribe('test.event', callback)

      // act
      broker.unsubscribe('test.event', callback)
      broker.emit('test.event', 'hello')

      // assert
      expect(callback).not.toHaveBeenCalled()
    })

    it('returns this for chaining', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()
      broker.subscribe('test.event', callback)

      // act
      const result = broker.unsubscribe('test.event', callback)

      // assert
      expect(result).toBe(broker)
    })

    it('does not affect other listeners when unsubscribing one', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback1 = jest.fn()
      const callback2 = jest.fn()
      broker.subscribe('test.event', callback1)
      broker.subscribe('test.event', callback2)

      // act
      broker.unsubscribe('test.event', callback1)
      broker.emit('test.event', 'hello')

      // assert
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith('hello')
    })

    it('handles unsubscribe of non-existent listener gracefully', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()

      // act & assert
      expect(() => broker.unsubscribe('test.event', callback)).not.toThrow()
    })
  })

  describe('emit', () => {
    it('does nothing when no listeners are registered', () => {
      // arrange
      const broker = new Broker<TestEvents>()

      // act & assert
      expect(() => broker.emit('test.event', 'hello')).not.toThrow()
    })

    it('returns this for chaining', () => {
      // arrange
      const broker = new Broker<TestEvents>()
      const callback = jest.fn()
      broker.subscribe('test.event', callback)

      // act
      const result = broker.emit('test.event', 'hello')

      // assert
      expect(result).toBe(broker)
    })
  })
})
