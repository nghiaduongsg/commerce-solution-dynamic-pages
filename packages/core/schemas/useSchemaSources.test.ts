import { renderHook, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import useSchemaSources from './useSchemaSources';
import { valueKey } from './schemaFields';
jest.mock('axios');
const base = {
  schema: { type: 'object', properties: {} },
  uiSchema: {
    'ui:schemaSources': [
      {
        url: 'types/{value}',
        selector: 'typeId',
        target: ['values'],
        fieldsPath: ['fields'],
        keyEncoding: 'widget',
        mapping: {
          key: 'key',
          label: 'label',
          type: 'dataType',
          required: 'required',
          validation: 'validation',
        },
      },
    ],
  },
};
beforeEach(() => jest.clearAllMocks());
test('loads the declared source and resolves fields inside the library', async () => {
  (axios.get as jest.Mock).mockResolvedValue({
    data: { fields: [{ key: 'name', label: 'Name', dataType: 'string' }] },
  });
  const ready = jest.fn();
  const { result } = renderHook(() => useSchemaSources(base, 'type/id', '/api/v1', true, ready));
  await waitFor(() => expect(ready).toHaveBeenCalled());
  expect(axios.get).toHaveBeenCalledWith(
    '/api/v1/types/type%2Fid',
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  expect(ready.mock.calls[0][0].uiSchema.values[valueKey('name')]['ui:widget']).toBe('TextWidget');
  expect(result.current.loading).toBe(false);
});
test('ignores a stale source response after selecting another type', async () => {
  let resolveFirst: (value: any) => void = () => {};
  (axios.get as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    )
    .mockResolvedValue({ data: { fields: [{ key: 'new', dataType: 'string' }] } });
  const ready = jest.fn();
  const { rerender } = renderHook(
    ({ selected }) => useSchemaSources(base, selected, '/api', true, ready),
    { initialProps: { selected: 'first' } },
  );
  rerender({ selected: 'second' });
  await waitFor(() => expect(ready).toHaveBeenCalledWith(expect.anything(), 'second'));
  await act(async () => resolveFirst({ data: { fields: [{ key: 'old', dataType: 'string' }] } }));
  expect(ready).toHaveBeenCalledTimes(1);
});
test('surfaces source failures and avoids calls without a selection', async () => {
  const ready = jest.fn();
  const { result, rerender } = renderHook(
    ({ selected }) => useSchemaSources(base, selected, '/api', true, ready),
    { initialProps: { selected: '' } },
  );
  expect(axios.get).not.toHaveBeenCalled();
  (axios.get as jest.Mock).mockRejectedValue(new Error('unavailable'));
  rerender({ selected: 'type1' });
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.loading).toBe(false);
});
