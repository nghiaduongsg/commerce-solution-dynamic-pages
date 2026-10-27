import useTable from './useTable';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import {
  InitTable,
  SetColumnData,
  ClearSelections,
  SetSelections,
  LoadTable,
  LoadDynamicQueryTable,
  ToggleTableRow,
  ToggleAllTableRows,
  TriggerRefresh,
  ClearTable,
  ToggleTableFormModal,
  SetTableIsNewForm,
  SetTableData,
  SetPage,
  SetPageSize,
  ApplyCriteria,
  ClearCriteria,
  ClearFilterData,
  ToggleTableColumn,
  SetPredefinedCriteria,
  SetSortBy,
  SetFilterData,
  SaveTableRow,
  ConcatLocalTableRow,
  DeleteTableRow,
  RemoveFilterData,
  SetAllTableData,
  SetTableMaxLimit,
} from '../src/actions';
import { renderHook } from '@testing-library/react';

describe('useTable', () => {
  const tableId = 'TABLE';
  const tablesStore = 'Tables';

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return selectedRows', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { id: 'id', selectedRowIds: { 0: { 1: true, 2: false, 3: true } } },
      },
    };
    const { wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { selectedRows } = result.current;

    expect(selectedRows).toEqual({ 1: true, 2: false, 3: true });
  });

  it('should return selectedRowsNumber', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { id: 'id', selectedRowIds: { 0: { 1: true, 2: false, 3: true } } },
      },
    };
    const { wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { selectedRowsNumber } = result.current;

    expect(selectedRowsNumber).toEqual(2);
  });

  it('should dispatch action InitTable when "initTable" is called', () => {
    const initialState = { id: 'id' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { initTable } = result.current;

    initTable(initialState);

    expect(dispatchStub).toHaveBeenCalledWith(
      InitTable({
        tableId,
        initialState,
      }),
    );
  });

  it('should dispatch action loadTableData when "loadTableData" is called with isDynamicQuery parameter set to true', () => {
    const loadTimestamp = 1234567;
    const criteria = { test: '123' };
    const page = 1;
    const pageSize = 5;
    const sortBy = '';

    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { loadTableData } = result.current;
    loadTableData(
      loadTimestamp,
      criteria,
      page,
      pageSize,
      sortBy,
      undefined,
      'query-management/queries/',
    );

    expect(dispatchStub).toHaveBeenCalledWith(
      LoadDynamicQueryTable({
        tableId,
        criteria,
        page,
        pageSize,
        sortBy,
        loadTimestamp,
        apiValues: undefined,
        url: 'query-management/queries/',
      }),
    );
  });

  it('should dispatch action loadTableData when "loadTableData" is called with isDynamicQuery parameter set to false', () => {
    const loadTimestamp = 1234567;
    const criteria = { test: '123' };
    const page = 1;
    const pageSize = 5;
    const sortBy = '';

    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { loadTableData } = result.current;
    loadTableData(
      loadTimestamp,
      criteria,
      page,
      pageSize,
      sortBy,
      undefined,
      'registration/parties/',
    );

    expect(dispatchStub).toHaveBeenCalledWith(
      LoadTable({
        tableId,
        criteria,
        page,
        pageSize,
        sortBy,
        loadTimestamp,
        apiValues: undefined,
        url: 'registration/parties/',
      }),
    );
  });

  it('should dispatch action clearSelections when "clearSelections" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearSelections } = result.current;
    clearSelections();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearSelections({
        tableId,
        column: 0,
      }),
    );
  });

  it('should dispatch action clearSelections when "clearSelections" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearSelections } = result.current;
    clearSelections(10);

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearSelections({
        tableId,
        column: 10,
      }),
    );
  });

  it('should dispatch action setSelections when "setSelections" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setSelections } = result.current;
    setSelections({ rowId: 'row-1234' });

    expect(dispatchStub).toHaveBeenCalledWith(
      SetSelections({
        tableId,
        selections: { rowId: 'row-1234' },
      }),
    );
  });

  it('should dispatch action toggleTableRow when "toggleTableRow" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { toggleTableRow } = result.current;
    toggleTableRow('row-1234', false, 0);

    expect(dispatchStub).toHaveBeenCalledWith(
      ToggleTableRow({
        tableId,
        column: 0,
        rowId: 'row-1234',
        isMultiSelect: false,
      }),
    );
  });

  it('should dispatch action toggleAllTableRows when "toggleAllTableRows" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { toggleAllTableRows } = result.current;
    toggleAllTableRows(true);

    expect(dispatchStub).toHaveBeenCalledWith(
      ToggleAllTableRows({
        tableId,
        selected: true,
      }),
    );
  });

  it('should dispatch action triggerRefresh when "triggerRefresh" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { triggerRefresh } = result.current;
    triggerRefresh();

    expect(dispatchStub).toHaveBeenCalledWith(
      TriggerRefresh({
        tableId,
      }),
    );
  });

  it('should dispatch action clearTable when "clearTable" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearTable } = result.current;
    clearTable();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearTable({
        tableId,
      }),
    );
  });

  it('should dispatch action toggleTableFormModal when "toggleTableFormModal" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { toggleTableFormModal } = result.current;
    toggleTableFormModal(true);

    expect(dispatchStub).toHaveBeenCalledWith(
      ToggleTableFormModal({
        tableId,
        open: true,
      }),
    );
  });

  it('should dispatch action setTableIsNewForm when "setTableIsNewForm" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setTableIsNewForm } = result.current;
    setTableIsNewForm(true);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetTableIsNewForm({
        tableId,
        isNew: true,
      }),
    );
  });

  it('should dispatch action setTableData when "setTableData" is called', () => {
    const data = [
      {
        id: 1,
        refundDate: '12/08/2020',
        amountRefunded: 1184,
        method: 'Direct Despoit',
        status: 'Accepted',
        currencyCL: 'EUR',
      },
    ];
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setTableData } = result.current;

    setTableData({ data });

    expect(dispatchStub).toHaveBeenCalledWith(
      SetTableData({
        tableId,
        data,
      }),
    );
  });

  it('should dispatch action setColumnData when "setColumnData" is called', () => {
    const columns = [
      {
        type: 'string',
        name: 'Refund Date',
        accessors: ['refundDate'],
        align: 'left',
        visible: true,
      },
    ];
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setColumnData } = result.current;

    setColumnData({ data: [...columns] });

    expect(dispatchStub).toHaveBeenCalledWith(
      SetColumnData({
        tableId,
        data: columns,
      }),
    );
  });

  it('should dispatch action setPage when "setPage" is called', () => {
    const page = 2;
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setPage } = result.current;

    setPage(page);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetPage({
        tableId,
        page,
      }),
    );
  });

  it('should dispatch action setSortBy when "setSortBy" is called', () => {
    const sortBy = 'value';
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setSortBy } = result.current;

    setSortBy(sortBy);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetSortBy({
        tableId,
        sortBy,
      }),
    );
  });

  it('should dispatch action setPageSize when "setPageSize" is called', () => {
    const pageSize = 10;
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setPageSize } = result.current;

    setPageSize(pageSize);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetPageSize({
        tableId,
        pageSize,
      }),
    );
  });

  it('should dispatch action setMaxLimit when "setMaxLimit" is called', () => {
    const maxLimit = 10;
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setMaxLimit } = result.current;

    setMaxLimit(maxLimit);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetTableMaxLimit({
        tableId,
        maxLimit,
      }),
    );
  });

  it('should dispatch action applyCriteria when "applyCriteria" is called', () => {
    const criteria = { id: 'id' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { applyCriteria } = result.current;

    applyCriteria(criteria);

    expect(dispatchStub).toHaveBeenCalledWith(
      ApplyCriteria({
        tableId,
        criteria,
      }),
    );
  });

  it('should dispatch action clearCriteria when "clearCriteria" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearCriteria } = result.current;
    clearCriteria();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearCriteria({
        tableId,
      }),
    );
  });

  it('should dispatch action clearFilterData when "clearFilterData" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearFilterData } = result.current;
    clearFilterData();

    expect(dispatchStub).toHaveBeenCalledWith(
      ClearFilterData({
        tableId,
      }),
    );
  });

  it('should dispatch action toggleTableColumn when "toggleTableColumn" is called', () => {
    const storeData = {
      [tablesStore]: {
        [tableId]: { loadTimestamp: 1234567, page: 1, pageSize: 5 },
      },
    };
    const selectedColumnIds = ['2', '3', '12'];
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { toggleTableColumn } = result.current;
    toggleTableColumn(selectedColumnIds);

    expect(dispatchStub).toHaveBeenCalledWith(
      ToggleTableColumn({
        tableId,
        selectedColumnIds,
      }),
    );
  });

  it('should dispatch action setPredefinedCriteria when "setPredefinedCriteria" is called', () => {
    const predefinedCriteria = { id: 'id' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setPredefinedCriteria } = result.current;

    setPredefinedCriteria(predefinedCriteria);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetPredefinedCriteria({
        tableId,
        predefinedCriteria,
      }),
    );
  });

  it('should dispatch action setPredefinedCriteria when "setPredefinedCriteria" is called', () => {
    const predefinedCriteria = {};
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setPredefinedCriteria } = result.current;

    setPredefinedCriteria(predefinedCriteria);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetPredefinedCriteria({
        tableId,
        predefinedCriteria: {},
      }),
    );
  });

  it('should dispatch action setFilterData when "setFilterData" is called', () => {
    const filterData = { id: 'id', value: 'value' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setFilterData } = result.current;

    setFilterData(filterData);

    expect(dispatchStub).toHaveBeenCalledWith(
      SetFilterData({
        tableId,
        filterData,
      }),
    );
  });

  it('should dispatch action setExtraTableData when "setExtraTableData" is called', () => {
    const extraTableData = { id: 'id', value: 'value' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { setExtraTableData } = result.current;

    setExtraTableData(extraTableData, 2);

    expect(dispatchStub).toHaveBeenCalledWith(
      setExtraTableData({
        tableId,
        extraTableData,
        column: 2,
      }),
    );
  });

  it('should dispatch action saveTableRow when "saveTableRow" is called', () => {
    const data = { id: 'id', value: 'value' };
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { saveTableRow } = result.current;

    saveTableRow('taxpayer-accounting/test', data, 'post');

    expect(dispatchStub).toHaveBeenCalledWith(
      SaveTableRow({
        entityId: tableId,
        url: 'taxpayer-accounting/test',
        method: 'post',
        data,
      }),
    );
  });

  it('should dispatch action concatLocalTableRow when "concatLocalTableRow" is called', () => {
    const formData = { id: 'id', value: 'value' };
    const reported = 123456;
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { concatLocalTableRow } = result.current;

    concatLocalTableRow({ formData, reported });

    expect(dispatchStub).toHaveBeenCalledWith(
      ConcatLocalTableRow({
        tableId,
        formData,
        reported,
      }),
    );
  });

  it('should dispatch action deleteTableRow when "deleteTableRow" is called', () => {
    const rowData = { id: 'id', value: 'value' };
    const reported = 123456;
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { deleteTableRow } = result.current;

    deleteTableRow({ rowData, reported });

    expect(dispatchStub).toHaveBeenCalledWith(
      DeleteTableRow({
        tableId,
        rowData,
        reported,
      }),
    );
  });

  it('should dispatch action removeFilterData when "removeFilterData" is called', () => {
    const storeData = {
      Tables: {
        TABLE: { id: 'id' },
      },
    };

    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useTable('TABLE'), { wrapper });

    result.current.removeFilterData('myFilter');

    expect(dispatchStub).toHaveBeenCalledWith(
      RemoveFilterData({
        tableId: 'TABLE',
        filterName: 'myFilter',
      }),
    );
  });

  it('should dispatch action SetAllTableData with data equal [] when "clearAllTableData" is called', () => {
    const storeData = { [tablesStore]: { [tableId]: { id: 'id' } } };
    const { wrapper, dispatchStub } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => useTable(tableId), { wrapper });
    const { clearAllTableData } = result.current;

    clearAllTableData();

    expect(dispatchStub).toHaveBeenCalledWith(
      SetAllTableData({
        data: [],
        tableId,
      }),
    );
  });
});
