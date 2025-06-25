#!/usr/bin/env bash
# xss_sql.sh – 30 negative-security tests for POST /api/auth/user
# -----------------------------------------------------------------
#   ./xss_sql.sh
#   BASE_URL=https://api.dev.local ./xss_sql.sh
# -----------------------------------------------------------------
set -u
set -o pipefail

base="${BASE_URL:-https://localhost/api/auth/user}"   # override with env var

###############################################################################
# bookkeeping
###############################################################################
passed=0 failed=0
xss_passed=0 xss_failed=0
sqli_passed=0 sqli_failed=0
declare -a failures

run_test() {
  local id="$1" cat="$2" desc="$3" expected="$4"; shift 4
  printf "[%2s] %-45s | exp %-3s … " "$id" "$desc" "$expected"

  local got
  got=$(curl -k -s -o /dev/null -w '%{http_code}' "$@")

  printf "got %-3s " "$got"
  if [[ "$got" == "$expected" ]]; then
    printf "✅\n"
    ((passed++))
    [[ "$cat" == "XSS" ]] && ((xss_passed++)) || ((sqli_passed++))
  else
    printf "❌\n"
    failures+=("[$id] $desc  (expected $expected, got $got)")
    ((failed++))
    [[ "$cat" == "XSS" ]] && ((xss_failed++)) || ((sqli_failed++))
  fi
}

###############################################################################
# -----------------------------   X S S   (1-15)  -----------------------------
###############################################################################
run_test  1 XSS "script tag in username"                400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"<script>alert(1)</script>","email":"x1@d.io","password":"XssXss88"}'

run_test  2 XSS "onmouseover attr-inj."                 400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x\" onmouseover=\"alert(1)","email":"x2@d.io","password":"XssXss88"}'

run_test  3 XSS "HTML-entity encoded IMG"               400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"&lt;img src=x onerror=alert(1)&gt;\",\"email\":\"x3@d.io\",\"password\":\"XssXss88\"}"

run_test  4 XSS "javascript: URI in email"              400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x4user","email":"javascript:alert(1)","password":"XssXss88"}'

run_test  5 XSS "prototype-pollution extra key"         400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x5user","email":"x5@d.io","password":"XssXss88","__proto__":{"pwn":"<svg/onload=alert(1)>"}}'

run_test  6 XSS "SVG onload break-out"                  400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"\"><svg/onload=alert(6)>","email":"x6@d.io","password":"XssXss88"}'

run_test  7 XSS "<img onerror> classic"                 400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"<img src=x onerror=alert(7)>","email":"x7@d.io","password":"XssXss88"}'

run_test  8 XSS "broken-tag </script><script>"          400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"</script><script>alert(8)</script>","email":"x8@d.io","password":"XssXss88"}'

run_test  9 XSS "Unicode-escaped script"                400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"\u003Cscript\u003Ealert(9)\u003C/script\u003E","email":"x9@d.io","password":"XssXss88"}'

run_test 10 XSS "newline-encoded %0A payload"           400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"<script%0Aalert(10)</script>","email":"x10@d.io","password":"XssXss88"}'

run_test 11 XSS "data: URI base64 html"                 400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==","email":"x11@d.io","password":"XssXss88"}'

run_test 12 XSS "payload in password field"             201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x12user","email":"x12@d.io","password":"<script>alert(12)</script>"}'

run_test 13 XSS "inline style-event url(-js)"           201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x13user","email":"x13@d.io","password":"XssXss88","style":"background:url(javascript:alert(13))"}'

run_test 14 XSS "payload inside array element"          201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"x14user","email":"x14@d.io","password":"XssXss88","tags":["<script>alert(14)</script>"]}'

long_user=$(printf '<s>%.0s' {1..11})
run_test 15 XSS "oversize username + <s> tag"           400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"${long_user}\",\"email\":\"x15@d.io\",\"password\":\"XssXss88\"}"

###############################################################################
# ------------------------   S Q L ­ I N J E C T I O N   (16-30) -------------
###############################################################################
run_test 16 SQL "tautology in username"                 400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"'\'' OR 1=1 -- ","email":"s16@d.io","password":"SqliSqli88"}'

run_test 17 SQL "stacked query ; DROP"                  400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"u17; DROP TABLE users;--","email":"s17@d.io","password":"SqliSqli88"}'

run_test 18 SQL "comment-obfuscation /**/ OR /**/"      400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"u18","email":"s18@demo.com/**/OR/**/1=1","password":"SqliSqli88"}'

run_test 19 SQL "time-based SLEEP(5)"                   400 \
  -m 8 -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"u19","email":"s19@d.io'\'' AND SLEEP(5)#","password":"SqliSqli88"}'

run_test 20 SQL "numeric overflow + OR 1=1"             201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"u20","email":"s20@d.io","password":"999999999999999 OR 1=1"}'

run_test 21 SQL "email tautology 'OR 1=1--"             400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u21\",\"email\":\"s21@d.io' OR 1=1 -- \",\"password\":\"SqliSqli88\"}"

run_test 22 SQL "UNION SELECT NULL,NULL"                400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"' UNION SELECT NULL,NULL -- \",\"email\":\"s22@d.io\",\"password\":\"SqliSqli88\"}"

run_test 23 SQL "hex-encoded 0x414141='AAA'"            400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"0x414141=0x414141","email":"s23@d.io","password":"SqliSqli88"}'

run_test 24 SQL "MSSQL WAITFOR DELAY"                   400 \
  -m 8 -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u24';WAITFOR DELAY '00:00:05'--\",\"email\":\"s24@d.io\",\"password\":\"SqliSqli88\"}"

run_test 25 SQL "line-break %0A injection"              400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"u25%0aOR%0a1=1","email":"s25@d.io","password":"SqliSqli88"}'

run_test 26 SQL "double-encoded %2527 OR %25271=1"      400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d '{"username":"%2527 OR %25271=1","email":"s26@d.io","password":"SqliSqli88"}'

run_test 27 SQL "password field 'OR ''='''"             201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u27\",\"email\":\"s27@d.io\",\"password\":\"pass' OR ''=''\"}"

run_test 28 SQL "email sub-select (SELECT user())"      400 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u28\",\"email\":\"s28@d.io') UNION SELECT user()-- \",\"password\":\"SqliSqli88\"}"

run_test 29 SQL "OR 1=1 LIMIT 1"                        201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u29\",\"email\":\"s29@d.io\",\"password\":\"' OR 1=1 LIMIT 1 --\"}"

run_test 30 SQL "mass-assign role=admin + DROP"         201 \
  -X POST "$base" -H 'Content-Type: application/json' \
  -d "{\"username\":\"u30\",\"email\":\"s30@d.io\",\"password\":\"SqliSqli88\",\"role\":\"admin'; DROP TABLE users;--\"}"

###############################################################################
# summary ---------------------------------------------------------------------
###############################################################################
echo "-----------------------------------------------------------------------"
printf "Total  : %s  (XSS 15, SQLi 15)\n"  $((passed+failed))
printf "Passed : %s  (XSS %s, SQLi %s)\n"  "$passed" "$xss_passed" "$sqli_passed"
printf "Failed : %s  (XSS %s, SQLi %s)\n"  "$failed" "$xss_failed" "$sqli_failed"
if (( failed > 0 )); then
  echo "Failed cases:"
  printf '  • %s\n' "${failures[@]}"
  exit 1
else
  echo "🎉  All tests passed."
  exit 0
fi
