import { queryAssetClass, queryDepartment} from '../services/api';

export default {
  namespace: 'datadictionary',

  state: {
    assetclass: {
      list: [],
      pagination: {},
    },
    dept: {
      list: [],
      pagination: {},
    }

  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryAssetClass, payload);
      yield put({
        type: 'saveAssetClass',
        payload: response,
      });
    },

    *fetchdept({ payload }, { call, put }) {
      const response = yield call(queryDepartment, payload);
      yield put({
        type: 'saveDepartment',
        payload: response,
      });
    },
    
  },

  reducers: {
    saveAssetClass(state, action) {
      return {
        ...state,
        assetclass: action.payload,
      };
    },
    saveDepartment(state, action) {
      return {
        ...state,
        dept: action.payload,
      };
    },

  },
};
