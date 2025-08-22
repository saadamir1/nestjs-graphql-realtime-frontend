import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => (
  <ApolloProvider client={client}>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ApolloProvider>
);

export default App;
