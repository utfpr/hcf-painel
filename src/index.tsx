import './setup'
import { useEffect } from 'react'
import { recaptchaKey } from './config/api';
import ReactDOM from 'react-dom/client'
import App from './App'

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

function Root() {
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${
        recaptchaKey as string
      }`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
