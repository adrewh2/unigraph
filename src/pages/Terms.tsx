import React from "react";

const Terms: React.FC = () => {
  const handleBack = () => {
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: "0",
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
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                marginBottom: "2px",
                fontWeight: 700,
                fontSize: "20px",
              }}
            >
              Terms of Service
            </h1>
            <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
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
            1. Acceptance of Terms
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            By accessing and using Unigraph (&quot;the Service&quot;), you
            accept and agree to be bound by the terms and provision of this
            agreement.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            2. Description of Service
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            Unigraph is a prototype software application for graph
            visualization, data analysis, and interactive diagram creation. The
            Service is provided for experimental and research purposes.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            3. DISCLAIMER OF WARRANTIES
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
            <strong>IMPORTANT:</strong> This software is provided &quot;AS
            IS&quot; and &quot;AS AVAILABLE&quot; without any warranties of any
            kind, either express or implied.
          </p>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            THE SOFTWARE IS A PROTOTYPE AND IS PRESENTED &quot;AS-IS&quot;
            WITHOUT ANY GUARANTEES. WE EXPLICITLY DISCLAIM ALL WARRANTIES,
            INCLUDING BUT NOT LIMITED TO:
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
              Warranties of merchantability or fitness for a particular purpose
            </li>
            <li>
              Warranties that the software will be error-free or uninterrupted
            </li>
            <li>
              Warranties regarding the accuracy, reliability, or completeness of
              any data or information
            </li>
            <li>
              Warranties that the software will meet your specific requirements
            </li>
            <li>
              Warranties regarding the security of the software or your data
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
            4. LIMITATION OF LIABILITY
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            IN NO EVENT SHALL THE DEVELOPERS, CONTRIBUTORS, OR ANY OTHER PARTIES
            INVOLVED IN THE CREATION, PRODUCTION, OR DELIVERY OF THE SOFTWARE BE
            LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
            CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
            SUBSTITUTE GOODS OR SERVICES, LOSS OF USE, DATA, OR PROFITS, OR
            BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
            LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
            NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
            SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            5. Experimental Nature
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            This software is experimental and may contain bugs, errors, or
            incomplete features. The functionality may change without notice.
            Users should not rely on this software for critical or production
            use.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            6. Data and Privacy
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            While we strive to protect your data, we cannot guarantee the
            security of any information transmitted to or from the Service. You
            use the Service at your own risk regarding data security and
            privacy.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            7. Service Availability
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            The Service may be unavailable at any time for maintenance, updates,
            or other reasons. We do not guarantee continuous availability of the
            Service.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            8. User Responsibilities
          </h2>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            You are responsible for:
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
              Ensuring you have the necessary rights to use any data you upload
              or process
            </li>
            <li>Backing up any important data before using the Service</li>
            <li>Not using the Service for illegal or harmful purposes</li>
            <li>
              Understanding that the software is experimental and may not work
              as expected
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
            9. Changes to Terms
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting. Your continued use of the
            Service constitutes acceptance of any changes.
          </p>

          <h2
            style={{
              marginTop: "16px",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            10. Contact Information
          </h2>
          <p style={{ marginBottom: "12px", fontSize: "14px" }}>
            If you have any questions about these Terms of Service, please
            contact us through the appropriate channels.
          </p>

          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #3b82f6",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 400,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
