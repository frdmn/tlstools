#!/usr/bin/env bash
#
# Regenerates the fixture PKI used by the test suite.
#
# The leaf certificate's AIA "CA Issuers" URI points to
# http://127.0.0.1:18473/intermediate.der, which the integration
# tests serve from a local HTTP server so the whole tool can be
# exercised without any network access.
#
set -euo pipefail
cd "$(dirname "$0")"

AIA_URL="http://127.0.0.1:18473/intermediate.der"
DAYS=3650

# Root CA (self-signed)
openssl ecparam -name prime256v1 -genkey -noout -out root.key
openssl req -x509 -new -key root.key -sha256 -days "$DAYS" -out root.pem \
  -subj "/C=DE/O=tlstools test/CN=tlstools test root CA"

# Intermediate CA (signed by root)
openssl ecparam -name prime256v1 -genkey -noout -out intermediate.key
openssl req -new -key intermediate.key -out intermediate.csr \
  -subj "/C=DE/O=tlstools test/CN=tlstools test intermediate CA"
openssl x509 -req -in intermediate.csr -CA root.pem -CAkey root.key -CAcreateserial \
  -days "$DAYS" -sha256 -out intermediate.pem \
  -extfile <(printf 'basicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\n')

# Leaf (signed by intermediate, SAN for localhost, AIA to the local test server)
openssl ecparam -name prime256v1 -genkey -noout -out leaf.key
openssl req -new -key leaf.key -out leaf.csr \
  -subj "/C=DE/O=tlstools test/CN=localhost"
printf 'subjectAltName=DNS:localhost,IP:127.0.0.1\nauthorityInfoAccess=caIssuers;URI:%s\nbasicConstraints=CA:FALSE\n' \
  "$AIA_URL" > leaf.ext
openssl x509 -req -in leaf.csr -CA intermediate.pem -CAkey intermediate.key -CAcreateserial \
  -days "$DAYS" -sha256 -out leaf.pem -extfile leaf.ext

# DER and PKCS#7 forms of the intermediate for AIA response format tests
openssl x509 -in intermediate.pem -outform DER -out intermediate.der
openssl crl2pkcs7 -nocrl -certfile intermediate.pem -outform DER -out intermediate.p7c

# Full chain bundle for the "complete chain" TLS test server
cat leaf.pem intermediate.pem > leaf-fullchain.pem

# Standalone CSR
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout csr.key -out csr.pem -subj "/C=DE/O=tlstools test/CN=csr.example.com"

# Keep only what the tests consume
rm -f intermediate.csr leaf.csr leaf.ext root.srl intermediate.srl \
  root.key intermediate.key csr.key
