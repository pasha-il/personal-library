import { db, sendOrQueue, syncPendingRequests } from './db';
import { setNotifier } from './notifications';

describe('db notifications', () => {
  test('sendOrQueue notifies on network failure', async () => {
    const addMock = jest.fn().mockResolvedValue(1);
    (db as any).pendingRequests = { add: addMock };
    // @ts-ignore
    global.fetch = jest.fn().mockRejectedValue(new Error('fail'));
    const notify = jest.fn();
    setNotifier(notify);
    await sendOrQueue('/test', {});
    expect(addMock).toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('Network error. Saved locally and will retry when online.');
  });

  test('syncPendingRequests notifies when requests succeed', async () => {
    const deleteMock = jest.fn().mockResolvedValue(undefined);
    (db as any).pendingRequests = {
      toArray: jest.fn().mockResolvedValue([{ id: 1, url: '/u', options: {} }]),
      delete: deleteMock,
    };
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    const notify = jest.fn();
    setNotifier(notify);
    await syncPendingRequests();
    expect(deleteMock).toHaveBeenCalledWith(1);
    expect(notify).toHaveBeenCalledWith('Pending changes synced.');
  });
});
