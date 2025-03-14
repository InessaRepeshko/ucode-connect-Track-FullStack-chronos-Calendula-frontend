import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/components/redux/reducers/authReducer.ts";
import userReducer from "@/components/redux/reducers/userReducer.ts";
import calendarReducer from "@/components/redux/reducers/calendarReducer.ts";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import eventReducer from "@/components/redux/reducers/eventReducer.ts";

const persistConfig = {
    key: 'root',
    storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        users: userReducer,
        calendars: calendarReducer,
        event: eventReducer,
    },
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
