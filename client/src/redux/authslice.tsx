import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  // Add other user fields as needed
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Async thunk to check login status
export const checkAuthStatus = createAsyncThunk<User>(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    const response = await fetch("http://localhost:3001/auth/status", {
      credentials: "include",
    });

    if (!response.ok) {
      // Handle non-2xx status codes
      return rejectWithValue(await response.text());
    }

    return await response.json();
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      checkAuthStatus.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      }
    );
    builder.addCase(checkAuthStatus.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    // Add other cases as needed
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
