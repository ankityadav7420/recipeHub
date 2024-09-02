import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component
        {...pageProps}
        className="bg-gradient-to-br from-slate-100 to-red-100"
      />
    </QueryClientProvider>
  );
}

export default App;
