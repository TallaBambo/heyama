import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../public/css/style.css";

export const metadata = {
  title: "Heyama Test",
  description: "Heyama test.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          precedence="default"
        />
      </head>
      <body>
        {children}
        <ToastContainer position="top-center" />
      </body>
    </html>
  );
}
