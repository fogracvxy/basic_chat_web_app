import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { combineReducers } from "redux";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Define the root reducer as a combination of your reducers
// This is needed because redux-persist will wrap this rootReducer
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
});

const persistConfig = {
  key: "root", // key for localStorage key, can be any string
  storage, // define which storage to use
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // This is needed to prevent serialization check errors on redux-persist actions
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
