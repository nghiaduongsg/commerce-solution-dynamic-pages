import tableEpics from '../list/src/epics';
import entityEpics from '../entity/redux/epics';

export default [...tableEpics, ...entityEpics];
