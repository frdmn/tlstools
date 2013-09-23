ssltools 
========

A bunch of Bash tools to analyze, troubleshoot or inspect SSL certificates, requests or keys:

* `sslcsr` - to simple decypher and parse informations out of a CSR (Certificate Sign Request)

# Installation

    cd /tmp
    git clone https://github.com/frdmn/ssltools.git
    mv ssltools/bin/ssl* /usr/bin/
    chmod +x /usr/bin/ssl* 

# Usage

### sslcsr

1. Copy the CSR that you want to decrypt into your clipboard. _(optional)_
1. Run the bash script with `sslcsr`
1. If you don't have a CSR in your clipboard __sslcsr__ will ask you for the actual CSR
1. Output should look like:
  
##

    $ ./sslcsr  
    commonName: www.frd.mn  
    organizationalUnitName: Blog  
    organizationName: Jonas Friedmann  
    localityName: Wuerzburg  
    stateOrProvinceName: Bayern  
    countryName: DE  
    emailAddress: j@frd.mn  

