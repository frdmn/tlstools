TLStools
========

[![CI](https://github.com/frdmn/tlstools/actions/workflows/ci.yml/badge.svg)](https://github.com/frdmn/tlstools/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tlstools.svg)](https://www.npmjs.com/package/tlstools)
[![License](https://img.shields.io/npm/l/tlstools.svg)](https://github.com/frdmn/tlstools/blob/master/LICENSE)

Command line tool to analyze, troubleshoot or inspect TLS certificates, requests or keys. Written in NodeJS.

* [`tls chain`](#tls-chain) - Attempt to fix an incomplete certificate chain
* [`tls check`](#tls-check) - Check completeness of remote certificate chain
* [`tls crt`](#tls-crt) - Get renewal informations and the certificate itself based on a host or file
* [`tls csr`](#tls-csr) - Simple decypher and parse informations out of a CSR (Certificate Signing Request)
* [`tls match`](#tls-match) - Check that a certificate, private key and/or CSR share the same public key

# Requirements

* [NodeJS](https://nodejs.org) >= 20
* An `openssl` binary in your `$PATH` (OpenSSL 1.x, 3.x and LibreSSL are supported)

# Installation

```shell
npm install -g tlstools
```

# Usage

```shell
$ tls
Usage: tls [options] [command]

CLI tool to analyze, troubleshoot or inspect SSL certificates, requests or keys

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  chain [options] [hostname]  attempt to fix incomplete certificate chain
  check [options] [hostname]  check remote certificate chain
  crt [options] [hostname]    display TLS information for given hostname or
                              certificate
  csr [options]               decode certificate request information
  help [command]              display help for command
```

All sub commands also support a `--json` flag that replaces the formatted
report with machine-readable JSON on stdout. Exit codes are unchanged, so
`tls check --json` still exits with `1` on an incomplete chain.

## Sub commands

### tls `chain`

Attempt to fix an incomplete certificate chain. The certificate is resolved
by following the [AIA](https://tools.ietf.org/html/rfc5280#section-4.2.2.1)
"CA Issuers" extension of the certificate and its issuers. The resulting
bundle (leaf plus all intermediates, without the root) is printed to stdout,
status messages go to stderr, so the output can be piped into a file:

```shell
$ tls chain -h
Usage: tls chain [options] [hostname]

attempt to fix incomplete certificate chain

Arguments:
  hostname                      remote host[:port] to inspect

Options:
  -H, --hostname <host[:port]>  use certificate from remote hostname
  -f, --filename <file>         use certificate from local file
  -c, --clipboard               use certificate from clipboard
  --json                        output machine-readable JSON instead of the
                                formatted report
  -h, --help                    display help for command
```

---

Resolve the chain of a remote host and save it to a file:

```shell
$ tls chain frd.mn > frd.mn-fullchain.pem
 ✔ Resolved certificate chain with 1 intermediate certificate
```

Assuming you have copied the certificate to fix into your system clipboard:

```shell
$ tls chain -c
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
 ✔ Resolved certificate chain with 1 intermediate certificate
```

### tls `crt`

Display decoded certificate informations like issuer, subject and validity,
including the remaining (or already expired) days.

```shell
$ tls crt -h
Usage: tls crt [options] [hostname]

display TLS information for given hostname or certificate

Arguments:
  hostname                      remote host[:port] to inspect

Options:
  -H, --hostname <host[:port]>  use certificate from remote hostname
  -f, --filename <file>         use certificate from local file
  -c, --clipboard               use certificate from clipboard
  --json                        output machine-readable JSON instead of the
                                formatted report
  -h, --help                    display help for command
```

---

Show certificate informations from remote host "frd.mn":

```shell
$ tls crt frd.mn
Certificate (PEM):
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----

  Issuer
    CN   WE1
    O    Google Trust Services
    C    US
  Subject
    CN   frd.mn
  Validity
    From  2026-09-18 04:30:49 UTC
    To    2026-12-17 05:30:33 UTC

 ✔ frd.mn — valid for another 84 days
```

The same information as machine-readable JSON:

```shell
$ tls crt frd.mn --json
{
  "certificate": "-----BEGIN CERTIFICATE----- ...",
  "issuer": { "CN": "WE1", "O": "Google Trust Services", "C": "US" },
  "subject": { "CN": "frd.mn" },
  "validFrom": "2026-09-18T04:30:49.000Z",
  "validTo": "2026-12-17T05:30:33.000Z",
  "remainingDays": 84
}
```

The verdict line is colored by urgency: green while the certificate is
comfortable, yellow within 30 days of expiry, red within 7 days or after
expiry. Colors disable automatically when output is piped (`NO_COLOR`
and `FORCE_COLOR` are respected).

### tls `csr`

Decode and display information from certificate signing requests.

```shell
$ tls csr -h
Usage: tls csr [options]

decode certificate request information

Options:
  -f, --filename <file>  use certificate request from local file
  -c, --clipboard        use certificate request from clipboard
  --json                 output machine-readable JSON instead of the formatted
                         report
  -h, --help             display help for command
```

---

In the example below, I copied the CSR into my clipboard and executed the
following command:

```shell
$ tls csr -c
Request (PEM):
-----BEGIN CERTIFICATE REQUEST-----
...
-----END CERTIFICATE REQUEST-----

  Subject
    CN  test.example.com
    O   Test Org
    C   DE

 ℹ certificate signing request
```

### tls `check`

This command lets you know if the intermediate certificate chain of a certain
remote hostname is correct/complete. It compares the intermediates served
during the TLS handshake against the chain resolved via AIA, matching them
by public key identity so that cross-signed variants of the same intermediate
(as distributed by CAs like Google) count as present. The command
exits with `0` if the chain is complete and `1` if it is not, so it can be
used in scripts and cronjobs:

```shell
$ tls check -h
Usage: tls check [options] [hostname]

check remote certificate chain

Arguments:
  hostname                      remote host[:port] to check

Options:
  -H, --hostname <host[:port]>  check certificate chain of remote hostname
  --json                        output machine-readable JSON instead of the
                                formatted report
  -h, --help                    display help for command
```

---

Show chain status from remote host "frd.mn":

```shell
$ tls check -H frd.mn
 ✔ frd.mn:443 — chain complete
```

An incomplete chain exits with `1`, names the missing intermediates and
links to SSL Labs for details:

```shell
$ tls check -H incomplete-chain.badssl.com
 ✖ incomplete-chain.badssl.com:443 — chain incomplete, 2 intermediates missing

    ✖ YR2
    ✖ Root YR

  ↳ https://www.ssllabs.com/ssltest/analyze.html?d=incomplete-chain.badssl.com:443&latest
```

### tls `match`

Check whether a certificate, a private key and/or a certificate signing
request belong to the same keypair, by comparing the SHA-256 hash of
their public keys (works for RSA, EC and Ed25519). Provide at least two
of the inputs; the command exits with `0` if they all match and `1` if
they do not:

```shell
$ tls match -h
Usage: tls match [options]

check that a certificate, private key and/or CSR share the same public key

Options:
  --crt <file>  certificate file to compare
  --key <file>  private key file to compare
  --csr <file>  certificate request file to compare
  --json        output machine-readable JSON instead of the formatted report
  -h, --help    display help for command
```

---

Verify that a certificate, its key and a CSR belong together before
deploying or submitting the request:

```shell
$ tls match --crt frd.mn.crt --key frd.mn.key --csr frd.mn.csr
  Certificate  frd.mn.crt  1dfc1605fbad358d
  Key          frd.mn.key  1dfc1605fbad358d
  Request      frd.mn.csr  1dfc1605fbad358d

 ✔ all inputs share the same public key
```

A mismatch shows the deviating hash in red and exits with `1`:

```shell
$ tls match --crt frd.mn.crt --key old.key
  Certificate  frd.mn.crt  1dfc1605fbad358d
  Key          old.key     a287ffab762cc69a

 ✖ inputs do not all share the same public key
```

# Development

```shell
npm install
npm run lint
npm test
```

The test suite runs fully offline: it spins up local TLS servers with
complete and incomplete chains plus a local AIA distribution point. Fixture
certificates can be regenerated with `test/fixtures/generate.sh`.

# Credits

* @[zakjan](https://github.com/zakjan/)'s
  [cert-chain-resolver](https://github.com/zakjan/cert-chain-resolver/),
  which inspired the native AIA chain resolution implemented here
