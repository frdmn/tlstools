TLStools
========

Command line tool to analyze, troubleshoot or inspect TLS certificates, requests or keys. Written in NodeJS.

* [`tls chain`](#tls-chain) - Attempt to fix an incomplete certificate chain
* [`tls check`](#tls-check) - Check completeness of remote certificate chain
* [`tls crt`](#tls-crt) - get renewal informations and the CRT (certificate) itself based on a host
* [`tls csr`](#tls-csr) - simple decypher and parse informations out a CSR (Certificate Sign Request)

# Requirements

* NodeJS

# Installation

```shell
npm install -g tlstools
```

# Usage

```shell
$ tls
Usage: tls [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  chain           attempt to fix incomplete certificate chain
  check           check remote certificate chain
  crt             display TLS information for given hostname
  csr             decode certificate request information
  help [command]  display help for command
```

## Sub commands

### tls `chain`

Attempt to fix an incomplete certificate chain based on an passed certficate.

```shell
$ tls chain -h
Usage: tls chain [options]

Options:

  -h, --help                    output usage information
  -f, --filename <file>         search certificate in file
  -H, --hostname <host[:port]>  use certificate from remote hostname
  -c, --clipboard               search certificate in clipboard
```

---

Assuming you have copied the certificate to check into your system clipboard:

```shell
$ tls chain -c
-----BEGIN CERTIFICATE-----
MIIDnzCCAyWgAwIBAgIQWyXOaQfEJlVm0zkMmalUrTAKBggqhkjOPQQDAzCBhTEL
MAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UE
BxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxKzApBgNVBAMT
IkNPTU9ETyBFQ0MgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkwHhcNMTQwOTI1MDAw
MDAwWhcNMjkwOTI0MjM1OTU5WjCBkjELMAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdy
ZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UEBxMHU2FsZm9yZDEaMBgGA1UEChMRQ09N
T0RPIENBIExpbWl0ZWQxODA2BgNVBAMTL0NPTU9ETyBFQ0MgRG9tYWluIFZhbGlk
YXRpb24gU2VjdXJlIFNlcnZlciBDQSAyMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD
QgAEAjgZgTrJaYRwWQKOqIofMN+83gP8eR06JSxrQSEYgur5PkrkM8wSzypD/A7y
ZADA4SVQgiTNtkk4DyVHkUikraOCAWYwggFiMB8GA1UdIwQYMBaAFHVxpxlIGbyd
nepBR9+UxEh3mdN5MB0GA1UdDgQWBBRACWFn8LyDcU/eEggsb9TUK3Y9ljAOBgNV
HQ8BAf8EBAMCAYYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHSUEFjAUBggrBgEF
BQcDAQYIKwYBBQUHAwIwGwYDVR0gBBQwEjAGBgRVHSAAMAgGBmeBDAECATBMBgNV
HR8ERTBDMEGgP6A9hjtodHRwOi8vY3JsLmNvbW9kb2NhLmNvbS9DT01PRE9FQ0ND
ZXJ0aWZpY2F0aW9uQXV0aG9yaXR5LmNybDByBggrBgEFBQcBAQRmMGQwOwYIKwYB
BQUHMAKGL2h0dHA6Ly9jcnQuY29tb2RvY2EuY29tL0NPTU9ET0VDQ0FkZFRydXN0
Q0EuY3J0MCUGCCsGAQUFBzABhhlodHRwOi8vb2NzcC5jb21vZG9jYTQuY29tMAoG
CCqGSM49BAMDA2gAMGUCMQCsaEclgBNPE1bAojcJl1pQxOfttGHLKIoKETKm4nHf
EQGJbwd6IGZrGNC5LkP3Um8CMBKFfI4TZpIEuppFCZRKMGHRSdxv6+ctyYnPHmp8
7IXOMCVZuoFwNLg0f+cB0eLLUg==
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIID0DCCArigAwIBAgIQQ1ICP/qokB8Tn+P05cFETjANBgkqhkiG9w0BAQwFADBv
MQswCQYDVQQGEwJTRTEUMBIGA1UEChMLQWRkVHJ1c3QgQUIxJjAkBgNVBAsTHUFk
ZFRydXN0IEV4dGVybmFsIFRUUCBOZXR3b3JrMSIwIAYDVQQDExlBZGRUcnVzdCBF
eHRlcm5hbCBDQSBSb290MB4XDTAwMDUzMDEwNDgzOFoXDTIwMDUzMDEwNDgzOFow
gYUxCzAJBgNVBAYTAkdCMRswGQYDVQQIExJHcmVhdGVyIE1hbmNoZXN0ZXIxEDAO
BgNVBAcTB1NhbGZvcmQxGjAYBgNVBAoTEUNPTU9ETyBDQSBMaW1pdGVkMSswKQYD
VQQDEyJDT01PRE8gRUNDIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MHYwEAYHKoZI
zj0CAQYFK4EEACIDYgAEA0d7L3XJghWF+3XkkRbUq2KZ9T5SCwbOQQB/l+EKJDwd
AQTuPdKNCZcM4HXk+vt3iir1A2BLNosWIxatCXH0SvQoULT+iBxuP2wvLwlZW6Vb
CzOZ4sM9iflqLO+y0wbpo4H+MIH7MB8GA1UdIwQYMBaAFK29mHo0tCb3+sQmVO8D
veAky1QaMB0GA1UdDgQWBBR1cacZSBm8nZ3qQUfflMRId5nTeTAOBgNVHQ8BAf8E
BAMCAYYwDwYDVR0TAQH/BAUwAwEB/zARBgNVHSAECjAIMAYGBFUdIAAwSQYDVR0f
BEIwQDA+oDygOoY4aHR0cDovL2NybC50cnVzdC1wcm92aWRlci5jb20vQWRkVHJ1
c3RFeHRlcm5hbENBUm9vdC5jcmwwOgYIKwYBBQUHAQEELjAsMCoGCCsGAQUFBzAB
hh5odHRwOi8vb2NzcC50cnVzdC1wcm92aWRlci5jb20wDQYJKoZIhvcNAQEMBQAD
ggEBAB3H+i5AtlwFSw+8VTYBWOBTBT1k+6zZpTi4pyE7r5VbvkjI00PUIWxB7Qkt
nHMAcZyuIXN+/46NuY5YkI78jG12yAA6nyCmLX3MF/3NmJYyCRrJZfwE67SaCnjl
lztSjxLCdJcBns/hbWjYk7mcJPuWJ0gBnOqUP3CYQbNzUTcp6PYBerknuCRR2RFo
1KaFpzanpZa6gPim/a5thCCuNXZzQg+HCezF3OeTAyIal+6ailFhp5cmHunudVEI
kAWvL54TnJM/ev/m6+loeYyv4Lb67psSE/5FjNJ80zXrIRKT/mZ1JioVhCb3ZsnL
jbsJQdQYr7GzEPUQyp2aDrV1aug=
-----END CERTIFICATE-----

 ✔ Successfully fixed intermediate chain from clipboard
```

### tls `crt`

Decode certificate informations.

```shell
$ tls crt -h
Usage: tls crt [options]

Options:

  -h, --help                    output usage information
  -f, --filename <file>         search certificate in file
  -H, --hostname <host[:port]>  use certificate from remote hostname
  -c, --clipboard               search certificate in clipboard
```

---

Show certificate informations from remote host "frd.mn":

```shell
$ tls crt frd.mn
-----BEGIN CERTIFICATE-----
MIIGLzCCBdagAwIBAgIQH3be7EHzH3zHdBvhyXC4wDAKBggqhkjOPQQDAjCBkjEL
MAkGA1UEBhMCR0IxGzAZBgNVBAgTEkdyZWF0ZXIgTWFuY2hlc3RlcjEQMA4GA1UE
BxMHU2FsZm9yZDEaMBgGA1UEChMRQ09NT0RPIENBIExpbWl0ZWQxODA2BgNVBAMT
L0NPTU9ETyBFQ0MgRG9tYWluIFZhbGlkYXRpb24gU2VjdXJlIFNlcnZlciBDQSAy
MB4XDTE1MDkyNjAwMDAwMFoXDTE1MTIzMDIzNTk1OVowazEhMB8GA1UECxMYRG9t
YWluIENvbnRyb2wgVmFsaWRhdGVkMSEwHwYDVQQLExhQb3NpdGl2ZVNTTCBNdWx0
aS1Eb21haW4xIzAhBgNVBAMTGnNuaTMzMjgwLmNsb3VkZmxhcmVzc2wuY29tMFkw
EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE/VVyjyzoogarRb9sqmpqwwAf+Kh69I9E
5NeT/1s9nVjvEzYTnrEN3xqNrzbA/y61AbJ6Yy714OCq1ViAmBuCPaOCBDIwggQu
MB8GA1UdIwQYMBaAFEAJYWfwvINxT94SCCxv1NQrdj2WMB0GA1UdDgQWBBT1uV7H
fwV8Ca9MxjAiSHOEyE9EVDAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAd
BgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwTwYDVR0gBEgwRjA6BgsrBgEE
AbIxAQICBzArMCkGCCsGAQUFBwIBFh1odHRwczovL3NlY3VyZS5jb21vZG8uY29t
L0NQUzAIBgZngQwBAgEwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5jb21v
ZG9jYTQuY29tL0NPTU9ET0VDQ0RvbWFpblZhbGlkYXRpb25TZWN1cmVTZXJ2ZXJD
QTIuY3JsMIGIBggrBgEFBQcBAQR8MHowUQYIKwYBBQUHMAKGRWh0dHA6Ly9jcnQu
Y29tb2RvY2E0LmNvbS9DT01PRE9FQ0NEb21haW5WYWxpZGF0aW9uU2VjdXJlU2Vy
dmVyQ0EyLmNydDAlBggrBgEFBQcwAYYZaHR0cDovL29jc3AuY29tb2RvY2E0LmNv
bTCCAnkGA1UdEQSCAnAwggJsghpzbmkzMzI4MC5jbG91ZGZsYXJlc3NsLmNvbYIT
Ki4xMDAxY29ja3RhaWxzLmNvbYIRKi4xMDAxbW90ZXVycy5jb22CEiouYWxpZml0
emdlcmFsZC5tZYINKi5hbGlrZml0ei5tZYINKi5ib3J1dC5wYXJ0eYINKi5lbGth
c3NhLmNvbYIIKi5mcmQubW6CGyouZy1hbmQtYy1lbGVjdHJvbmljcy5jby51a4IJ
Ki5naGFjLmRlgg4qLmtub3R0Ym95cy5ldYIaKi5tb250Z29tZXJ5dm9jYWxjb2Fj
aC5jb22CDioubW96YWlrLmNvLmlkggsqLm1vemFpay5pZIIKKi5uZXdlci5jY4IW
Ki5wZXJzb25hbGl6YXJibG9nLmNvbYIUKi5zd2FnZG9nd2Fsa2luZy5jb22CGSou
dGhlZ29sZGVuYW5kY29tcGFueS5jb22CETEwMDFjb2NrdGFpbHMuY29tgg8xMDAx
bW90ZXVycy5jb22CEGFsaWZpdHpnZXJhbGQubWWCC2FsaWtmaXR6Lm1lggtib3J1
dC5wYXJ0eYILZWxrYXNzYS5jb22CBmZyZC5tboIZZy1hbmQtYy1lbGVjdHJvbmlj
cy5jby51a4IHZ2hhYy5kZYIMa25vdHRib3lzLmV1ghhtb250Z29tZXJ5dm9jYWxj
b2FjaC5jb22CDG1vemFpay5jby5pZIIJbW96YWlrLmlkgghuZXdlci5jY4IUcGVy
c29uYWxpemFyYmxvZy5jb22CEnN3YWdkb2d3YWxraW5nLmNvbYIXdGhlZ29sZGVu
YW5kY29tcGFueS5jb20wCgYIKoZIzj0EAwIDRwAwRAIgZzfbzLiht8LIcEwvCKIj
xRC5hF3mcVUzAYMTsAp+PWoCIBCaOZvgDR0t7tCijM6o5N3vNHDs0vQbtQkEaQSx
/j9A
-----END CERTIFICATE-----

Host/port: frd.mn:443
Start date: Sat Sep 26 2015 02:00:00 GMT+0200 (CEST)
End date: Thu Dec 31 2015 00:59:59 GMT+0100 (CET)
Remaining days: 96
✔ Successfully parsed information
```

### tls `csr`

Decode and display information from certificate sign requests.

```shell
$ tls csr -h
Usage: tls csr [options]

Options:

  -h, --help             output usage information
  -f, --filename <file>  search CRT or CSR in file
  -c, --clipboard        search CSR in clipboard
```

---

In the example below, I copied the CSR into my clipboard and executed the following command:

```shell
$ tls csr -c
Certificate Request:
-----BEGIN CERTIFICATE REQUEST-----
MIIC+jCCAeICAQAwgbQxCzAJBgNVBAYTAkRFMRAwDgYDVQQIDAdCYXZhcmlhMRMw
EQYDVQQHDApFaWJlbHN0YWR0MSUwIwYDVQQKDBxZRUFIV0hBVD8hIE1pbmVjcmFm
dCBzZXJ2ZXJzMRQwEgYDVQQLDAtNYWlsIHN5c3RlbTEcMBoGA1UEAwwTY2hld2Jh
Y2NhLnllYWh3aC5hdDEjMCEGCSqGSIb3DQEJARYUcG9zdG1hc3RlckB5ZWFod2gu
YXQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDAi9mSsi01EDc3QMCL
lreBVzDSsICIc8w4mttgSg+cW/Hl98iDZ/awyv0hEeXLg/rybR42LHCRXyJbiuV8
edOGbYN5ODD3di5tOmzjgJm34gmSxuzzZSe6431C9nR0BJaPwGbBoFqBO5MiWD1i
Z7Cv3a+xJQO0gN+3PIgSMOGAD608bqJN58ewtqqYY0xM3vQCEcf40TJJc8fv1+a5
1BM07s26L0Az5xZeIcWOqBgvBQhY0dI3QEKW5BbQDVA/OFilpbJFqCseosjz0/YG
tS46CHGjNuViAcxeJ/IWKRWB3TCd2KhIqaEZLCVTWPqCaQ7CioITgrQW+c/qVCfv
to6xAgMBAAGgADANBgkqhkiG9w0BAQsFAAOCAQEAu8gxx8RrQPeWvKJiY3fmTNHg
lEDQU2vTPU+56UZEuCVztj1LdmjzFpH6biFa+C2XxkTxfeXc9OakklWlIgfP7b2Y
RTObWPcpyDSE+yB79Lhybb4Wr3vASJJWSgwqymp5BjEj0iHeVFzvippvvyPieafr
a31cPiG5UbOWOXpeZ73K1qBqmpRglzYouqWPA0D9e9wks71INhPL8wODRha2RZ9M
voaVZHsm6NB+WAZzK+wznc1wLs/mVigqfjakU//VXi8opb7hTkH1/8h8Pn5uCFM7
3UcTESfcIv3XuKeLXKQEJZtR3PQlWDb+pI7x1iUm7k0Q1KXsYysdUzq/fGTSdw==
-----END CERTIFICATE REQUEST-----
Key size: 2048 bit
Subject:
 - C: DE
 - ST: Bavaria
 - L: Eibelstadt
 - O: YEAHWHAT?! Minecraft servers
 - OU: Mail system
 - CN: chewbacca.yeahwh.at
 - emailAddress: postmaster@yeahwh.at
 ✔ Successfully decoded information from clipboard
```

### tls `check`

This command lets you know if the intermediate certificate chain of a certain remote hostname is correct/complete.

```shell
$ tls check -h
Usage: tls check [options]

Options:
  -H, --hostname <host[:port]>  use certificate from remote hostname
  -h, --help                    display help for command
```

---

Show chain status from remote host "frd.mn":

```shell
$ tls check -H frd.mn
 ✔ Intermediate chain "frd.mn:443" seems to be complete/correct
```

# Credits

* @[zakjan](https://github.com/zakjan/) for the [`cert-chain-resolver.sh`](vendor/cert-chain-resolver.sh) shell script:
https://github.com/zakjan/cert-chain-resolver/
