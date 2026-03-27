export default function PopupClosePage() {
  return (
    <html>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.opener) {
                window.opener.postMessage("auth-complete", window.location.origin);
              }
              window.close();
            `,
          }}
        />
      </body>
    </html>
  );
}
