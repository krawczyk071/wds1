import { useEffect, useReducer } from "react";
import axios from "axios";

const ACTIONS = {
  MAKE_REQUEST: "make-request",
  GET_DATA: "get-data",
  ERROR: "error",
  UPDATE_HAS_NEXT_PAGE: "update-has-next-page",
};

const BASE_URL =
  "https://cors-anywhere.herokuapp.com/http://api.adzuna.com/v1/api/jobs/pl/search/";
const BASE_PARAMS = {
  app_id: "a525ca4b",
  app_key: "f5d41f31a209ef0ae48543ee8f4ed884",
  results_per_page: "20",
};

// const BASE_URL = "https://api.tvmaze.com/search/people";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      //clear and loading
      return {
        jobs: [],
        loading: true,
      };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        jobs: [],
      };
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      //   console.log("tu", action.payload);
      return { ...state, hasNextPage: action.payload.hasNextPage };

    default:
      return state;
  }
};

export default function useFetchJobs(params, page) {
  const initialState = {
    jobs: [],
    loading: true,
    error: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  //   useEffect(() => {
  //     console.log("ef1");
  //     dispatch({ type: ACTIONS.MAKE_REQUEST });
  //     axios
  //       .get(BASE_URL, { params: { q: "rock", ...params } })
  //       .then((res) => {
  //         console.log(res.data);
  //         dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } });
  //       })
  //       .catch((e) => {
  //         dispatch({ type: ACTIONS.ERROR, payload: { error: e } });
  //       });
  //   }, []);

  useEffect(() => {
    console.log("ef2");
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });
    axios
      .get(BASE_URL + page, {
        cancelToken: cancelToken1.token,
        params: { what: "cook", ...params, ...BASE_PARAMS },
      })
      .then((res) => {
        console.log(res);
        dispatch({
          type: ACTIONS.GET_DATA,
          payload: { jobs: res.data.results },
        });
      })
      .catch((err) => {
        console.log(err);
        if (axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });

    //checking for new page
    const cancelToken2 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });
    axios
      .get(BASE_URL + String(Number(page) + 1), {
        cancelToken: cancelToken2.token,
        params: { what: "cook", ...params, ...BASE_PARAMS },
      })
      .then((res) => {
        dispatch({
          type: ACTIONS.UPDATE_HAS_NEXT_PAGE,
          payload: { hasNextPage: res.data.results.length !== 0 },
        });
      })
      .catch((err) => {
        console.log(err);
        if (axios.isCancel(err)) return;
        dispatch({ type: ACTIONS.ERROR, payload: { error: err } });
      });

    return () => {
      cancelToken1.cancel();
      cancelToken2.cancel();
    };
  }, [params, page]);

  return state;
}
