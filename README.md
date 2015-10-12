SSLtools
========

A bunch of Bash scripts to help analyze, troubleshoot or inspect SSL certificates, requests or keys:

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

### ssl `csr`

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
