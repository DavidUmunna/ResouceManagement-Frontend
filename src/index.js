import "./components/sentry"
import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import  {BrowserRouter} from "react-router-dom"
import {Provider,} from "react-redux"
import store from "./js/store/store"
import { UserProvider } from "./components/usercontext";
import { ErrorBoundary } from 'react-error-boundary';
import Fallback from "./components/errorboundary";
import { QueryClient, QueryClientProvider } from 'react-query';
import { registerServiceWorker } from './firebaseConfig'; 

registerServiceWorker().catch(console.error)


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary:true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Sentry.ErrorBoundary fallback={<Fallback/>}
  showDialog
  onError={(error, componentStack, eventId) => {
    console.error(error);
  }}>
  <Provider store={store} >

      <BrowserRouter>
        <ErrorBoundary fallback={<Fallback/>}>
            <UserProvider>
                <QueryClientProvider client={queryClient}>
                  <App />
                </QueryClientProvider>
            </UserProvider> 
        </ErrorBoundary>  
      </BrowserRouter>
  </Provider>
  </Sentry.ErrorBoundary>
      
  
);

// measuring performance in your app
reportWebVitals();
