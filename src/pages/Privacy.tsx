import React from "react";

const Privacy: React.FC = () => {
  const handleBack = () => {
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: 0,
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0 20px 10px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <button
              onClick={handleBack}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #e5e7eb",
                background: "#fff",
                color: "#666",
                fontWeight: 500,
                fontSize: "11px",
                cursor: "pointer",
                transition: "background 0.15s, border 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              ← Back
            </button>
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  marginBottom: "2px",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              >
                Privacy Policy
              </h1>
              <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 20px 20px 20px",
            lineHeight: "1.4",
            color: "#333",
          }}
        >
          <h2
            style={{
              marginTop: "0",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            1. Introduction
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            This Privacy Policy describes how Unigraph (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects
            your information when you use our prototype software application.
            Please read this policy carefully to understand our practices.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            2. Information We Collect
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            We may collect the following types of information:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>
              <strong>Account Information:</strong> Email address, password
              (hashed), and authentication data when you create an account
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use the
              application, including graphs, diagrams, and other content you
              create
            </li>
            <li>
              <strong>Technical Data:</strong> Browser type, operating system,
              IP address, and other technical information
            </li>
            <li>
              <strong>User Content:</strong> Data you upload, create, or process
              within the application
            </li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            3. How We Use Your Information
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            We use the collected information for:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>Providing and maintaining the service</li>
            <li>Improving and developing the application</li>
            <li>Processing your requests and transactions</li>
            <li>Communicating with you about the service</li>
            <li>Ensuring the security and integrity of the application</li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            4. Data Storage and Security
          </h2>
          <p
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              padding: "8px",
              marginBottom: "8px",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            <strong>IMPORTANT:</strong> This is prototype software. While we
            implement reasonable security measures, we cannot guarantee the
            security of your data.
          </p>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            <strong>No Guarantees:</strong> We cannot guarantee that your data
            will be secure or that unauthorized access will not occur. You use
            this service at your own risk regarding data security.
          </p>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            <strong>Data Loss:</strong> As this is experimental software, data
            loss may occur. We recommend backing up any important data before
            using the service.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            5. Data Sharing and Disclosure
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties, except:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>In connection with a business transfer or merger</li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            6. Third-Party Services
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Our application may integrate with third-party services (such as
            authentication providers). These services have their own privacy
            policies, and we are not responsible for their practices.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            7. Cookies and Tracking
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We may use cookies and similar technologies to improve your
            experience. You can control cookie settings through your browser
            preferences.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            8. Your Rights and Choices
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            You have the right to:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginTop: "4px",
              marginBottom: "12px",
              fontSize: "14px",
            }}
          >
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of certain communications</li>
            <li>Control cookie settings</li>
          </ul>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            9. Data Retention
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We retain your information for as long as necessary to provide the
            service and comply with legal obligations. You may request deletion
            of your data at any time.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            10. Children&apos;s Privacy
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Our service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            11. International Transfers
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Your information may be transferred to and processed in countries
            other than your own. We will take appropriate measures to protect
            your information in accordance with this policy.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            12. Changes to This Policy
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by posting the new policy on this page.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            13. Contact Information
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            If you have any questions about this Privacy Policy or our data
            practices, please contact us through the appropriate channels.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            14. Disclaimer
          </h2>
          <p
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              padding: "8px",
              marginBottom: "12px",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            <strong>EXPERIMENTAL SOFTWARE:</strong> This application is a
            prototype and is provided &quot;AS IS&quot; without any warranties.
            We cannot guarantee the security, reliability, or availability of
            your data. Use at your own risk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
