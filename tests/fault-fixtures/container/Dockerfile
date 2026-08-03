FROM alpine:3.18.0@sha256:02bb6f428431fbc2809c5d1b41eab5a68350194fb508869a33cb1af4444c9b11

# Positive-control image only. The fault workflow scans this image but must
# never run it, publish it, or use it in a Terraform input.
USER 65534:65534
ENTRYPOINT ["/bin/false"]
