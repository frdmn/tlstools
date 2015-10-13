SSLtools
========

A bunch of Bash scripts to help analyze, troubleshoot or inspect SSL certificates, requests or keys:

* `ssl chain` - Attempt to fix an incomplete certificate chain
* `ssl csr` - simple decypher and parse informations out a CSR (Certificate Sign Request)
* `ssl host` - get renewal informations and the CRT (certificate) itself based on a host

# Installation

```shell
cd /usr/local/src
git clone git://github.com/frdmn/ssltools.git
cd ssltools
ln -s /usr/local/src/ssltools/ssl /usr/local/bin/ssl
```

# Usage

```shell
Usage: $ ssl [OPTION] [COMMAND]...

Description of this script.

 Options:
  -q, --quiet       Quiet (no output)
  -v, --verbose     Output more
  -h, --help        Display this help and exit
      --version     Output version information and exit

 Available commands:
  chain             Try to fix an incomplete intermediate chain
  csr               Decode certificate request in cliboard
  host [host]       Try to parse relevant certificate informations

  Run "ssl [command] -h" for further information
```

1. Copy the CRT where you need the chain from into your clipboard. _(optional)_
1. Run the script: `ssl chain`
1. Output should look like this:

```shell
$ ssl chain  
 ✔  Successfuly fixed intermediate chain:
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
-----END CERTIFICATE----
```

### ssl `chain`

```shell
Usage: $ ssl host [HOST] <PORT>

 Attempt to fix an incomplete certificate chain based on an input CRT.

```

1. Run the bash script with `ssl chain <hostname>`
1. Output should look like:

```shell
$ ssl host git.frd.mn
-----BEGIN CERTIFICATE-----
MIIDPDCCAiQCCQCMdIDa4khx8DANBgkqhkiG9w0BAQUFADBgMQswCQYDVQQGEwJE
RTEPMA0GA1UECBMGQmF5ZXJuMRMwEQYDVQQHEwpFaWJlbHN0YWR0MRIwEAYDVQQK
Ewl5ZWFod2guYXQxFzAVBgkqhkiG9w0BCQEWCGpAZnJkLm1uMB4XDTEzMDYyNzEx
MTk1N1oXDTE0MDYyNzExMTk1N1owYDELMAkGA1UEBhMCREUxDzANBgNVBAgTBkJh
eWVybjETMBEGA1UEBxMKRWliZWxzdGFkdDESMBAGA1UEChMJeWVhaHdoLmF0MRcw
FQYJKoZIhvcNAQkBFghqQGZyZC5tbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBANOguiBBMcPaoAxOIb9gBVGMA5/+GC5QBkfkh135j8STcl1NOT0OFLIJ
pQYFohBWMWa6D4+7BkDSWbBCA05W5flm73yAGst8L8zy6eO9aVYKdt/9gMvwPFYz
vC/FuqyY0DBQJRdz9m/SOz3jluDLks0FdIJBtldXmLz27de3DNL35/1JtN12/7+z
4KL/VVj3RD3HQ5klanqzROaca7wN10qjsehqVW9/PiER2gmLT5Xa9GU1hFSDlVKu
oocRUNyO8fqFA1Yed7RbYPrXmroZS7vltEeN7t9U4WQsA8t+xAbxW6N7CSwHPQUP
wh3luBZhXUxedu9beHv5d58YK0gYm7sCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEA
vHX0n9BmZLZ+g08MUAyuM4YnpqHQRyhNkfJJDoz5SJrt7Lg1FgLv4ZjQrSM81Ho8
jBzqaOpUTp/f46w/2/mepJZvewd+yv9oJYfFQBFPow9esVjfhB+RH3BnbTWQLHyi
lOYbjcbEidIonPLR9raYLKBKisVxx6oXhuJsOLPhUkxVslF4DqT3EZQShHYN376N
MWFrC/hTHe5NEaITZ6lZfz8OKx1P74ucNSuXOY6YMuT/mukartS2Pu3QUscFghHG
NVG9atsZL3EOAhK4bmAXMyIyF88dsR/VL8h2CRh1qY8vkZP1wfZjOgWYOZTfwc3+
k7ZNe3qfHSvjjXaHlD+XFg==
-----END CERTIFICATE-----

Host / Port: git.frd.mn:443
Start date: Jun 27 11:19:57 2013 GMT
End date: Jun 27 11:19:57 2014 GMT
Days left: 276
```

### ssl `csr`

```shell
Usage: $ ssl csr

 Parse a TLS certificate sign request from your clipboard and show
 encoded informations as plain text.
 ```

1. Copy the CSR that you want to decrypt into your clipboard. _(optional)_
1. Run the bash script with `ssl csr`
1. If you don't have a CSR in your clipboard, it'll will ask you for the actual CSR
1. Output should look like this:

```shell
$ ssl csr  
commonName: www.frd.mn  
organizationalUnitName: Blog  
organizationName: Jonas Friedmann  
localityName: Wuerzburg  
stateOrProvinceName: Bayern  
countryName: DE  
emailAddress: j@frd.mn  
```

### ssl `host`

```shell
Usage: $ ssl host [HOST] <PORT>

 Display certificate of given [HOST] and show remaining expiration
 date.

 Options:
  -c, --only-cert          Only display the certificate
  -i, --only-information   Only display the CRT information
```

1. Run the bash script with `ssl host <hostname>`
1. Output should look like:

```shell
$ ssl host git.frd.mn
-----BEGIN CERTIFICATE-----
MIIDPDCCAiQCCQCMdIDa4khx8DANBgkqhkiG9w0BAQUFADBgMQswCQYDVQQGEwJE
RTEPMA0GA1UECBMGQmF5ZXJuMRMwEQYDVQQHEwpFaWJlbHN0YWR0MRIwEAYDVQQK
Ewl5ZWFod2guYXQxFzAVBgkqhkiG9w0BCQEWCGpAZnJkLm1uMB4XDTEzMDYyNzEx
MTk1N1oXDTE0MDYyNzExMTk1N1owYDELMAkGA1UEBhMCREUxDzANBgNVBAgTBkJh
eWVybjETMBEGA1UEBxMKRWliZWxzdGFkdDESMBAGA1UEChMJeWVhaHdoLmF0MRcw
FQYJKoZIhvcNAQkBFghqQGZyZC5tbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBANOguiBBMcPaoAxOIb9gBVGMA5/+GC5QBkfkh135j8STcl1NOT0OFLIJ
pQYFohBWMWa6D4+7BkDSWbBCA05W5flm73yAGst8L8zy6eO9aVYKdt/9gMvwPFYz
vC/FuqyY0DBQJRdz9m/SOz3jluDLks0FdIJBtldXmLz27de3DNL35/1JtN12/7+z
4KL/VVj3RD3HQ5klanqzROaca7wN10qjsehqVW9/PiER2gmLT5Xa9GU1hFSDlVKu
oocRUNyO8fqFA1Yed7RbYPrXmroZS7vltEeN7t9U4WQsA8t+xAbxW6N7CSwHPQUP
wh3luBZhXUxedu9beHv5d58YK0gYm7sCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEA
vHX0n9BmZLZ+g08MUAyuM4YnpqHQRyhNkfJJDoz5SJrt7Lg1FgLv4ZjQrSM81Ho8
jBzqaOpUTp/f46w/2/mepJZvewd+yv9oJYfFQBFPow9esVjfhB+RH3BnbTWQLHyi
lOYbjcbEidIonPLR9raYLKBKisVxx6oXhuJsOLPhUkxVslF4DqT3EZQShHYN376N
MWFrC/hTHe5NEaITZ6lZfz8OKx1P74ucNSuXOY6YMuT/mukartS2Pu3QUscFghHG
NVG9atsZL3EOAhK4bmAXMyIyF88dsR/VL8h2CRh1qY8vkZP1wfZjOgWYOZTfwc3+
k7ZNe3qfHSvjjXaHlD+XFg==
-----END CERTIFICATE-----

Host / Port: git.frd.mn:443
Start date: Jun 27 11:19:57 2013 GMT
End date: Jun 27 11:19:57 2014 GMT
Days left: 276
```
