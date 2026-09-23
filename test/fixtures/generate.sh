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

# Second root plus a cross-signed variant of the intermediate (same key
# and subject, different issuer), mirroring how CAs like Google operate
# dual cross-signing paths for the same intermediate
openssl ecparam -name prime256v1 -genkey -noout -out cross-root.key
openssl req -x509 -new -key cross-root.key -sha256 -days "$DAYS" -out cross-root.pem \
  -subj "/C=DE/O=tlstools test/CN=tlstools test cross root CA"
openssl x509 -req -in intermediate.csr -CA cross-root.pem -CAkey cross-root.key -CAcreateserial \
  -days "$DAYS" -sha256 -out intermediate-cross.pem \
  -extfile <(printf 'basicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\n')
openssl x509 -in intermediate-cross.pem -outform DER -out intermediate-cross.der

# Leaf whose AIA points at the cross-signed variant while the test
# server presents the root-signed one: a complete chain that only
# key-identity (not byte) comparison recognizes as complete
printf 'subjectAltName=DNS:localhost,IP:127.0.0.1\nauthorityInfoAccess=caIssuers;URI:%s\nbasicConstraints=CA:FALSE\n' \
  "http://127.0.0.1:18473/intermediate-cross.der" > leaf-cross.ext
openssl req -new -key leaf.key -out leaf-cross.csr \
  -subj "/C=DE/O=tlstools test/CN=localhost"
openssl x509 -req -in leaf-cross.csr -CA intermediate.pem -CAkey intermediate.key -CAcreateserial \
  -days "$DAYS" -sha256 -out leaf-cross.pem -extfile leaf-cross.ext
cat leaf-cross.pem intermediate.pem > leaf-cross-fullchain.pem

# Full chain bundle for the "complete chain" TLS test server
cat leaf.pem intermediate.pem > leaf-fullchain.pem

# Standalone CSR
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes \
  -keyout csr.key -out csr.pem -subj "/C=DE/O=tlstools test/CN=csr.example.com"

# CSR generated from the leaf key, so a full cert/key/csr triple can be
# match-tested against each other
openssl req -new -key leaf.key -out leaf-csr.pem \
  -subj "/C=DE/O=tlstools test/CN=localhost"

# Keep only what the tests consume
rm -f intermediate.csr leaf.csr leaf.ext root.srl intermediate.srl cross-root.srl \
  leaf-cross.csr leaf-cross.ext root.key intermediate.key cross-root.key csr.key
